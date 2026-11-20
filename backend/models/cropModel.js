const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Crop", "crops", {
  name: { type: DataTypes.STRING(80), allowNull: false },
  field: { type: DataTypes.STRING(80), allowNull: false },
  plantingDate: DataTypes.DATEONLY,
  cuttingDate: { type: DataTypes.DATEONLY, allowNull: false },
  healthScore: { type: DataTypes.INTEGER, defaultValue: 100, validate: { min: 0, max: 100 } },
  status: { type: DataTypes.ENUM("Healthy", "Needs Attention", "Critical"), defaultValue: "Healthy" },
  expectedQty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  harvestQty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  createdBy: DataTypes.UUID
});
