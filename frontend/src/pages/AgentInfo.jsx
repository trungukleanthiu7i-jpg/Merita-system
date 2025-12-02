import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import axiosClient from "../api/axiosClient";
import SignatureCanvas from "react-signature-canvas";
import "../styles/AgentInfo.scss";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";

export default function AgentInfo() {
  const location = useLocation();
  const items = location.state?.items || [];
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  const [agentName, setAgentName] = useState("");
  const [magazinName, setMagazinName] = useState("");
  const [cui, setCui] = useState("");
  const [address, setAddress] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");

  const sigCanvas = useRef(null);

  const sendOrder = async () => {
    if (!agentName.trim() || !magazinName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let signatureData = "";
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      signatureData = sigCanvas.current.getCanvas().toDataURL("image/png");
    }

    const data = {
      items,
      agentName,
      magazinName,
      cui,
      address,
      responsiblePerson,
      signature: signatureData,
    };

    try {
      await axiosClient.post("/orders/create", data);

      // Show success toast
      toast.success("Order sent successfully!");

      // Clear form fields
      setAgentName("");
      setMagazinName("");
      setCui("");
      setAddress("");
      setResponsiblePerson("");
      sigCanvas.current.clear();

      // Clear cart
      clearCart();

      // Redirect after a short delay so user can see the toast
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Error sending order.");
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  return (
    <div className="agent-info">
      <h2>Agent Information</h2>

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
