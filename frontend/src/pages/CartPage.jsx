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

<<<<<<< HEAD
  const API_URL = process.env.REACT_APP_API_URL;

=======
  // Calculate total units for an item
>>>>>>> 11efd63 (Fix CartPage inputs and CartContext: boxes & price editable)
  const getItemUnits = (item) => {
    const unitsPerBox = Number(item.unitsPerBox || 1);
    const boxes = Number(item.boxes || 0);
    const quantity = Number(item.quantity || 0);
    return quantity + boxes * unitsPerBox;
  };

  // Calculate total price for an item
  const getItemTotal = (item) => {
    const pricePerUnit = Number(item.customPrice ?? item.price ?? 0);
    return getItemUnits(item) * pricePerUnit;
  };

  // Overall totals
  const totalUnits = cart.reduce((sum, item) => sum + getItemUnits(item), 0);
  const totalOrder = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

<<<<<<< HEAD
=======
  // Redirect to agent info page
>>>>>>> 11efd63 (Fix CartPage inputs and CartContext: boxes & price editable)
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
          <div className="cart-item" key={item._id}>
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
                    onChange={(e) => updateBoxes(item._id, Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Price / unit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.customPrice ?? item.price ?? 0}
                    onChange={(e) => updatePrice(item._id, Number(e.target.value))}
                  />
                </div>
              </div>

              <p className="price">
                Item Total: {getItemTotal(item).toFixed(2)} RON
              </p>
            </div>

            <FaTrash
              className="delete-icon"
              onClick={() => removeFromCart(item._id)}
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

<<<<<<< HEAD
            <button onClick={handleProceedToAgentInfo} className="submit-btn">
=======
            <button
              onClick={handleProceedToAgentInfo}
              className="submit-btn"
            >
>>>>>>> 11efd63 (Fix CartPage inputs and CartContext: boxes & price editable)
              Trimis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
