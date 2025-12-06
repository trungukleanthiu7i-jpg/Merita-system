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

  const API_URL = process.env.REACT_APP_API_URL;

  const getItemUnits = (item) => {
    const unitsPerBox = Number(item.unitsPerBox || 1);
    const boxes = Number(item.boxes || 0);
    const quantity = Number(item.quantity || 0);
    return quantity + boxes * unitsPerBox;
  };

  const getItemTotal = (item) => {
    const pricePerUnit = Number(item.customPrice ?? item.price ?? 0);
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
        cart.map((item) => (
          <div className="cart-item" key={item.product}>
            <img
              src={`${API_URL}/images/${item.image}`}
              alt={item.name}
              className="cart-item-image"
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
                      updateBoxes(item.product, Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label>Price / unit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.customPrice}
                    onChange={(e) =>
                      updatePrice(item.product, Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <p className="price">
                Item Total: {getItemTotal(item).toFixed(2)} RON
              </p>
            </div>

            <FaTrash
              className="delete-icon"
              onClick={() => removeFromCart(item.product)}
            />
          </div>
        ))
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
              <strong>Total price:</strong> {totalOrder.toFixed(2)} RON
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
