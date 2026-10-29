
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send a reusable email
async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
  attachments,
}) {
  return transporter.sendMail({
    from: `"CrowFunding Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo,
    attachments,
  });
}

module.exports = { sendEmail };
