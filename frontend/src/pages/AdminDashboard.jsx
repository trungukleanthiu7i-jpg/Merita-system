import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/AdminDashboard.scss";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Magazine Orders states
  const [magazines, setMagazines] = useState([]);
  const [selectedMagazine, setSelectedMagazine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [magazineOrders, setMagazineOrders] = useState([]);
  const [magazineProductStats, setMagazineProductStats] = useState({});

  // Agent Orders states
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [agentStartDate, setAgentStartDate] = useState("");
  const [agentEndDate, setAgentEndDate] = useState("");
  const [agentStats, setAgentStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    products: {},
  });

  // Fetch all orders for general table
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/admin/orders", {
        params: { search, date: selectedDate },
      });
      setOrders(res.data);

      // Populate magazines & agents
      const names = [...new Set(res.data.map(order => order.magazinName))];
      setMagazines(names);
      const agentsNames = [...new Set(res.data.map(order => order.agentName))];
      setAgents(agentsNames);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, selectedDate]);

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    await axiosClient.delete(`/admin/orders/${id}`);
    fetchOrders();
  };

  const handleViewStatistics = () => navigate("/admin/stats");
  const handleAddProduct = () => navigate("/admin/add-product");

  // =========================
  // Magazine Orders Section
  // =========================
  const fetchMagazineOrders = async () => {
    if (!selectedMagazine) return alert("Please select a magazine");

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return order.magazinName === selectedMagazine &&
        (!start || orderDate >= start) &&
        (!end || orderDate <= end);
    });

    setMagazineOrders(filteredOrders);

    const stats = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const name = item.name;
        if (!stats[name]) stats[name] = 0;
        stats[name] += Number(item.quantity || 0) + Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
      });
    });
    setMagazineProductStats(stats);
  };

  // =========================
  // Agent Orders Section
  // =========================
  const fetchAgentOrders = async () => {
    if (!selectedAgent) return alert("Please select an agent");

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = agentStartDate ? new Date(agentStartDate) : null;
      const end = agentEndDate ? new Date(agentEndDate) : null;
      return order.agentName === selectedAgent &&
        (!start || orderDate >= start) &&
        (!end || orderDate <= end);
    });

    // Compute stats
    let totalRevenue = 0;
    const products = {};
    filteredOrders.forEach(order => {
      let orderTotal = 0;
      order.items.forEach(item => {
        const boxes = Number(item.boxes || 0);
        const unitsPerBox = Number(item.unitsPerBox || 0);
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const totalUnits = quantity + boxes * unitsPerBox;
        orderTotal += totalUnits * price;

        if (!products[item.name]) products[item.name] = 0;
        products[item.name] += totalUnits;
      });
      totalRevenue += orderTotal;
    });

    setAgentStats({
      totalRevenue,
      totalOrders: filteredOrders.length,
      products,
    });
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Admin Buttons */}
      <div className="admin-buttons">
        <button className="stats-btn" onClick={handleViewStatistics}>📊 View Statistics</button>
        <button className="add-product-btn" onClick={handleAddProduct}>➕ Add Product</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <input type="text" placeholder="Search by agent or magazin..." value={search} onChange={e => setSearch(e.target.value)} />
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      {/* All Orders Table */}
      <h2>All Orders</h2>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Agent</th><th>Magazin</th><th>Total</th>
            <th>Date</th><th>CUI</th><th>Address</th><th>Responsible</th>
            <th>Signature</th><th>Details</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <OrderRow key={order._id} order={order} index={index + 1} deleteOrder={deleteOrder} />
          ))}
        </tbody>
      </table>

      {/* Magazine Orders Section */}
      <h2 className="magazine-title">Magazine Orders</h2>
      <div className="magazine-filters">
        <label>Magazine: 
          <select value={selectedMagazine} onChange={e => setSelectedMagazine(e.target.value)}>
            <option value="">-- Select Magazine --</option>
            {magazines.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label>Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label>End Date: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button onClick={fetchMagazineOrders}>Show Orders</button>
      </div>

      <table className="magazine-stats-table">
        <thead>
          <tr><th>Product Name</th><th>Total Units Sold</th></tr>
        </thead>
        <tbody>
          {Object.keys(magazineProductStats).length === 0
            ? <tr><td colSpan="2">No orders found</td></tr>
            : Object.entries(magazineProductStats).map(([name, qty]) => <tr key={name}><td>{name}</td><td>{qty}</td></tr>)
          }
        </tbody>
      </table>

      {/* Agent Orders Section */}
      <h2 className="agent-title">Agent Orders</h2>
      <div className="agent-filters">
        <label>Agent: 
          <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
            <option value="">-- Select Agent --</option>
            {agents.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label>Start Date: <input type="date" value={agentStartDate} onChange={e => setAgentStartDate(e.target.value)} /></label>
        <label>End Date: <input type="date" value={agentEndDate} onChange={e => setAgentEndDate(e.target.value)} /></label>
        <button onClick={fetchAgentOrders}>Show Orders</button>
      </div>

      <div className="agent-stats-section">
        <p>Total Orders: {agentStats.totalOrders}</p>
        <p>Total Revenue: {agentStats.totalRevenue.toFixed(2)} RON</p>
        <table className="magazine-stats-table">
          <thead><tr><th>Product Name</th><th>Total Units Sold</th></tr></thead>
          <tbody>
            {Object.keys(agentStats.products).length === 0
              ? <tr><td colSpan="2">No orders found</td></tr>
              : Object.entries(agentStats.products).map(([name, qty]) => <tr key={name}><td>{name}</td><td>{qty}</td></tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =======================================
// ORDER ROW COMPONENT
// =======================================
function OrderRow({ order, index, deleteOrder }) {
  const [open, setOpen] = useState(false);
  const total = order.items.reduce((sum, item) => {
    const boxes = Number(item.boxes || 0);
    const unitsPerBox = Number(item.unitsPerBox || 0);
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    return sum + (quantity + boxes * unitsPerBox) * price;
  }, 0);

  return (
    <>
      <tr>
        <td>{index}</td><td>{order.agentName}</td><td>{order.magazinName}</td><td>{total.toFixed(2)} RON</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{order.cui}</td><td>{order.address}</td><td>{order.responsiblePerson}</td>
        <td>{order.signature ? <img src={order.signature} alt="Signature" className="signature-img" /> : "N/A"}</td>
        <td><button className="details-btn" onClick={() => setOpen(!open)}>{open ? "Hide" : "View"}</button></td>
        <td><button className="delete-btn" onClick={() => deleteOrder(order._id)}>🗑️</button></td>
      </tr>
      {open && (
        <tr className="details-row">
          <td colSpan="11">
            <div className="details-box">
              <h3>Products</h3>
              <table className="details-products-table">
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Boxes</th><th>Units/Box</th><th>Total Units</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {order.items.map(item => {
                    const boxes = Number(item.boxes || 0);
                    const unitsPerBox = Number(item.unitsPerBox || 0);
                    const quantity = Number(item.quantity || 0);
                    const price = Number(item.price || 0);
                    const totalUnits = quantity + boxes * unitsPerBox;
                    return <tr key={item._id}><td>{item.name}</td><td>{quantity}</td><td>{boxes}</td><td>{unitsPerBox}</td><td>{totalUnits}</td><td>{(totalUnits * price).toFixed(2)} RON</td></tr>
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
