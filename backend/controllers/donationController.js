const crypto = require("crypto");

const razorpay = require("../services/razorpayService.js");
const Donation = require("../models/donationModel");
const NGO = require("../models/NgoModel");
const emailController = require("./emailController");
// ==========================================
// 1. CREATE RAZORPAY ORDER
// POST /donation/create-order
// ==========================================
exports.createOrder = async (req, res) => {
  try {
    // Get the logged-in user's ID from the JWT
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please log in again.",
      });
    }

    const { ngoId, amount } = req.body;

    // Validate charity ID
    if (!ngoId) {
      return res.status(400).json({
        message: "Charity ID is required.",
      });
    }

    // Validate donation amount
    const donationAmount = Number(amount);

    if (
      !Number.isFinite(donationAmount) ||
      donationAmount < 1 ||
      donationAmount > 1000000
    ) {
      return res.status(400).json({
        message: "Donation must be between ₹1 and ₹10,00,000.",
      });
    }

    // Convert rupees to paise
    const amountInPaise = Math.round(donationAmount * 100);

    // Find the charity
    const ngo = await NGO.findByPk(ngoId);

    if (!ngo || ngo.verificationStatus !== "APPROVED") {
      return res.status(400).json({
        message: "This charity is not approved for donations.",
      });
    }

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `donation-${Date.now()}`,
      notes: {
        userId: String(userId),
        ngoId: String(ngo.id),
      },
    });

    // Save pending donation in MySQL
    const donation = await Donation.create({
      userId: userId,
      ngoId: ngo.id,
      amount: donationAmount,
      status: "PENDING",
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      message: "Payment order created successfully.",
      donationId: donation.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      charityName: ngo.name,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Unable to create payment order.",
    });
  }
};

// ==========================================
// 2. VERIFY RAZORPAY PAYMENT
// POST /donation/verify-payment
// ==========================================
exports.verifyPayment = async (req, res) => {
  try {
    // IMPORTANT: Your JWT uses userId, not id
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please log in again.",
      });
    }

    const {
      donationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate required payment details
    if (
      !donationId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are missing.",
      });
    }

    // Find this user's donation for the given order
    const donation = await Donation.findOne({
      where: {
        id: donationId,
        userId: userId,
        razorpayOrderId: razorpay_order_id,
      },
    });

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found.",
      });
    }

    // Avoid processing an already confirmed donation again
    if (donation.status === "PAID") {
      return res.status(200).json({
        message: "Donation has already been confirmed.",
        donationId: donation.id,
        status: donation.status,
      });
    }

    if (donation.status !== "PENDING") {
      return res.status(400).json({
        message: "This donation cannot be verified.",
      });
    }

    // Generate expected Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare the signatures safely
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    const signatureIsValid =
      /^[a-fA-F0-9]{64}$/.test(razorpay_signature) &&
      received.length === expected.length &&
      crypto.timingSafeEqual(received, expected);

    if (!signatureIsValid) {
      return res.status(400).json({
        message: "Invalid payment signature.",
      });
    }

    // Fetch actual payment and order from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    const order = await razorpay.orders.fetch(razorpay_order_id);

    // Verify order and payment details
    if (
      payment.order_id !== razorpay_order_id ||
      order.id !== donation.razorpayOrderId ||
      Number(order.amount) !== Math.round(Number(donation.amount) * 100) ||
      order.currency !== "INR" ||
      payment.currency !== "INR" ||
      Number(payment.amount) !== Number(order.amount) ||
      !["authorized", "captured"].includes(payment.status)
    ) {
      return res.status(400).json({
        message: "Payment details do not match the donation.",
      });
    }

    // Only mark the donation as PAID when captured
    if (payment.status !== "captured") {
      return res.status(409).json({
        message: "Payment is authorized but not yet captured.",
      });
    }

    // Update donation record after successful verification.
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.status = "PAID";

    await donation.save();

    // Send the donor an email with the PDF receipt.
    // Email failure should not undo a successful payment.
    let emailSent = true;

    try {
      await emailController.sendDonationReceiptEmail(donation.id);
    } catch (emailError) {
      emailSent = false;

      console.error("Donation receipt email error:", emailError);
    }

    return res.status(200).json({
      message: emailSent
        ? "Donation verified successfully. Receipt emailed to you."
        : "Donation verified successfully, but the receipt email could not be sent. You can download your receipt from donation history.",
      donationId: donation.id,
      status: donation.status,
      emailSent,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      message: "Unable to verify payment.",
    });
  }
};

// ==========================================
// 3. VIEW MY DONATION HISTORY
// GET /donation/my-history
// ==========================================
exports.myHistory = async (req, res) => {
  try {
    // IMPORTANT: Use userId from the JWT payload
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID missing. Please log in again.",
      });
    }

    // Fetch donations belonging to the logged-in user
    const donations = await Donation.findAll({
      where: {
        userId: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Donation history fetched successfully.",
      donations: donations,
    });
  } catch (error) {
    console.error("Donation history error:", error);

    return res.status(500).json({
      message: "Unable to load donation history.",
    });
  }
};
