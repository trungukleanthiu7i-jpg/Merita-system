// src/context/AuthContext.jsx
import { createContext, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";  // ← folosim clientul global

const AuthContext = createContext();

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

      if (res.data && res.data.user) {
        setUser(res.data.user);
        setLoading(false);
        return true;
      } else {
        setError("User not found or invalid response");
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login failed", err.response?.data || err);

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
  // Logout
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

// Custom hook
export const useAuth = () => useContext(AuthContext);
