
const User = require("../models/userModel");
const NGO = require("../models/NgoModel");
const Donation = require('../models/donationModel')

// GET /admin/users
// Fetch all users without password hashes.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Unable to fetch users",
    });
  }
};

// GET /admin/charities
// Fetch all charities, including pending and rejected ones.
const getAllCharities = async (req, res) => {
  try {
    const charities = await NGO.findAll({
      order: [["id", "DESC"]],
    });

    return res.status(200).json({ charities });
  } catch (error) {
    console.error("Get charities error:", error);

    return res.status(500).json({
      message: "Unable to fetch charities",
    });
  }
};

// PATCH /admin/charities/:id/status
// Approve or reject a charity.
const updateCharityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (
      !["APPROVED", "REJECTED"].includes(verificationStatus)
    ) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const charity = await NGO.findByPk(id);

    if (!charity) {
      return res.status(404).json({
        message: "Charity not found",
      });
    }

    charity.verificationStatus = verificationStatus;
    await charity.save();

    return res.status(200).json({
      message: `Charity ${verificationStatus.toLowerCase()} successfully`,
      charity,
    });
  } catch (error) {
    console.error("Update charity status error:", error);

    return res.status(500).json({
      message: "Unable to update charity status",
    });
  }
};

// DELETE /admin/users/:id
// Delete a user if it is safe to do so.
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent an admin from deleting their own account.
    if (String(req.user.id) === String(id)) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Do not delete admin accounts through this endpoint.
    if (user.role === "ADMIN") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted here",
      });
    }

    // Prevent deleting a user who owns a charity profile.
    const charity = await NGO.findOne({
      where: { userId: user.id },
    });

    if (charity) {
      return res.status(409).json({
        message:
          "This user owns a charity profile. Handle the charity and its related records before deleting the user.",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message:
        "Unable to delete user. Check whether related records must be handled first.",
    });
  }
};

const getAllDonations = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Fetch donations with donor and NGO
        const { count, rows } = await Donation.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "donor",
                    attributes: ["id", "name", "email", "phone"]
                },
                {
                    model: NGO,
                    as: "ngo",
                    attributes: ["id", "name", "category", "city"]
                }
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            message: "All donations fetched successfully",

            totalDonations: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),

            donations: rows
        });

    } catch (error) {
        console.error("Get All Donations Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch donations",
            error: error.message
        });
    }
};

module.exports = {
  getAllUsers,
  getAllCharities,
  updateCharityStatus,
  deleteUser,
  getAllDonations
};
