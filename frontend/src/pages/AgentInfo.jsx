import { useNavigate } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import axiosClient from "../api/axiosClient";
import SignatureCanvas from "react-signature-canvas";
import "../styles/AgentInfo.scss";
import { CartContext } from "../context/CartContext";

// ✅ Import react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AgentInfo() {
  const navigate = useNavigate();
  const { clearCart, cart } = useContext(CartContext);

  const [agentName, setAgentName] = useState("");
  const [magazinName, setMagazinName] = useState("");
  const [cui, setCui] = useState("");
  const [address, setAddress] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [loading, setLoading] = useState(false);

  const sigCanvas = useRef(null);

  const sendOrder = async () => {
    if (
      !agentName.trim() ||
      !magazinName.trim() ||
      !cui.trim() ||
      !address.trim() ||
      !responsiblePerson.trim()
    ) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii!");
      return;
    }

    if (cart.length === 0) {
      toast.error("Coșul este gol!");
      return;
    }

    let signatureData = "";
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      signatureData = sigCanvas.current.getCanvas().toDataURL("image/png");
    } else {
      toast.error("Nesemnatul este obligatoriu!");
      return;
    }

    const items = cart.map((item) => ({
      _id: item._id || item.product?._id,
      name: item.name || item.product?.name || "Produs fără nume",
      boxes: Number(item.boxes || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.customPrice ?? item.price ?? 0),
      unitsPerBox: Number(item.unitsPerBox || 1),
    }));

    const invalidItem = items.find((i) => !i._id);
    if (invalidItem) {
      toast.error(`Produs invalid în coș: ${invalidItem.name}`);
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
      setLoading(true);
      const token = localStorage.getItem("token");
      axiosClient.defaults.headers.common["Authorization"] = token
        ? `Bearer ${token}`
        : "";

      const response = await axiosClient.post("/orders/create", data);

      toast.success(
        response.data?.message || "Comanda a fost trimisă cu succes!"
      );

      clearCart();
      sigCanvas.current?.clear();
      setAgentName("");
      setMagazinName("");
      setCui("");
      setAddress("");
      setResponsiblePerson("");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Eroare la trimiterea comenzii:", err);
      toast.error(
        err.response?.data?.message || "Trimiterea comenzii a eșuat!"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => sigCanvas.current?.clear();

  return (
    <div className="agent-info">
      <h2>Completați detaliile comenzii</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="Nume agent"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nume magazin"
          value={magazinName}
          onChange={(e) => setMagazinName(e.target.value)}
        />
        <input
          type="text"
          placeholder="CUI/NIPT"
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
          placeholder="Persoana responsabilă"
          value={responsiblePerson}
          onChange={(e) => setResponsiblePerson(e.target.value)}
        />

        <div className="signature-container">
          <label>Nesemnat:</label>
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
            Șterge semnătura
          </button>
        </div>

        <button className="submit-btn" onClick={sendOrder} disabled={loading}>
          {loading ? "Se trimite..." : "Trimite comanda"}
        </button>
      </div>

      {/* ✅ ToastContainer afișează notificările popup */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}
