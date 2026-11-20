const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const APP_SETTINGS = {
  API_PATH: {
    USER: {
      login: `${BASE}/users/login`,
      create: `${BASE}/users/register`,
      logout: `${BASE}/users/logout`,
      getAllUsers: `${BASE}/users`,
      getUser: `${BASE}/users`,
      updateUser: `${BASE}/users`,
      remove: `${BASE}/users`,
      changePassword: `${BASE}/users/change-password`
    },
    CROPS: `${BASE}/crops`,
    ORDERS: `${BASE}/orders`,
    BUYERS: `${BASE}/buyers`,
    TASKS: `${BASE}/tasks`,
    EXPENSES: `${BASE}/expenses`,
    INVENTORY: `${BASE}/inventory`,
    WORKERS: `${BASE}/workers`,
    ATTENDANCE: `${BASE}/attendance`,
    EQUIPMENT: `${BASE}/equipment`,
    MAINTENANCE: `${BASE}/maintenance`,
    ACTIVITY: `${BASE}/activity`
  }
};

export const API_BASE = BASE;
