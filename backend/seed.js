const crypto = require("crypto");
require("./config/loadEnv");
const {
  sequelize, User, Crop, Worker, Equipment, Order, Task, Expense,
  Inventory, Attendance, Buyer, Maintenance, Activity
} = require("./models/associations");

const seed = async () => {
  await sequelize.sync({ alter: true });
  const [admin] = await User.findOrCreate({
    where: { username: "admin" },
    defaults: { fullName: "Demo Admin", email: "admin@agri.com", password: "Admin@123", role: "admin" }
  });
  await User.findOrCreate({
    where: { username: "manager" },
    defaults: { fullName: "Demo Manager", email: "manager@agri.com", password: "Manager@123", role: "manager" }
  });
  for (const member of [
    { fullName: "Mariam Khan", username: "mariam.khan", email: "mariam.khan@agri.com" },
    { fullName: "Bilal Ahmed", username: "bilal.ahmed", email: "bilal.ahmed@agri.com" },
    { fullName: "Hina Raza", username: "hina.raza", email: "hina.raza@agri.com" }
  ]) {
    await User.findOrCreate({
      where: { username: member.username },
      defaults: { ...member, password: crypto.randomBytes(32).toString("hex"), role: "manager" }
    });
  }

  const crops = [];
  for (const crop of [
    { name: "Wheat", field: "Field A", plantingDate: "2026-06-01", cuttingDate: "2026-11-25", healthScore: 90, status: "Healthy", expectedQty: 600, harvestQty: 500 },
    { name: "Cotton", field: "Field B", plantingDate: "2026-05-10", cuttingDate: "2026-11-30", healthScore: 55, status: "Needs Attention", expectedQty: 400, harvestQty: 300 },
    { name: "Rice", field: "Field C", plantingDate: "2026-06-20", cuttingDate: "2026-12-01", healthScore: 30, status: "Critical", expectedQty: 250, harvestQty: 200 },
    { name: "Maize", field: "Field D", plantingDate: "2026-07-01", cuttingDate: "2026-12-05", healthScore: 92, status: "Healthy", expectedQty: 700, harvestQty: 600 },
    { name: "Tomato", field: "Field E", plantingDate: "2026-07-10", cuttingDate: "2026-12-10", healthScore: 84, status: "Healthy", expectedQty: 450, harvestQty: 350 },
    { name: "Potato", field: "Field F", plantingDate: "2026-07-15", cuttingDate: "2026-12-15", healthScore: 72, status: "Needs Attention", expectedQty: 900, harvestQty: 700 }
  ]) {
    const [row] = await Crop.findOrCreate({
      where: { name: crop.name, field: crop.field },
      defaults: { ...crop, createdBy: admin.id }
    });
    crops.push(row);
  }

  const [worker] = await Worker.findOrCreate({
    where: { cnic: "35202-1234567-1" },
    defaults: { fullName: "Ali Khan", phone: "03001234567", role: "Farm Hand", dailyWage: 1500, joinDate: "2026-01-01", status: "Active" }
  });
  const workers = [worker];
  for (const member of [
    { fullName: "Mariam Khan", cnic: "35202-9000101-1", phone: "03001234568", role: "Field Supervisor", dailyWage: 2500, joinDate: "2026-02-01", status: "Active" },
    { fullName: "Bilal Ahmed", cnic: "35202-9000102-2", phone: "03001234569", role: "Irrigation Technician", dailyWage: 2000, joinDate: "2026-03-01", status: "Active" },
    { fullName: "Hina Raza", cnic: "35202-9000103-3", phone: "03001234570", role: "Harvest Coordinator", dailyWage: 2200, joinDate: "2026-04-01", status: "Active" },
    { fullName: "Usman Malik", cnic: "35202-9000104-4", phone: "03001234571", role: "Equipment Operator", dailyWage: 1800, joinDate: "2026-05-01", status: "Active" }
  ]) {
    const [row] = await Worker.findOrCreate({ where: { cnic: member.cnic }, defaults: member });
    workers.push(row);
  }
  const [equipment] = await Equipment.findOrCreate({
    where: { name: "Tractor MF-385" },
    defaults: { type: "Tractor", purchaseDate: "2024-03-01", status: "Active", lastServiceDate: "2026-09-01", serviceIntervalDays: 60, notes: "Primary field tractor" }
  });
  const equipmentItems = [equipment];
  for (const item of [
    { name: "Seeder Planter", type: "Seed drill", purchaseDate: "2024-05-15", status: "Active", lastServiceDate: "2026-10-15", serviceIntervalDays: 90, notes: "Row planting equipment" },
    { name: "Irrigation Pump", type: "Water pump", purchaseDate: "2023-08-10", status: "Active", lastServiceDate: "2026-08-10", serviceIntervalDays: 90, notes: "Main field water pump" },
    { name: "Combine Harvester", type: "Harvester", purchaseDate: "2022-11-20", status: "Under Repair", lastServiceDate: "2026-11-10", serviceIntervalDays: 60, notes: "Scheduled for seasonal inspection" },
    { name: "Crop Sprayer", type: "Sprayer", purchaseDate: "2025-02-05", status: "Active", lastServiceDate: "2026-09-05", serviceIntervalDays: 90, notes: "Mounted crop sprayer" }
  ]) {
    const [row] = await Equipment.findOrCreate({ where: { name: item.name }, defaults: item });
    equipmentItems.push(row);
  }
  await Order.findOrCreate({
    where: { cropId: crops[0].id, orderDate: "2026-11-15" },
    defaults: { quantity: 75, status: "Pending" }
  });
  await Task.findOrCreate({
    where: { title: "Irrigate Field A", dueDate: "2026-11-22" },
    defaults: { type: "Irrigation", cropId: crops[0].id, status: "Pending" }
  });
  await Task.findOrCreate({
    where: { title: "Inspect cotton leaves", dueDate: "2026-11-18" },
    defaults: { type: "Spraying", cropId: crops[1].id, status: "Overdue" }
  });
  for (const task of [
    { title: "Prepare Maize field", dueDate: "2026-11-24", type: "Fertilizer", cropId: crops[3].id, status: "Pending" },
    { title: "Harvest tomato row", dueDate: "2026-11-27", type: "Labour", cropId: crops[4].id, status: "Pending" },
    { title: "Inspect potato irrigation", dueDate: "2026-11-21", type: "Irrigation", cropId: crops[5].id, status: "Pending" }
  ]) {
    await Task.findOrCreate({
      where: { title: task.title, dueDate: task.dueDate },
      defaults: task
    });
  }
  const [seedExpense] = await Expense.findOrCreate({
    where: { category: "Seeds", date: "2026-11-01", note: "Wheat seed purchase" },
    defaults: { cropId: crops[0].id, amount: 12500 }
  });
  const expenses = [seedExpense];
  for (const expense of [
    { category: "Fertilizer", date: "2026-11-05", note: "Maize soil nutrients", cropId: crops[3].id, amount: 8200 },
    { category: "Fuel", date: "2026-11-06", note: "Tractor diesel", cropId: crops[0].id, amount: 5400 },
    { category: "Labour", date: "2026-11-07", note: "Harvest support", cropId: crops[5].id, amount: 9600 },
    { category: "Repair", date: "2026-11-08", note: "Irrigation pump parts", cropId: crops[3].id, amount: 3200 }
  ]) {
    const [row] = await Expense.findOrCreate({
      where: { category: expense.category, date: expense.date, note: expense.note },
      defaults: expense
    });
    expenses.push(row);
  }
  await Inventory.findOrCreate({
    where: { item: "NPK fertilizer" },
    defaults: { type: "Fertilizer", qty: 12, minQty: 20, unit: "bags" }
  });
  await Inventory.findOrCreate({
    where: { item: "Wheat seed" },
    defaults: { type: "Seed", qty: 80, minQty: 25, unit: "kg" }
  });
  for (const item of [
    { item: "Calcium nitrate", type: "Fertilizer", qty: 40, minQty: 10, unit: "kg" },
    { item: "Tomato seed", type: "Seed", qty: 30, minQty: 5, unit: "kg" },
    { item: "Neem pesticide", type: "Pesticide", qty: 18, minQty: 8, unit: "litres" }
  ]) {
    await Inventory.findOrCreate({ where: { item: item.item }, defaults: item });
  }
  for (const buyer of [
    { name: "Ahmed Raza", cnic: "35202-9000001-1", cropId: crops[3].id, quantity: 100, date: "2026-11-16" },
    { name: "Sana Iqbal", cnic: "35202-9000002-2", cropId: crops[4].id, quantity: 75, date: "2026-11-17" },
    { name: "Kamran Ali", cnic: "35202-9000003-3", cropId: crops[5].id, quantity: 125, date: "2026-11-18" },
    { name: "Nadia Khan", cnic: "35202-9000004-4", cropId: crops[3].id, quantity: 120, date: "2026-11-19" }
  ]) {
    await Buyer.findOrCreate({
      where: { cnic: buyer.cnic },
      defaults: buyer
    });
  }
  for (const order of [
    { cropId: crops[3].id, orderDate: "2026-11-16", quantity: 50, status: "Pending" },
    { cropId: crops[4].id, orderDate: "2026-11-17", quantity: 30, status: "Delivered" },
    { cropId: crops[5].id, orderDate: "2026-11-18", quantity: 90, status: "Pending" },
    { cropId: crops[3].id, orderDate: "2026-11-19", quantity: 40, status: "Delivered" }
  ]) {
    await Order.findOrCreate({
      where: { cropId: order.cropId, orderDate: order.orderDate },
      defaults: order
    });
  }
  const [attendance] = await Attendance.findOrCreate({
    where: { workerId: worker.id, date: "2026-11-20" },
    defaults: { status: "Present", note: "Full day" }
  });
  const attendanceRecords = [attendance];
  for (const entry of [
    { workerId: workers[0].id, date: "2026-11-19", status: "Present", note: "Full day" },
    { workerId: workers[1].id, date: "2026-11-20", status: "Present", note: "Field supervision" },
    { workerId: workers[2].id, date: "2026-11-20", status: "Half-day", note: "Equipment inspection" },
    { workerId: workers[3].id, date: "2026-11-20", status: "Leave", note: "Approved leave" }
  ]) {
    const [row] = await Attendance.findOrCreate({
      where: { workerId: entry.workerId, date: entry.date },
      defaults: { status: entry.status, note: entry.note }
    });
    attendanceRecords.push(row);
  }
  const [seasonalMaintenance] = await Maintenance.findOrCreate({
    where: { equipmentId: equipment.id, date: "2026-09-01" },
    defaults: { description: "Seasonal service", cost: 8500, performedBy: "Farm mechanic" }
  });
  const maintenanceRecords = [seasonalMaintenance];
  for (const maintenance of [
    { equipmentId: equipmentItems[0].id, date: "2026-11-02", description: "Pre-season tractor inspection", cost: 4200, performedBy: "Farm mechanic" },
    { equipmentId: equipmentItems[1].id, date: "2026-11-04", description: "Seeder calibration", cost: 2800, performedBy: "Equipment technician" },
    { equipmentId: equipmentItems[2].id, date: "2026-11-06", description: "Pump filter replacement", cost: 1900, performedBy: "Irrigation technician" },
    { equipmentId: equipmentItems[3].id, date: "2026-11-10", description: "Harvester belt repair", cost: 7600, performedBy: "Workshop mechanic" }
  ]) {
    const [row] = await Maintenance.findOrCreate({
      where: { equipmentId: maintenance.equipmentId, date: maintenance.date },
      defaults: maintenance
    });
    maintenanceRecords.push(row);
  }
  for (const entry of [
    { user: "admin", action: "add", entity: "equipment", entityId: equipmentItems[1].id, timestamp: new Date("2026-11-16T08:30:00Z") },
    { user: "manager", action: "add", entity: "attendance", entityId: attendanceRecords[1].id, timestamp: new Date("2026-11-17T09:00:00Z") },
    { user: "admin", action: "add", entity: "maintenance", entityId: maintenanceRecords[1].id, timestamp: new Date("2026-11-18T10:15:00Z") },
    { user: "manager", action: "add", entity: "expense", entityId: expenses[1].id, timestamp: new Date("2026-11-19T11:45:00Z") }
  ]) {
    await Activity.findOrCreate({
      where: {
        user: entry.user, action: entry.action, entity: entry.entity,
        entityId: entry.entityId, timestamp: entry.timestamp
      },
      defaults: entry
    });
  }
  console.log("Seed complete. Admin: admin / Admin@123   Manager: manager / Manager@123");
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
