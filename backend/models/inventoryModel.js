const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Inventory", "inventory", {
  item: { type: DataTypes.STRING(120), allowNull: false },
  type: { type: DataTypes.ENUM("Fertilizer", "Pesticide", "Seed"), allowNull: false },
  qty: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  minQty: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  unit: { type: DataTypes.STRING(30), allowNull: false }
});
