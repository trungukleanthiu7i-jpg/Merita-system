import { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";
import { ReactBarcode } from "react-jsbarcode";

export default function ProductsPage() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Safe API base for images (works locally + on Render)
  const API_BASE =
    (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/api$/, "");

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

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading products...
      </p>
    );
  }

  if (!products.length) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        No products available.
      </p>
    );
  }

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="products-list">
        {products.map((product) => {
          if (!product || !product._id) return null;

          const isOutOfStock =
            (product.stoc || "in stoc").trim().toLowerCase() === "out of stoc";

          // ---------- IMAGE ----------
          let imageSrc = `${API_BASE}/images/placeholder.png`;

          if (product.image) {
            if (/^https?:\/\//i.test(product.image)) {
              imageSrc = product.image;
            } else {
              // ✅ Encode filename so spaces/special chars always work
              imageSrc = `${API_BASE}/images/${encodeURIComponent(product.image)}`;
            }
          }

          // ---------- BARCODE ----------
          const barcodeValue =
            product.barcode !== undefined && product.barcode !== null
              ? String(product.barcode)
              : "";

          return (
            <div className="product-card" key={product._id}>
              <img
                src={imageSrc}
                alt={product.name || "Unnamed product"}
                style={{
                  width: "100%",
                  height: "450px",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${API_BASE}/images/placeholder.png`;
                }}
              />

              <h3>{product.name || "Unnamed product"}</h3>

              <p>
                <strong>Price:</strong> {Number(product.price) || 0} RON
              </p>

              <p>
                <strong>Units per box:</strong> {Number(product.unitsPerBox) || 1}
              </p>

              {/* BARCODE */}
              <div className="product-barcode">
                {barcodeValue ? (
                  <ReactBarcode
                    value={barcodeValue}
                    format="CODE128"
                    displayValue={true}
                    fontSize={12}
                    width={1.8}
                    height={55}
                  />
                ) : (
                  <p style={{ fontSize: "12px", opacity: 0.6 }}>No barcode</p>
                )}
              </div>

              <p className={isOutOfStock ? "out" : "in"}>
                {isOutOfStock ? "OUT OF STOCK ❌" : "IN STOCK ✅"}
              </p>

              <button disabled={isOutOfStock} onClick={() => addToCart(product)}>
                {isOutOfStock ? "Unavailable" : "Add to Order"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
