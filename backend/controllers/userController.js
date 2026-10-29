const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

const registerUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
      },
      transaction: transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        name,
        email,
        phone,
        password: hashedPassword,
      },
      { transaction: transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter email or phone and password",
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: identifier,
          },
          {
            phone: identifier,
          },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const checkedPassword = await bcrypt.compare(password, user.password);

    if (!checkedPassword) {
      return res.status(401).json({
        success: false,
        message: "Wrong password!",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      success: true,
      token: token,
      message: "User login successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await User.findAll({ attributes: { exclude: ["password"] } });

    return res.status(200).json({
      success: true,
      message: "All users has been fetched",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const id = req.params.id;

    const user = await User.findByPk(id, { transaction: transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
        id: { [Op.ne]: id },
      },
      transaction: transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save({ transaction: transaction });
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "User updated",
      user,
    });
   } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Update user error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getDonationHistory = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  getDonationHistory
};

