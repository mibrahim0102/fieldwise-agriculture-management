const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Expense", "expenses", {
  cropId: DataTypes.UUID,
  category: { type: DataTypes.ENUM("Seeds", "Fertilizer", "Labour", "Fuel", "Repair", "Other"), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  note: DataTypes.TEXT
});
