const express = require("express");
const router = express.Router();

const NGOController = require("../controllers/ngoController.js");
const auth = require("../middlewares/authMiddleware.js");
const requireRole = require("../middlewares/requireRole.js");
const upload = require("../middlewares/uploadMiddleware.js");

// Register a charity: any logged-in user can apply
router.post("/", auth, upload.single("photo"), NGOController.registerNgo);

// Only NGO users can manage their charity profile
router.get("/my-profile", auth, requireRole("NGO"), NGOController.getMyNgo);

router.put(
  "/my-profile",
  auth,
  requireRole("NGO"),
  upload.single("photo"),
  NGOController.updateMyNgo,
);

// Public routes
router.get("/search", NGOController.searchNgos);
router.get("/", NGOController.getApprovedNgos);
router.get("/:id", NGOController.getApprovedNgoById);

// Only admins can approve/reject a charity
router.patch(
  "/:id/approval",
  auth,
  requireRole("ADMIN"),
  NGOController.reviewNgo,
);

module.exports = router;
