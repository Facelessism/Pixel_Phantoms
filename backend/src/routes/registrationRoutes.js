const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register } = require('../controllers/registrationController');

const router = express.Router();

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

const registrationValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required.')
        .isLength({ min: 2, max: 30 }).withMessage('First name must be between 2 and 30 characters.')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('First name must contain only valid characters.')
        .escape(),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required.')
        .isLength({ min: 2, max: 30 }).withMessage('Last name must be between 2 and 30 characters.')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/).withMessage('Last name must contain only valid characters.')
        .escape(),

    body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),

    body('age')
        .trim()
        .toInt()
        .isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100.'),

    body('eventTitle')
        .trim()
        .notEmpty().withMessage('Event title is required.')
        .isLength({ max: 100 }).withMessage('Event title cannot exceed 100 characters.')
        .escape()
];

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/register', registerLimiter, registrationValidation, handleValidation, register);

module.exports = router;
