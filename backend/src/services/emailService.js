const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('Email environment variables are not properly configured.');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

transporter.verify()
  .then(() => console.log('Email server ready'))
  .catch((err) => {
    console.error('Email server misconfigured:', err);
    process.exit(1);
  });

const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );

const sendRegistrationEmail = async (user, event) => {
  const safeFirstName = escapeHtml(user.firstName);
  const safeLastName = escapeHtml(user.lastName);
  const safeEventTitle = escapeHtml(event.title);
  const safeLocation = escapeHtml(event.location || 'Online');

  const mailOptions = {
    from: `"Pixel Phantoms" <${process.env.EMAIL_FROM || 'noreply@pixelphantoms.com'}>`,
    to: user.email,
    subject: `Registration Confirmed: ${safeEventTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00aaff, #0088cc); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Pixel Phantoms</h1>
          <p style="margin: 5px 0 0; font-size: 1.1rem;">Registration Confirmed!</p>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hi <strong>${safeFirstName} ${safeLastName}</strong>,</p>
          <p>Thank you for registering for <strong>${safeEventTitle}</strong>. We're excited to have you join us!</p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>Event Details:</strong></p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">📅 <strong>Date:</strong></span>
              <span>${new Date(event.date).toLocaleDateString()}</span>
            </p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">🕒 <strong>Time:</strong></span>
              <span>${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">📍 <strong>Venue:</strong></span>
              <span>${safeLocation}</span>
            </p>
          </div>
          <p>Please keep this email for your records. If you have any questions, feel free to contact the core committee.</p>
          <p>See you there!</p>
          <p>Best regards,<br>The Pixel Phantoms Team</p>
        </div>
        <div style="background: #eee; padding: 15px; text-align: center; font-size: 0.8rem; color: #777;">
          &copy; ${new Date().getFullYear()} Pixel Phantoms. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent:', info.messageId);

    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    return false;
  }
};

module.exports = { sendRegistrationEmail };
