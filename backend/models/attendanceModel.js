const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Attendance", "attendance", {
  workerId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("Present", "Absent", "Half-day", "Leave"), allowNull: false },
  note: DataTypes.TEXT
}, { indexes: [{ unique: true, fields: ["workerId", "date"] }] });
