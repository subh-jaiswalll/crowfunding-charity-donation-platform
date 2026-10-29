const PDFDocument = require("pdfkit");

const Subscriber = require("../models/SubscriberModel.js");
const User = require("../models/userModel.js");
const Donation = require("../models/donationModel.js");
const NGO = require("../models/NgoModel.js");

const { sendEmail } = require("../services/emailService.js");

// =====================================
// 1. NEWSLETTER SUBSCRIPTION
// =====================================
exports.subscribe = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const existingSubscriber = await Subscriber.findOne({
      where: { email },
    });

    if (existingSubscriber) {
      return res.status(409).json({
        message: "This email is already subscribed.",
      });
    }

    const subscriber = await Subscriber.create({ email });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to CrowFunding Updates!",
        text: "Thank you for subscribing! We will share charity news, new NGO updates, and upcoming events with you.",
      });
    } catch (emailError) {
      console.error("Subscription email error:", emailError.message);
    }

    return res.status(201).json({
      message: "Successfully subscribed to charity updates!",
      subscriberId: subscriber.id,
    });
  } catch (error) {
    console.error("Subscription error:", error);

    return res.status(500).json({
      message: "Unable to subscribe. Please try again.",
    });
  }
};

// =====================================
// 2. CONTACT US
// =====================================
exports.contact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (!process.env.EMAIL_USER) {
      return res.status(500).json({
        message: "Support email is not configured.",
      });
    }

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `Contact Us: ${subject.trim()}`,
      text: `
Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}

Message:
${message.trim()}
      `,
      replyTo: email.trim(),
    });

    return res.status(200).json({
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact email error:", error);

    return res.status(500).json({
      message: "Unable to send your message. Please try again later.",
    });
  }
};

// =====================================
// 3. GENERATE DONATION RECEIPT PDF
// =====================================
function generateReceiptPDF(donation, ngo) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text("CrowFunding", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(18).text("Donation Receipt", {
      align: "center",
    });

    doc.moveDown(2);
    doc.fontSize(12);

    doc.text(`Receipt Number: DON-${donation.id}`);
    doc.text(
      `Donation Date: ${new Date(donation.createdAt).toLocaleDateString("en-IN")}`,
    );
    doc.text(`Charity: ${ngo?.name || "Charity"}`);
    doc.text(`Donation Amount: INR ${Number(donation.amount).toFixed(2)}`);
    doc.text(`Payment ID: ${donation.razorpayPaymentId || "N/A"}`);
    doc.text("Payment Status: PAID");

    doc.moveDown(2);

    doc.text("Thank you for supporting this charitable cause.");

    doc.end();
  });
}

// =====================================
// 4. EMAIL RECEIPT TO DONOR
// Called by verifyPayment after payment is verified.
// =====================================
exports.sendDonationReceiptEmail = async (donationId) => {
  const donation = await Donation.findOne({
    where: {
      id: donationId,
      status: "PAID",
    },
  });

  if (!donation) {
    throw new Error("Verified donation not found.");
  }

  const donor = await User.findByPk(donation.userId);
  const ngo = await NGO.findByPk(donation.ngoId);

  if (!donor?.email) {
    throw new Error("Donor email address not found.");
  }


  const pdfBuffer = await generateReceiptPDF(donation, ngo);

await sendEmail({
  to: donor.email,
  subject: "Your CrowFunding Donation Receipt",
  text: `
Dear ${donor.name || "Donor"},

Thank you for supporting ${ngo?.name || "our charity"}.

Your donation of INR ${Number(donation.amount).toFixed(2)} has been verified successfully.

Your donation receipt is attached as a PDF.

CrowFunding
Small Steps. Big Impact.
  `,
  attachments: [
    {
      filename: `donation-receipt-${donation.id}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ],
});
};
