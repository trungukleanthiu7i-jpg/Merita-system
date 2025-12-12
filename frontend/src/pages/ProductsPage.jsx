import { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";
import { ReactBarcode } from "react-jsbarcode";

export default function ProductsPage() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend root without /api
  const API_URL = process.env.REACT_APP_API_URL.replace(/\/api$/, "");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
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

            // Encode filename to handle spaces/special characters
            const imageSrc = product.image
              ? `${API_URL}/images/${encodeURIComponent(product.image)}`
              : `${API_URL}/images/placeholder.png`;

            return (
              <div key={product._id} className="product-card">
                <img
                  src={imageSrc}
                  alt={product.name || "Unnamed product"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${API_URL}/images/placeholder.png`;
                  }}
                />

                <h3>{product.name || "Unnamed product"}</h3>

                <p>
                  <strong>Price:</strong> {product.price ?? 0} RON
                </p>
                <p>
                  <strong>Units per box:</strong> {product.unitsPerBox || 1}
                </p>

                {/* BARCODE */}
                <div className="product-barcode">
                  {product.barcode ? (
                    <ReactBarcode
                      value={product.barcode}
                      format="CODE128"
                      displayValue={true}
                      fontSize={14}
                      width={2}
                      height={60}
                    />
                  ) : (
                    <p>No barcode</p>
                  )}
                </div>

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
