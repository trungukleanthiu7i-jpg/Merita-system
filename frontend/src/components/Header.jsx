import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.scss";

export default function Header() {
  const { totalBoxes } = useContext(CartContext);
  const { user, logout } = useAuth(); // <-- use logout from context
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();

    // Optional: remove token from localStorage if used
    localStorage.removeItem("userToken");

    // Redirect to login page
    navigate("/", { replace: true });
  };

  return (
    <div className="header">
      <Link to="/">Products</Link>

      {user?.role !== "admin" && (
        <div className="orders-link">
          <Link to="/cart">Orders</Link>
          {totalBoxes > 0 && <span className="badge">{totalBoxes}</span>}
        </div>
      )}

      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}
