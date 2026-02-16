import { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.scss";
import { ReactBarcode } from "react-jsbarcode";

export default function ProductsPage() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ API sigur pentru imagini (local + Render)
  const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
    /\/api$/,
    ""
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
        const productsData = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];
        setProducts(productsData);
      } catch (err) {
        console.error("Eroare la preluarea produselor:", err);
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
        Se încarcă produsele...
      </p>
    );
  }

  if (!products.length) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Nu există produse disponibile.
      </p>
    );
  }

  return (
    <div className="products-page">
      <h1>Produse</h1>

      <div className="products-list">
        {products.map((product) => {
          if (!product || !product._id) return null;

          const isOutOfStock =
            (product.stoc || "în stoc").trim().toLowerCase() === "out of stoc";

          // ---------- IMAGINE ----------
          let imageSrc = `${API_BASE}/images/placeholder.png`;

          if (product.image) {
            if (/^https?:\/\//i.test(product.image)) {
              imageSrc = product.image;
            } else {
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
                alt={product.name || "Produs fără nume"}
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

              <h3>{product.name || "Produs fără nume"}</h3>

              <p>
                <strong>Preț:</strong> {Number(product.price) || 0}{" "}
                <span>RON</span>
              </p>

              <p>
                <strong>Unități per box:</strong>{" "}
                {Number(product.unitsPerBox) || 1}
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
                  <p style={{ fontSize: "12px", opacity: 0.6 }}>
                    Nu există cod de bare
                  </p>
                )}
              </div>

              <p className={isOutOfStock ? "out" : "in"}>
                {isOutOfStock ? "JASPR STOC ❌" : "ÎN STOC ✅"}
              </p>

              <button
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
              >
                {isOutOfStock ? "Indisponibil" : "Adaugă la comandă"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
