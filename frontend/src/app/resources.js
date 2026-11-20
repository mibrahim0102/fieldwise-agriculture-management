export const resourceDefinitions = {
  crops: {
    title: "Crops", singular: "crop", icon: "Wheat", endpoint: "crops",
    fields: [
      { name: "name", label: "Crop name", required: true },
      { name: "field", label: "Field", required: true },
      { name: "plantingDate", label: "Planting date", type: "date" },
      { name: "cuttingDate", label: "Cutting date", type: "date", required: true },
      { name: "healthScore", label: "Health score", type: "number", min: 0, max: 100, defaultValue: 100 },
      { name: "status", label: "Health status", type: "select", options: ["Healthy", "Needs Attention", "Critical"], defaultValue: "Healthy" },
      { name: "expectedQty", label: "Expected harvest (kg)", type: "number", min: 0, step: "0.01", defaultValue: 0 },
      { name: "harvestQty", label: "Available harvest (kg)", type: "number", min: 0, step: "0.01", defaultValue: 0 }
    ],
    columns: ["name", "field", "cuttingDate", "healthScore", "status", "harvestQty"]
  },
  orders: {
    title: "Orders", singular: "order", icon: "ShoppingCart", endpoint: "orders",
    fields: [
      { name: "cropId", label: "Crop", type: "relation", resource: "crops", required: true },
      { name: "quantity", label: "Quantity (kg)", type: "number", min: 0.01, step: "0.01", required: true },
      { name: "orderDate", label: "Order date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Delivered", "Cancelled"], defaultValue: "Pending" }
    ],
    columns: ["Crop.name", "quantity", "orderDate", "status"]
  },
  buyers: {
    title: "Buyers", singular: "buyer", icon: "Users", endpoint: "buyers",
    fields: [
      { name: "name", label: "Buyer name", required: true, minLength: 3, pattern: "^[A-Za-z ]+$" },
      { name: "cnic", label: "CNIC (12345-1234567-1)", required: true, pattern: "^\\d{5}-\\d{7}-\\d$" },
      { name: "cropId", label: "Crop", type: "relation", resource: "crops", required: true },
      { name: "quantity", label: "Quantity (kg)", type: "number", min: 0.01, step: "0.01", required: true },
      { name: "date", label: "Sale date", type: "date", required: true }
    ],
    columns: ["name", "cnic", "Crop.name", "quantity", "date"]
  },
  tasks: {
    title: "Tasks", singular: "task", icon: "ClipboardList", endpoint: "tasks",
    fields: [
      { name: "title", label: "Task title", required: true },
      { name: "type", label: "Task type", type: "select", options: ["Irrigation", "Fertilizer", "Spraying", "Labour"], required: true },
      { name: "cropId", label: "Related crop", type: "relation", resource: "crops", optional: true },
      { name: "dueDate", label: "Due date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Done", "Overdue"], defaultValue: "Pending" }
    ],
    columns: ["title", "type", "Crop.name", "dueDate", "status"]
  },
  expenses: {
    title: "Expenses", singular: "expense", icon: "Wallet", endpoint: "expenses",
    fields: [
      { name: "category", label: "Category", type: "select", options: ["Seeds", "Fertilizer", "Labour", "Fuel", "Repair", "Other"], required: true },
      { name: "cropId", label: "Related crop", type: "relation", resource: "crops", optional: true },
      { name: "amount", label: "Amount", type: "number", min: 0.01, step: "0.01", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "note", label: "Note", type: "textarea" }
    ],
    columns: ["date", "category", "Crop.name", "amount", "note"]
  },
  inventory: {
    title: "Inventory", singular: "inventory item", icon: "Package", endpoint: "inventory",
    fields: [
      { name: "item", label: "Item name", required: true },
      { name: "type", label: "Type", type: "select", options: ["Fertilizer", "Pesticide", "Seed"], required: true },
      { name: "qty", label: "Quantity", type: "number", min: 0, step: "0.01", required: true },
      { name: "minQty", label: "Minimum quantity", type: "number", min: 0, step: "0.01", required: true },
      { name: "unit", label: "Unit (kg, bags…)", required: true }
    ],
    columns: ["item", "type", "qty", "minQty", "unit"]
  },
  workers: {
    title: "Workers", singular: "worker", icon: "HardHat", endpoint: "workers",
    fields: [
      { name: "fullName", label: "Full name", required: true },
      { name: "cnic", label: "CNIC", required: true, pattern: "^\\d{5}-\\d{7}-\\d$" },
      { name: "phone", label: "Phone", required: true },
      { name: "role", label: "Job role", required: true },
      { name: "dailyWage", label: "Daily wage", type: "number", min: 0, step: "0.01", required: true },
      { name: "joinDate", label: "Join date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"], defaultValue: "Active" }
    ],
    columns: ["fullName", "cnic", "phone", "role", "dailyWage", "status"]
  },
  attendance: {
    title: "Attendance", singular: "attendance record", icon: "CalendarCheck", endpoint: "attendance",
    fields: [
      { name: "workerId", label: "Worker", type: "relation", resource: "workers", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "status", label: "Attendance", type: "select", options: ["Present", "Absent", "Half-day", "Leave"], required: true },
      { name: "note", label: "Note", type: "textarea" }
    ],
    columns: ["Worker.fullName", "date", "status", "note"]
  },
  equipment: {
    title: "Equipment", singular: "equipment", icon: "Tractor", endpoint: "equipment",
    fields: [
      { name: "name", label: "Equipment name", required: true },
      { name: "type", label: "Type", required: true },
      { name: "purchaseDate", label: "Purchase date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Active", "Under Repair", "Idle"], defaultValue: "Active" },
      { name: "lastServiceDate", label: "Last service date", type: "date" },
      { name: "serviceIntervalDays", label: "Service interval (days)", type: "number", min: 1, defaultValue: 90 },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["name", "type", "status", "lastServiceDate", "serviceIntervalDays"]
  },
  maintenance: {
    title: "Maintenance", singular: "maintenance record", icon: "Wrench", endpoint: "maintenance",
    fields: [
      { name: "equipmentId", label: "Equipment", type: "relation", resource: "equipment", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "cost", label: "Cost", type: "number", min: 0, step: "0.01", required: true },
      { name: "performedBy", label: "Performed by" }
    ],
    columns: ["Equipment.name", "date", "description", "cost", "performedBy"]
  },
  activity: {
    title: "Activity log", singular: "activity", icon: "History", endpoint: "activity",
    columns: ["timestamp", "user", "action", "entity"],
    readOnlyForManagers: true
  },
  users: {
    title: "Team members", singular: "user", icon: "UserRoundCog", endpoint: "users",
    fields: [
      { name: "fullName", label: "Full name", required: true },
      { name: "username", label: "Username", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Temporary password", type: "password", requiredOnCreate: true },
      { name: "role", label: "Role", type: "select", options: ["manager", "admin"], defaultValue: "manager", required: true }
    ],
    columns: ["fullName", "username", "email", "role"]
  }
};

export const navigationGroups = [
  { title: "Overview", items: [{ key: "dashboard", label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" }] },
  { title: "Farm", items: ["crops", "tasks", "inventory"] },
  { title: "Sales", items: ["orders", "buyers"] },
  { title: "People", items: ["workers", "attendance"] },
  { title: "Assets", items: ["equipment", "maintenance"] },
  { title: "Finance", items: ["expenses"] },
  { title: "System", items: ["activity", "users"] }
].map((group) => ({
  ...group,
  items: group.items.map((item) => typeof item === "string"
    ? { key: item, label: resourceDefinitions[item].title, path: `/${item}`, icon: resourceDefinitions[item].icon }
    : item)
}));
