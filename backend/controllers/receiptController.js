const PDFDocument = require("pdfkit");

const Donation = require("../models/donationModel");
const NGO = require("../models/NgoModel");

exports.downloadReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
        status: "PAID",
      },
    });

    if (!donation) {
      return res.status(404).json({
        message: "Completed donation not found.",
      });
    }

    const ngo = await NGO.findByPk(donation.ngoId);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=donation-receipt-${donation.id}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(22).text("CrowFunding", { align: "center" });
    doc.moveDown();
    doc.fontSize(18).text("Donation Receipt", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Receipt Number: DON-${donation.id}`);
    doc.text(
      `Donation Date: ${new Date(donation.createdAt).toLocaleDateString("en-IN")}`,
    );
    doc.text(`Charity: ${ngo ? ngo.name : "Charity"}`);
    doc.text(`Donation Amount: INR ${Number(donation.amount).toFixed(2)}`);
    doc.text(`Payment ID: ${donation.razorpayPaymentId || "N/A"}`);
    doc.text("Payment Status: PAID");

    doc.moveDown(2);
    doc.text("Thank you for supporting this charitable cause.");

    doc.end();
  } catch (error) {
    console.error("Receipt error:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Unable to generate receipt.",
      });
    }
  }
};
