const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);

    // Save to MongoDB Atlas
    const emailLog = new EmailLog({ to, subject, text });
    await emailLog.save();

    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
};

module.exports = { sendEmail };
