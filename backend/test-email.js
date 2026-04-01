require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("Transporter Verify Error:", error);
  } else {
    console.log("Server is ready to take our messages");
    
    // Also try to send one to yourself
    transporter.sendMail({
      from: `"BookEase" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // sending it to myself to check if it actually lands
      subject: "Test email",
      text: "Test"
    }, (err, info) => {
      if (err) console.error("Send Error:", err);
      else console.log("Sent successfully:", info.response);
      process.exit();
    });
  }
});
