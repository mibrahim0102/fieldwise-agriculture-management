const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = (name, tableName, attributes, options = {}) =>
  sequelize.define(name, {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...attributes
  }, { tableName, timestamps: true, ...options });
