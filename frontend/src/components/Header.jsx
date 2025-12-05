import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.scss";

export default function Header() {
  const { totalBoxes } = useContext(CartContext);
  const { user } = useAuth();

  return (
    <div className="header">
      <Link to="/">Products</Link>

      {user?.role !== "admin" && (
        <div className="orders-link">
          <Link to="/cart">Orders</Link>
          {totalBoxes > 0 && <span className="badge">{totalBoxes}</span>}
        </div>
      )}
    </div>
  );
}
