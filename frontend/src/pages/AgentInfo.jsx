import { useNavigate } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import axiosClient from "../api/axiosClient";
import SignatureCanvas from "react-signature-canvas";
import "../styles/AgentInfo.scss";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";

export default function AgentInfo() {
  const navigate = useNavigate();
  const { clearCart, cart } = useContext(CartContext);

  const [agentName, setAgentName] = useState("");
  const [magazinName, setMagazinName] = useState("");
  const [cui, setCui] = useState("");
  const [address, setAddress] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");

  const sigCanvas = useRef(null);

  const sendOrder = async () => {
    // 1️⃣ Validate required fields
    if (
      !agentName.trim() ||
      !magazinName.trim() ||
      !cui.trim() ||
      !address.trim() ||
      !responsiblePerson.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // 2️⃣ Get signature data
    let signatureData = "";
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      signatureData = sigCanvas.current.getCanvas().toDataURL("image/png");
    } else {
      toast.error("Please provide a signature.");
      return;
    }

    // 3️⃣ Prepare items payload
    const items = cart.map((item) => {
      if (!item._id && item.product && item.product._id) {
        item._id = item.product._id;
      }
      return {
        _id: item._id,
        name: item.name || item.product?.name || "Unnamed Product",
        boxes: Number(item.boxes || 0),
        quantity: Number(item.quantity || 0),
        price: Number(item.customPrice ?? item.price ?? 0),
        unitsPerBox: Number(item.unitsPerBox || 1),
      };
    });

    // Validate items have _id
    const invalidItem = items.find((i) => !i._id);
    if (invalidItem) {
      toast.error(`Invalid product in cart: ${invalidItem.name}`);
      return;
    }

    const data = {
      items,
      agentName: agentName.trim(),
      magazinName: magazinName.trim(),
      cui: cui.trim(),
      address: address.trim(),
      responsiblePerson: responsiblePerson.trim(),
      signature: signatureData,
    };

    try {
      // 4️⃣ Send order to backend
      const response = await axiosClient.post("/orders/create", data);

      // 5️⃣ Show success toast
      toast.success(response.data?.message || "Order sent successfully!");

      // 6️⃣ Clear cart, signature, and form fields
      clearCart();
      if (sigCanvas.current) sigCanvas.current.clear();
      setAgentName("");
      setMagazinName("");
      setCui("");
      setAddress("");
      setResponsiblePerson("");

      // 7️⃣ Redirect to products page
      navigate("/");
    } catch (err) {
      console.error("Error sending order:", err);
      toast.error(err.response?.data?.message || "Error sending order.");
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  return (
    <div className="agent-info">
      <h2>Complete Order Details</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Agent Name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Magazin Name"
          value={magazinName}
          onChange={(e) => setMagazinName(e.target.value)}
        />
        <input
          type="text"
          placeholder="CUI"
          value={cui}
          onChange={(e) => setCui(e.target.value)}
        />
        <input
          type="text"
          placeholder="Adresa de livrare"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Responsible Person"
          value={responsiblePerson}
          onChange={(e) => setResponsiblePerson(e.target.value)}
        />

        <div className="signature-container">
          <label>Signature:</label>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 200,
              className: "sigCanvas",
              style: { border: "1px solid #ccc", borderRadius: "5px" },
            }}
          />
          <button type="button" onClick={clearSignature}>
            Clear Signature
          </button>
        </div>

        <button className="submit-btn" onClick={sendOrder}>
          Trimis
        </button>
      </div>
    </div>
  );
}
