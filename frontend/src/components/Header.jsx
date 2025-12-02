import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/Header.scss";

export default function Header() {
  const { totalBoxes } = useContext(CartContext); // Use totalBoxes

  return (
    <div className="header">
      <Link to="/">Products</Link>

      <div className="orders-link">
        <Link to="/cart">Orders</Link>
        {totalBoxes > 0 && <span className="badge">{totalBoxes}</span>}
      </div>
    </div>
  );
}
