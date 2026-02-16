import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  if (!product) return null;

  const name = product.name || "Produs fără nume";
  const price = product.price ?? 0;
  const unitsPerBox = product.unitsPerBox || 1;
  const image = product.image || "/placeholder.png";

  // Normalizează stocul
  const stoc = (product.stoc || "in stoc").toLowerCase().trim();
  const isOutOfStock = stoc === "out of stoc";

  // URL corect pentru backend (Render)
  const apiURL = process.env.REACT_APP_API_URL;

  return (
    <div className="product-card">
      <img src={`${apiURL}/images/${image}`} alt={name} />

      <h3>{name}</h3>

      <p><strong>Preț:</strong> {price} RON</p>
      <p><strong>Unități per box:</strong> {unitsPerBox}</p>

      <p className={isOutOfStock ? "out" : "in"}>
        {isOutOfStock ? "STOC EPUIZAT ❌" : "ÎN STOC ✅"}
      </p>

      <button disabled={isOutOfStock} onClick={() => addToCart(product)}>
        {isOutOfStock ? "Indisponibil" : "Adaugă la comandă"}
      </button>
    </div>
  );
}
