
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Donation = sequelize.define("Donation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  ngoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 1,
      max: 1000000,
    },
  },

  status: {
    type: DataTypes.ENUM("PENDING", "PAID", "FAILED"),
    allowNull: false,
    defaultValue: "PENDING",
  },

  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

module.exports = Donation;
