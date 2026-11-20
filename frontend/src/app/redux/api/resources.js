import { APP_SETTINGS } from "../../../config";
import { apiClient } from "./axiosSetup";

const paths = {
  crops: APP_SETTINGS.API_PATH.CROPS,
  orders: APP_SETTINGS.API_PATH.ORDERS,
  buyers: APP_SETTINGS.API_PATH.BUYERS,
  tasks: APP_SETTINGS.API_PATH.TASKS,
  expenses: APP_SETTINGS.API_PATH.EXPENSES,
  inventory: APP_SETTINGS.API_PATH.INVENTORY,
  workers: APP_SETTINGS.API_PATH.WORKERS,
  attendance: APP_SETTINGS.API_PATH.ATTENDANCE,
  equipment: APP_SETTINGS.API_PATH.EQUIPMENT,
  maintenance: APP_SETTINGS.API_PATH.MAINTENANCE,
  activity: APP_SETTINGS.API_PATH.ACTIVITY,
  users: APP_SETTINGS.API_PATH.USER.getAllUsers
};

export const resourceApi = {
  async list(resource) {
    const { data } = await apiClient.get(paths[resource]);
    return resource === "users" ? data.data.users : data.data;
  },
  async save(resource, payload, id) {
    const url = paths[resource];
    const response = id
      ? await apiClient.put(`${url}/${id}`, payload)
      : await apiClient.post(url, payload);
    return response.data.data;
  },
  async remove(resource, id) {
    const { data } = await apiClient.delete(`${paths[resource]}/${id}`);
    return data.data;
  }
};
