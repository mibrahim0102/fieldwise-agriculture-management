const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Task", "tasks", {
  title: { type: DataTypes.STRING(120), allowNull: false },
  type: { type: DataTypes.ENUM("Irrigation", "Fertilizer", "Spraying", "Labour"), allowNull: false },
  cropId: DataTypes.UUID,
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("Pending", "Done", "Overdue"), defaultValue: "Pending" }
});
