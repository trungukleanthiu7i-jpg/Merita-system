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
      setError("Vă rugăm să completați username-ul și parola!");
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Username-ul sau parola este incorectă!");
      }
    } catch (err) {
      console.error("Eroare la autentificare:", err);
      setError("A apărut o eroare la autentificare.");
    }
  };

  return (
    <div className="login-page">
      {/* Elemente de fundal */}
      <div className="background-shapes">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Containerul de login */}
      <div className="login-container">

        {/* Logo + Mesaj de bun venit */}
        <div className="logo-section">
          <img src="/zdrava.png" alt="Logo Zdrava" className="logo" />
          <h1>Bine ați venit!</h1>
          <p>Autentificați-vă pentru a accesa sistemul</p>
        </div>

        {/* Formular de login */}
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
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Se încarcă..." : "Conectare"}
          </button>
        </form>

        {/* Mesaj de eroare */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
