const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const defineModel = require("./defineModel");

const User = defineModel("User", "users", {
  fullName: { type: DataTypes.STRING(80), allowNull: false },
  username: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "manager"), allowNull: false, defaultValue: "manager" }
});

const hashPassword = async (user) => {
  if (user.changed("password")) user.password = await bcrypt.hash(user.password, 10);
};

User.beforeCreate(hashPassword);
User.beforeUpdate(hashPassword);
User.prototype.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
