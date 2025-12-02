import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "../styles/Cartpage.scss";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateBoxes,
    updatePrice,
    clearCart,
    totalBoxes, // For totals in summary box
  } = useContext(CartContext);

  const navigate = useNavigate();

  const next = () => {
    navigate("/agent-info", { state: { items: cart } });
  };

  // Units contained within box
  const getItemUnits = (item) => {
    const unitsPerBox = item.unitsPerBox || 1;
    return Number(item.boxes || 0) * unitsPerBox;
  };

  // Price calculation with editable price
  const getItemTotal = (item) => {
    return getItemUnits(item) * item.customPrice;
  };

  // Totals
  const totalUnits = cart.reduce((s, i) => s + getItemUnits(i), 0);
  const totalOrder = cart.reduce((s, i) => s + getItemTotal(i), 0);

  return (
    <div className="cart-page">
      <h1>Your Order</h1>

      {cart.length === 0 ? (
        <p className="empty-message">No products added yet.</p>
      ) : (
        cart.map((item) => (
          <div className="cart-item" key={item._id}>
            {/* IMAGE */}
            <img
              src={`http://localhost:5000/images/${item.image}`}
              alt={item.name}
              className="cart-item-image"
            />

            <div className="item-info">
              <h3>{item.name}</h3>

              {/* Boxes + Custom Price */}
              <div className="inputs-row">
                {/* Boxes */}
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

                {/* Custom Price */}
                <div>
                  <label>Price / unit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.customPrice}
                    onChange={(e) =>
                      updatePrice(item._id, Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <p className="price">
                Item Total: {getItemTotal(item).toFixed(2)} RON
              </p>
            </div>

            {/* Delete */}
            <FaTrash
              className="delete-icon"
              onClick={() => removeFromCart(item._id)}
            />
          </div>
        ))
      )}

      {cart.length > 0 && (
        <>
          {/* Summary Box */}
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

          {/* Bottom Buttons */}
          <div className="actions-row">
            <button className="clear-all-btn" onClick={clearCart}>
              Șterge tot
            </button>

            <button onClick={next} className="submit-btn">
              Trimis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
