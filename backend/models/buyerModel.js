const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Buyer", "buyers", {
  name: { type: DataTypes.STRING(120), allowNull: false },
  cnic: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  cropId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
  date: { type: DataTypes.DATEONLY, allowNull: false }
});
