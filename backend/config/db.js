require("./loadEnv");
const { Sequelize } = require("sequelize");

const required = ["DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment values: ${missing.join(", ")}. Copy .env.example to .env and configure it.`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false
  }
);

module.exports = sequelize;
