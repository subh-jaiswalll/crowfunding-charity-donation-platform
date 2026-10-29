const sequelize = require("../utils/db.js");

const { DataTypes } = require("sequelize");

const NGO = sequelize.define("NGO", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  project: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  state: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contactEmail: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  verificationStatus: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
    allowNull: false,
  },

  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = NGO;
