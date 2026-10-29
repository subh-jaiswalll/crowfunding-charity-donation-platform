const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  createOrder,
  verifyPayment,
  myHistory,
} = require("../controllers/donationController");

const { downloadReceipt } = require("../controllers/receiptController");

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.get("/my-history", authMiddleware, myHistory);
router.get("/:id/receipt", authMiddleware, downloadReceipt);

module.exports = router;