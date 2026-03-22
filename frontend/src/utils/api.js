// frontend/src/utils/api.js
import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your backend API base URL
});

// Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Auto logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
