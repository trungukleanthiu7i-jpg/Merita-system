import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  if (!product) return null;

  const name = product.name || "Unnamed product";
  const price = product.price ?? 0;
  const unitsPerBox = product.unitsPerBox || 1;
  const image = product.image || "/placeholder.png";

  // Normalize stock value: lowercase and trim spaces
  const stoc = (product.stoc || "in stoc").toLowerCase().trim();
  const isOutOfStock = stoc === "out of stoc";

  return (
    <div className="product-card">
      <img src={`http://localhost:5000/images/${image}`} alt={name} />
      <h3>{name}</h3>

      <p><strong>Price:</strong> {price} RON</p>
      <p><strong>Units per box:</strong> {unitsPerBox}</p>

      <p className={isOutOfStock ? "out" : "in"}>
        {isOutOfStock ? "OUT OF STOCK ❌" : "IN STOCK ✅"}
      </p>

      <button disabled={isOutOfStock} onClick={() => addToCart(product)}>
        {isOutOfStock ? "Unavailable" : "Add to Order"}
      </button>
    </div>
  );
}
