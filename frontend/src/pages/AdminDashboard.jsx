import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/AdminDashboard.scss";

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

  // 🔥 ADD AUTH HEADER TO axiosClient
  const token = localStorage.getItem("token");
  axiosClient.defaults.headers.common["Authorization"] = token
    ? `Bearer ${token}`
    : "";

  // ===============================
  // FETCH ALL ORDERS
  // ===============================
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axiosClient.get("/orders", {
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
      const res = await axiosClient.get("/orders");
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
      await axiosClient.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

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
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 0);

          stats[item.name] = (stats[item.name] || 0) + totalUnits;
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
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 0);

          totalRevenue += totalUnits * Number(item.price || 0);

          products[item.name] = (products[item.name] || 0) + totalUnits;
        });
      });

      setAgentStats({
        totalRevenue,
        totalOrders: data.length,
        products,
      });
    } catch (err) {
      console.error("Error fetching agent orders:", err);
    }
  };

  // =====================================
  // JSX START
  // =====================================
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Admin Buttons */}
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

      {/* Magazine Orders Section */}
      <h2 className="magazine-title">Magazine Orders</h2>
      <div className="magazine-filters">
        <label>
          Magazine:
          <select value={selectedMagazine} onChange={(e) => setSelectedMagazine(e.target.value)}>
            <option value="">-- Select Magazine --</option>
            {magazines.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label>
          Start:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label>
          End:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <button type="button" onClick={fetchMagazineOrders}>Show Orders</button>
      </div>

      <table className="magazine-stats-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Total Units Sold</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(magazineProductStats).length === 0 ? (
            <tr><td colSpan="2" style={{ textAlign: "center" }}>No data</td></tr>
          ) : (
            Object.entries(magazineProductStats).map(([name, qty]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{qty}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Agent Section */}
      <h2 className="agent-title">Agent Orders</h2>
      <div className="agent-filters">
        <label>
          Agent:
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
            <option value="">-- Select Agent --</option>
            {agents.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Start:
          <input type="date" value={agentStartDate} onChange={(e) => setAgentStartDate(e.target.value)} />
        </label>

        <label>
          End:
          <input type="date" value={agentEndDate} onChange={(e) => setAgentEndDate(e.target.value)} />
        </label>

        <button type="button" onClick={fetchAgentOrders}>Show Orders</button>
      </div>

      <div className="agent-stats-section">
        <p>Total Orders: {agentStats.totalOrders}</p>
        <p>Total Revenue: {agentStats.totalRevenue.toFixed(2)} RON</p>

        <table className="magazine-stats-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(agentStats.products).length === 0 ? (
              <tr><td colSpan="2" style={{ textAlign: "center" }}>No data</td></tr>
            ) : (
              Object.entries(agentStats.products).map(([name, qty]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==============================
// ORDER ROW COMPONENT
// ==============================
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
        <td>{order.signature ? <img src={order.signature} alt="Signature" className="signature-img" /> : "N/A"}</td>
        <td><button type="button" onClick={() => setOpen(!open)}>View</button></td>
        <td><button type="button" className="delete-btn" onClick={() => deleteOrder(order._id)}>🗑️</button></td>
      </tr>

      {open && (
        <tr className="details-row">
          <td colSpan="11">
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
                  {order.items.map((item) => {
                    const totalUnits =
                      Number(item.quantity || 0) +
                      Number(item.boxes || 0) * Number(item.unitsPerBox || 0);

                    return (
                      <tr key={item._id || item.name}>
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
