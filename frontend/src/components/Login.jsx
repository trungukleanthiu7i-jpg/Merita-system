import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.scss";

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Te rog introdu username și parola!");
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Username sau parolă greșită!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("A apărut o eroare la autentificare.");
    }
  };

  return (
    <div className="login-page">
      {/* Background shapes */}
      <div className="background-shapes">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Login container */}
      <div className="login-container">

        {/* Logo + Welcome */}
        <div className="logo-section">
          <img src="/zdrava.png" alt="Zdrava Logo" className="logo" />
          <h1>Bine ai revenit!</h1>
          <p>Autentifică-te pentru a accesa sistemul</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Se încarcă..." : "Login"}
          </button>
        </form>

        {/* Error message */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
