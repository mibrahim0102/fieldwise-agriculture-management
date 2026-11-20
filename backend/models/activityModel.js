const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

module.exports = defineModel("Activity", "activities", {
  user: { type: DataTypes.STRING(40), allowNull: false },
  action: { type: DataTypes.ENUM("add", "edit", "delete"), allowNull: false },
  entity: { type: DataTypes.STRING(60), allowNull: false },
  entityId: { type: DataTypes.UUID, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});
