const { validationResult } = require('express-validator');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendRegistrationEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { firstName, lastName, email, age, eventTitle } = req.body;

    let transaction;

    try {
        transaction = await sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });

        // Load events data
        const eventsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../../data/events.json'), 'utf8')
        );

        const eventData = eventsData.find(e => e.title === eventTitle);

        if (!eventData) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Invalid event selected.'
            });
        }

        const parsedDate = eventData.countdownDate ? new Date(eventData.countdownDate) : null;
        if (!parsedDate || isNaN(parsedDate)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Event date is invalid.'
            });
        }

        // 1. Find or create user
        const [user] = await User.findOrCreate({
            where: { email },
            defaults: { firstName, lastName, age },
            transaction
        });

        // 2. Find event with row-level lock
        let event = await Event.findOne({
            where: { title: eventTitle },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!event) {
            event = await Event.create({
                title: eventTitle,
                date: parsedDate,
                location: eventData.location,
                capacity: eventData.capacity || 100
            }, { transaction });
        } else {
            await event.update({
                date: parsedDate,
                location: eventData.location
            }, { transaction });
        }

        // 3. Check capacity atomically (row locked)
        if (event.registeredCount >= event.capacity) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Event is at full capacity.'
            });
        }

        // 4. Create registration (DB must enforce unique constraint on UserId + EventId)
        let registration;
        try {
            registration = await Registration.create({
                UserId: user.id,
                EventId: event.id
            }, { transaction });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: 'You are already registered for this event.'
                });
            }
            throw err;
        }

        // 5. Update event registeredCount atomically
        await event.increment('registeredCount', { by: 1, transaction });

        await transaction.commit();

        // 6. Send confirmation email (async, don't block response)
        sendRegistrationEmail(user, event).catch(err =>
            console.error('Email failed:', err)
        );

        res.status(201).json({
            status: 'success',
            message: 'Successfully registered for ' + event.title,
            data: { registrationId: registration.id }
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        next(error);
    }
};

module.exports = { register };
