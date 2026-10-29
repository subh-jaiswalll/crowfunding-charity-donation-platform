
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Subscriber = sequelize.define("Subscriber", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

module.exports = Subscriber;
