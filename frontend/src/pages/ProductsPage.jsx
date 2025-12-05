import { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";

export default function ProductsPage() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");

        // Ensure products is always an array
        const productsData = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading products...
      </p>
    );

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => {
            if (!product) return null;

            const isOutOfStock =
              (product.stoc || "in stoc").trim().toLowerCase() ===
              "out of stoc";

            return (
              <div key={product._id} className="product-card">
                <img
                  src={`http://localhost:5000/images/${product.image || "placeholder.png"}`}
                  alt={product.name || "Unnamed product"}
                />

                <h3>{product.name || "Unnamed product"}</h3>

                <p>
                  <strong>Price:</strong> {product.price ?? 0} RON
                </p>
                <p>
                  <strong>Units per box:</strong>{" "}
                  {product.unitsPerBox || 1}
                </p>

                <p className={isOutOfStock ? "out" : "in"}>
                  {isOutOfStock ? "OUT OF STOCK ❌" : "IN STOCK ✅"}
                </p>

                <button
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                >
                  {isOutOfStock ? "Unavailable" : "Add to Order"}
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            No products available.
          </p>
        )}
      </div>
    </div>
  );
}
