// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------
  // Verifică dacă utilizatorul este deja autentificat
  // --------------------
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await axiosClient.get("/auth/me"); // endpoint pentru a obține utilizatorul curent
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // --------------------
  // Funcția de autentificare
  // --------------------
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.post("/auth/login", { username, password });

      if (res.data && res.data.user) {
        setUser(res.data.user);

        // Dacă API-ul returnează un token, îl stochează
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        }

        setLoading(false);
        return true;
      } else {
        setError("Utilizatorul nu a fost găsit sau răspuns invalid");
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Autentificare eșuată", err.response?.data || err);

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
  // Funcția de deconectare
  // --------------------
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("token");
    axiosClient.defaults.headers.common["Authorization"] = "";
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizat
export const useAuth = () => useContext(AuthContext);
