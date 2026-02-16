import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.scss";

export default function Header() {
  const { totalBoxes } = useContext(CartContext);
  const { user, logout } = useAuth(); // <-- folosește funcția logout din context
  const navigate = useNavigate();

  const handleLogout = () => {
    // Apelează funcția logout din AuthContext
    logout();

    // Optional: șterge token-ul din localStorage dacă este folosit
    localStorage.removeItem("userToken");

    // Redirecționează către pagina de autentificare
    navigate("/", { replace: true });
  };

  return (
    <div className="header">
      <Link to="/">Produse</Link>

      {user?.role !== "admin" && (
        <div className="orders-link">
          <Link to="/cart">Comenzi</Link>
          {totalBoxes > 0 && <span className="badge">{totalBoxes}</span>}
        </div>
      )}

      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Ieșire
        </button>
      )}
    </div>
  );
}
