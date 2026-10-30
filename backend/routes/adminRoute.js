const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");

const {
  getAllUsers,
  getAllCharities,
  updateCharityStatus,
  deleteUser,
  getAllDonations
} = require("../controllers/adminController");

// Get all users
router.get("/users", authMiddleware, requireAdmin, getAllUsers);

// Get all charities
router.get("/charities", authMiddleware, requireAdmin, getAllCharities);

// Approve or reject a charity
router.patch(
  "/charities/:id/status",
  authMiddleware,
  requireAdmin,
  updateCharityStatus,
);

router.get(
    "/charities",
    authMiddleware,
    requireAdmin,
    getAllDonations
    
);

// Delete a user
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUser);

module.exports = router;
