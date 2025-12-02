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
        setProducts(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading products...</p>;

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => {
            if (!product) return null;

            const name = product?.name || "Unnamed product";
            const price = product?.price ?? 0;
            const stoc = (product?.stoc || "in stoc").trim().toLowerCase();
            const unitsPerBox = product?.unitsPerBox || 1;
            const image = product?.image || "/placeholder.png";

            const isOutOfStock = stoc === "out of stoc";

            return (
              <div key={product._id} className="product-card">
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
          })
        ) : (
          <p style={{ textAlign: "center", marginTop: "50px" }}>No products available.</p>
        )}
      </div>
    </div>
  );
}
