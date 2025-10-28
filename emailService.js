// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: "SujaLuxe : One-Time Password (OTP)",
    html: `
      <h2>Your OTP Code</h2>
      <p>Use this code to verify your email:</p>
      <h1 style="color:#2e86de;">${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP sent to ${to}`);
}

module.exports = { sendOtpEmail };
