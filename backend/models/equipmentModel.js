const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Equipment", "equipment", {
  name: { type: DataTypes.STRING(120), allowNull: false },
  type: { type: DataTypes.STRING(80), allowNull: false },
  purchaseDate: DataTypes.DATEONLY,
  status: { type: DataTypes.ENUM("Active", "Under Repair", "Idle"), defaultValue: "Active" },
  lastServiceDate: DataTypes.DATEONLY,
  serviceIntervalDays: { type: DataTypes.INTEGER, defaultValue: 90, validate: { min: 1 } },
  notes: DataTypes.TEXT
});
