require("./config/loadEnv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./models/associations");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ succeeded: true, message: "API is running", data: { status: "ok" } })
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/buyers", require("./routes/buyerRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  const port = Number(process.env.PORT || process.env.PORT_NAME || 5000);
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
