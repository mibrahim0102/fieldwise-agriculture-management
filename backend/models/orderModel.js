const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Order", "orders", {
  cropId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
  orderDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("Pending", "Delivered", "Cancelled"), defaultValue: "Pending" }
});
