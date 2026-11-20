const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Maintenance", "maintenance", {
  equipmentId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  performedBy: DataTypes.STRING(120)
});
