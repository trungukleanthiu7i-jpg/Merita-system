// src/context/AuthContext.jsx
import { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

// Axios client pointing to backend
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api", // backend-ul tău
  withCredentials: true, // if using cookies/sessions in the future
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --------------------
  // Login function
  // --------------------
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.post("/auth/login", { username, password });

      // Backend should return: { user: { id, username, role } }
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setLoading(false);
        return true;
      } else {
        setUser(null);
        setError("User not found or invalid response");
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login failed", err.response?.data || err);

      // Handle specific status codes
      if (err.response?.status === 401) {
        setError("Username sau parola incorectă!");
      } else {
        setError(err.response?.data?.message || "Eroare la autentificare");
      }

      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // --------------------
  // Logout function
  // --------------------
  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
