// src/api/axiosClient.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || ""; // fallback dacă ENV lipsește

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach auth headers to every request
axiosClient.interceptors.request.use(
  (config) => {
    // JWT token auth (for normal users)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Admin Basic Auth (for admin routes)
    if (config.url?.startsWith("/admin")) {
      const adminUser = process.env.REACT_APP_ADMIN_USER || "";
      const adminPass = process.env.REACT_APP_ADMIN_PASS || "";
      const basicAuth = btoa(`${adminUser}:${adminPass}`);
      config.headers.Authorization = `Basic ${basicAuth}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to login on 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
