const NGO = require("../models/NgoModel.js");
const User = require("../models/userModel.js");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

// Register a charity
const registerNgo = async (req, res) => {
  try {
    const {
      name,
      mission,
      goal,
      project,
      category,
      address,
      city,
      state,
      contactEmail,
    } = req.body || {};

    // Validate required fields
    if (
      !name ||
      !mission ||
      goal === undefined ||
      goal === null ||
      !category ||
      !address ||
      !city ||
      !state ||
      !contactEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (
      String(goal).trim() === "" ||
      !Number.isFinite(Number(goal)) ||
      Number(goal) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Goal must be a non-negative number",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Find the logged-in user
      const user = await User.findByPk(req.user.userId, {
        transaction,
        lock: true,
      });

      if (!user) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Only donors can register a charity
      if (user.role !== "DONOR") {
        await transaction.rollback();

        return res.status(403).json({
          success: false,
          message: "Only donors can register a charity",
        });
      }

      // Check whether this user already registered a charity
      const existingNgo = await NGO.findOne({
        where: { userId: user.id },
        transaction,
      });

      if (existingNgo) {
        await transaction.rollback();

        return res.status(409).json({
          success: false,
          message: "You have already registered a charity",
        });
      }

      // Create the charity profile
      const ngo = await NGO.create(
        {
          userId: user.id,
          name,
          mission,
          goal: Number(goal),
          project: project || null,
          category,
          address,
          city,
          state,
          contactEmail,
          photo: req.file ? req.file.filename : null,
          verificationStatus: "PENDING",
        },
        { transaction },
      );

      // Change the user's role from DONOR to NGO
      user.role = "NGO";
      await user.save({ transaction });

      // Save both changes together
      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Charity registered successfully. Awaiting admin approval.",
        ngo,
        user: {
          id: user.id,
          role: user.role,
        },
        
      });
    } catch (err) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw err;
    }
  } catch (err) {
    console.error("Register NGO Error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "A charity is already registered for this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyNgo = async (req, res) => {
  try {
    const ngo = await NGO.findOne({
      where: {
        userId: req.user.userId,
      },
    });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "Charity profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      ngo,
    });
  } catch (err) {
    console.error("Get my NGO error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the logged-in NGO's profile

const updateMyNgo = async (req, res) => {
  try {
    const ngo = await NGO.findOne({
      where: { userId: req.user.userId },
    });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "Charity profile not found",
      });
    }

    const {
      name,
      mission,
      goal,
      project,
      category,
      address,
      city,
      state,
      contactEmail,
    } = req.body || {};

    // Validate goal
    if (
      goal !== undefined &&
      (!Number.isFinite(Number(goal)) ||
        String(goal).trim() === "" ||
        Number(goal) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Goal must be a non-negative number",
      });
    }

    // Update only fields provided by the client
    if (name !== undefined) ngo.name = name;
    if (mission !== undefined) ngo.mission = mission;
    if (goal !== undefined) ngo.goal = Number(goal);
    if (project !== undefined) ngo.project = project;
    if (category !== undefined) ngo.category = category;
    if (address !== undefined) ngo.address = address;
    if (city !== undefined) ngo.city = city;
    if (state !== undefined) ngo.state = state;
    if (contactEmail !== undefined) ngo.contactEmail = contactEmail;

    // Update photo if a file was uploaded
    if (req.file) {
      ngo.photo = req.file.filename;
    }

    // Keep userId and verificationStatus unchanged
    await ngo.save();

    return res.status(200).json({
      success: true,
      message: "Charity profile updated successfully",
      ngo,
    });
  } catch (err) {
    console.error("Update NGO error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Public list: only approved charities


const getApprovedNgos = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 9;

    const offset = (page - 1) * limit;

    const result = await NGO.findAndCountAll({
      where: {
        verificationStatus: "APPROVED",
      },
      limit: limit,
      offset: offset,
      order: [["id", "DESC"]],
    });

    const totalPages = Math.ceil(result.count / limit);

    res.status(200).json({
      success: true,
      ngos: result.rows,
      pagination: {
        currentPage: page,
        limit: limit,
        totalNgos: result.count,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch NGOs",
    });
  }
};


// Public details: only approved charities
const getApprovedNgoById = async (req, res) => {
  try {
    const ngo = await NGO.findOne({
      where: {
        id: req.params.id,
        verificationStatus: "APPROVED",
      },
    });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "Approved charity not found",
      });
    }

    return res.status(200).json({
      success: true,
      ngo,
    });
  } catch (err) {
    console.error("Get approved NGO error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Admin: approve or reject a charity
const reviewNgo = async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    if (!["APPROVED", "REJECTED"].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const ngo = await NGO.findByPk(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "Charity not found",
      });
    }

    ngo.verificationStatus = verificationStatus;
    await ngo.save();

    return res.status(200).json({
      success: true,
      message: `Charity ${verificationStatus.toLowerCase()} successfully`,
      ngo,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const searchNgos = async (req, res) => {
  try {
    const { search, category, city, state } = req.query;

    const where = {
      verificationStatus: "APPROVED",
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }

    if (state) {
      where.state = { [Op.like]: `%${state}%` };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mission: { [Op.like]: `%${search}%` } },
        { project: { [Op.like]: `%${search}%` } },
      ];
    }

    const ngos = await NGO.findAll({
      where,
      attributes: {
        exclude: ["userId"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: ngos.length,
      ngos,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerNgo,
  getMyNgo,
  updateMyNgo,
  getApprovedNgos,
  getApprovedNgoById,
  reviewNgo,
  searchNgos,
};
