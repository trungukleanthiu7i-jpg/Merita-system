import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/AdminDashboard.scss";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [magazines, setMagazines] = useState([]);
  const [selectedMagazine, setSelectedMagazine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [magazineProductStats, setMagazineProductStats] = useState({});

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [agentStartDate, setAgentStartDate] = useState("");
  const [agentEndDate, setAgentEndDate] = useState("");
  const [agentStats, setAgentStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    products: {},
  });

  // ===============================
  // FETCH ALL ORDERS
  // ===============================
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/orders", {
        params: { search, date: selectedDate },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  }, [search, selectedDate]);

  // ===============================
  // FETCH MAGAZINES + AGENTS
  // ===============================
  const fetchMagazinesAndAgents = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/orders");
      const data = Array.isArray(res.data) ? res.data : [];
      setMagazines([...new Set(data.map(o => o.magazinName).filter(Boolean))]);
      setAgents([...new Set(data.map(o => o.agentName).filter(Boolean))]);
    } catch (err) {
      console.error("Error fetching magazines/agents:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMagazinesAndAgents();
  }, [fetchOrders, fetchMagazinesAndAgents]);

  // ===============================
  // DELETE ORDER
  // ===============================
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axiosClient.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  // ===============================
  // NAVIGATION
  // ===============================
  const handleViewStatistics = () => navigate("/admin/stats");
  const handleAddProduct = () => navigate("/admin/add-product");

  // ===============================
  // MAGAZINE FILTER SECTION
  // ===============================
  const fetchMagazineOrders = async () => {
    if (!selectedMagazine) return alert("Please select a magazine");
    try {
      const res = await axiosClient.get("/admin/magazine-orders", {
        params: { magazinName: selectedMagazine, startDate, endDate },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const stats = {};
      data.forEach(order => {
        order.items?.forEach(item => {
          const totalUnits = Number(item.quantity || 0) + Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
          const totalBoxes = Number(item.boxes || 0);
          if (!stats[item.name]) stats[item.name] = { units: 0, boxes: 0 };
          stats[item.name].units += totalUnits;
          stats[item.name].boxes += totalBoxes;
        });
      });
      setMagazineProductStats(stats);
    } catch (err) {
      console.error("Error fetching magazine orders:", err);
    }
  };

  // ===============================
  // AGENT FILTER SECTION
  // ===============================
  const fetchAgentOrders = async () => {
    if (!selectedAgent) return alert("Please select an agent");
    try {
      const res = await axiosClient.get("/admin/agent-orders", {
        params: { agentName: selectedAgent, startDate: agentStartDate, endDate: agentEndDate },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      let totalRevenue = 0;
      const products = {};
      data.forEach(order => {
        order.items?.forEach(item => {
          const totalUnits = Number(item.quantity || 0) + Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
          const totalBoxes = Number(item.boxes || 0);
          totalRevenue += totalUnits * Number(item.price || 0);
          if (!products[item.name]) products[item.name] = { units: 0, boxes: 0 };
          products[item.name].units += totalUnits;
          products[item.name].boxes += totalBoxes;
        });
      });
      setAgentStats({ totalRevenue, totalOrders: data.length, products });
    } catch (err) {
      console.error("Error fetching agent orders:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-buttons">
        <button type="button" className="stats-btn" onClick={handleViewStatistics}>📊 View Statistics</button>
        <button type="button" className="add-product-btn" onClick={handleAddProduct}>➕ Add Product</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by agent or magazin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <h2>All Orders</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Agent</th>
            <th>Magazin</th>
            <th>Total</th>
            <th>Date</th>
            <th>CUI</th>
            <th>Address</th>
            <th>Responsible</th>
            <th>Signature</th>
            <th>Details</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order, i) => (
              <OrderRow key={order._id} order={order} index={i + 1} deleteOrder={deleteOrder} />
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>No orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MAGAZINE SECTION */}
      <div className="magazine-section">
        <h2>Magazine Orders</h2>
        <div className="filters">
          <select value={selectedMagazine} onChange={(e) => setSelectedMagazine(e.target.value)}>
            <option value="">Select Magazine</option>
            {magazines.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="button" onClick={fetchMagazineOrders}>Fetch Orders</button>
        </div>

        {Object.keys(magazineProductStats).length > 0 && (
          <table className="stats-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units</th>
                <th>Boxes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(magazineProductStats).map(([name, stats]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{stats.units}</td>
                  <td>{stats.boxes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AGENT SECTION */}
      <div className="agent-section">
        <h2>Agent Orders</h2>
        <div className="filters">
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
            <option value="">Select Agent</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="date" value={agentStartDate} onChange={(e) => setAgentStartDate(e.target.value)} />
          <input type="date" value={agentEndDate} onChange={(e) => setAgentEndDate(e.target.value)} />
          <button type="button" onClick={fetchAgentOrders}>Fetch Orders</button>
        </div>

        <div className="agent-stats">
          <p>Total Orders: {agentStats.totalOrders}</p>
          <p>Total Revenue: {agentStats.totalRevenue.toFixed(2)} RON</p>

          {Object.keys(agentStats.products).length > 0 && (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Boxes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(agentStats.products).map(([name, stats]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{stats.units}</td>
                    <td>{stats.boxes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ORDER ROW + UPDATED DOWNLOAD BUTTON
// ==========================================
function OrderRow({ order, index, deleteOrder }) {
  const [open, setOpen] = useState(false);

  const total = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => {
        const units =
          Number(item.quantity || 0) +
          Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
        return sum + units * Number(item.price || 0);
      }, 0)
    : 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // LOGO
    const logo = "/zdrava.png"; // public folder
    doc.addImage(logo, "PNG", 150, 10, 60, 60);

    // Title
    doc.setFontSize(18);
    doc.text(`Order #${index}`, 14, 20);

    // Order details
    doc.setFontSize(12);
    doc.text(`Agent: ${order.agentName}`, 14, 35);
    doc.text(`Magazin: ${order.magazinName}`, 14, 42);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 49);
    doc.text(`CUI: ${order.cui}`, 14, 56);
    doc.text(`Address: ${order.address}`, 14, 63);
    doc.text(`Responsible:`, 14, 73);
    doc.text(order.responsiblePerson, 14, 80);

    // Signature under responsible
    if (order.signature) {
      doc.addImage(order.signature, "PNG", 14, 88, 50, 25);
    }

    // Products table
    const rows = order.items.map(item => {
      const totalUnits =
        Number(item.quantity || 0) +
        Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
      return [
        item.name,
        item.quantity,
        item.boxes,
        item.unitsPerBox,
        totalUnits,
        (totalUnits * Number(item.price || 0)).toFixed(2) + " RON",
      ];
    });

    autoTable(doc, {
      startY: 120,
      head: [["Product", "Qty", "Boxes", "Units/Box", "Total Units", "Price"]],
      body: rows,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: ${total.toFixed(2)} RON`, 14, finalY);

    doc.save(`Order_${index}.pdf`);
  };

  return (
    <>
      <tr>
        <td>{index}</td>
        <td>{order.agentName}</td>
        <td>{order.magazinName}</td>
        <td>{total.toFixed(2)} RON</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>{order.cui}</td>
        <td>{order.address}</td>
        <td>{order.responsiblePerson}</td>
        <td>
          {order.signature ? (
            <img src={order.signature} alt="Signature" className="signature-img" />
          ) : (
            "N/A"
          )}
        </td>
        <td>
          <button type="button" onClick={() => setOpen(!open)}>View</button>
        </td>
        <td>
          <button type="button" className="delete-btn" onClick={() => deleteOrder(order._id)}>🗑️</button>
          <button type="button" className="download-btn" onClick={handleDownloadPDF}>⬇️</button>
        </td>
      </tr>

      {open && (
        <tr className="details-row">
          <td colSpan="12">
            <div className="details-box">
              <h3>Products</h3>
              <table className="details-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Boxes</th>
                    <th>Units/Box</th>
                    <th>Total Units</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => {
                    const totalUnits =
                      Number(item.quantity || 0) + Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
                    return (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.boxes}</td>
                        <td>{item.unitsPerBox}</td>
                        <td>{totalUnits}</td>
                        <td>{(totalUnits * Number(item.price || 0)).toFixed(2)} RON</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
