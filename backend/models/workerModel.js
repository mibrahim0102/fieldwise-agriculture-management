const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Worker", "workers", {
  fullName: { type: DataTypes.STRING(120), allowNull: false },
  cnic: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(30), allowNull: false },
  role: { type: DataTypes.STRING(80), allowNull: false },
  dailyWage: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  joinDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("Active", "Inactive"), defaultValue: "Active" }
});
