require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Crowdfunding Email Test",
    text: "Nodemailer is working successfully!",
  });

  console.log("Email sent successfully");
}

sendTestEmail().catch(console.error);