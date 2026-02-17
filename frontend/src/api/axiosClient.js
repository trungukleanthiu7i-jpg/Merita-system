// src/api/axiosClient.js
import axios from "axios";

/*
REACT_APP_API_URL should be:
LOCAL  -> http://localhost:5000/api
RENDER -> https://merita-system-backend.onrender.com/api
*/

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

// remove trailing slash if exists
const baseURL = API_URL.replace(/\/$/, "");

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// REQUEST INTERCEPTOR
// ==========================
axiosClient.interceptors.request.use(
  (config) => {
    // JWT token (normal users)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Admin routes Basic Auth
    if (config.url?.startsWith("/admin")) {
      const adminUser = process.env.REACT_APP_ADMIN_USER;
      const adminPass = process.env.REACT_APP_ADMIN_PASS;

      if (adminUser && adminPass) {
        const basicAuth = btoa(`${adminUser}:${adminPass}`);
        config.headers.Authorization = `Basic ${basicAuth}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
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
