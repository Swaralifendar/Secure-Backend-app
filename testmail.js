require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Step 2: Define email options
const mailOptions = {
  from: 'swaralifendar@gmail.com',         // Sender address
  to: 'fendarswarali@gmail.com',          // Recipient's email address
  subject: 'Test Email from Nodemailer',// Email subject
  text: 'Hello! This is a test email sent using Nodemailer with Gmail App Password.' // Email body
};

// Step 3: Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error sending email:', error);
  } else {
    console.log('✅ Email sent successfully:', info.response);
  }
});




// transporter.verify(function(error, success) {
//     if (error) {
//         console.log('❌ Email Transport Error:', error);
//     } else {
//         console.log('✅ Email server is ready to take messages');
//     }
// });
