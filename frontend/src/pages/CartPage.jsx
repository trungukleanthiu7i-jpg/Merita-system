import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaTrash } from "react-icons/fa";
import "../styles/Cartpage.scss";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateBoxes,
    updatePrice,
    clearCart,
    totalBoxes,
  } = useContext(CartContext);

  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Safe API base (works local + deployed)
  const API_BASE =
    (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(
      /\/api$/,
      ""
    );

  const getItemUnits = (item) => {
    const unitsPerBox = Number(item.unitsPerBox || 1);
    const boxes = Number(item.boxes || 0);
    return boxes * unitsPerBox;
  };

  const getItemTotal = (item) => {
    const pricePerUnit =
      item.customPrice !== undefined
        ? Number(item.customPrice)
        : Number(item.price || 0);
    return getItemUnits(item) * pricePerUnit;
  };

  const totalUnits = cart.reduce((sum, item) => sum + getItemUnits(item), 0);
  const totalOrder = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handleProceedToAgentInfo = () => {
    if (cart.length === 0) return;
    navigate("/agent-info");
  };

  return (
    <div className="cart-page">
      <h1>Your Order</h1>

      {cart.length === 0 ? (
        <p className="empty-message">No products added yet.</p>
      ) : (
        cart.map((item) => {
          const imageSrc = item.image
            ? `${API_BASE}/images/${encodeURIComponent(item.image)}`
            : `${API_BASE}/images/placeholder.png`;

          return (
            <div className="cart-item" key={item._id}>
              <img
                src={imageSrc}
                alt={item.name}
                className="cart-item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${API_BASE}/images/placeholder.png`;
                }}
              />

              <div className="item-info">
                <h3>{item.name}</h3>

                <div className="inputs-row">
                  <div>
                    <label>Boxes</label>
                    <input
                      type="number"
                      min="0"
                      value={item.boxes || 0}
                      onChange={(e) =>
                        updateBoxes(item._id, Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label>Price / unit</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        item.customPrice !== undefined
                          ? item.customPrice
                          : item.price || 0
                      }
                      onChange={(e) =>
                        updatePrice(item._id, Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <p className="price">
                  Item Total: {getItemTotal(item).toFixed(2)} {"LEK"}
                </p>
              </div>

              <FaTrash
                className="delete-icon"
                onClick={() => removeFromCart(item._id)}
              />
            </div>
          );
        })
      )}

      {cart.length > 0 && (
        <>
          <div className="summary-box">
            <h2>Order Summary</h2>
            <p>
              <strong>Total boxes:</strong> {totalBoxes}
            </p>
            <p>
              <strong>Total units (with boxes):</strong> {totalUnits}
            </p>
            <p>
              <strong>Total price:</strong> {totalOrder.toFixed(2)} {"LEK"}
            </p>
          </div>

          <div className="actions-row">
            <button className="clear-all-btn" onClick={clearCart}>
              Șterge tot
            </button>

            <button onClick={handleProceedToAgentInfo} className="submit-btn">
              Trimis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
