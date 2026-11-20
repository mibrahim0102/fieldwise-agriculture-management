import axios from "axios";
import { API_BASE } from "../../../config";

export const apiClient = axios.create({ baseURL: API_BASE });

apiClient.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
    } catch (error) {
      localStorage.removeItem("user");
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/users/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("user");
      window.location.assign("/session/signin");
    }
    return Promise.reject(error);
  }
);
