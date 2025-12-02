import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.scss";

const MagazineOrders = () => {
  const [magazines, setMagazines] = useState([]);
  const [selectedMagazine, setSelectedMagazine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [productStats, setProductStats] = useState({});

  // Fetch all distinct magazine names from orders
  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/orders");
        const names = [...new Set(res.data.map(order => order.magazinName))];
        setMagazines(names);
      } catch (err) {
        console.error("Error fetching magazines:", err);
      }
    };
    fetchMagazines();
  }, []);

  // Fetch orders for selected magazine and date range
  const fetchOrders = async () => {
    if (!selectedMagazine) return alert("Please select a magazine");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/magazine-orders`,
        {
          params: {
            magazinName: selectedMagazine,
            startDate,
            endDate
          }
        }
      );
      setOrders(res.data);

      // Aggregate product quantities
      const stats = {};
      res.data.forEach(order => {
        order.products.forEach(item => {
          const name = item.productName || item.productId?.name;
          if (!stats[name]) stats[name] = 0;
          stats[name] += item.quantity;
        });
      });
      setProductStats(stats);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  return (
    <div>
      <h2>Magazine Orders</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Magazine:{" "}
          <select
            value={selectedMagazine}
            onChange={e => setSelectedMagazine(e.target.value)}
          >
            <option value="">-- Select Magazine --</option>
            {magazines.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ marginLeft: "20px" }}>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>

        <button
          onClick={fetchOrders}
          style={{ marginLeft: "20px", padding: "5px 10px" }}
        >
          Show Orders
        </button>
      </div>

      <h3>Product Stats</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(productStats).length === 0 ? (
            <tr>
              <td colSpan="2">No orders found</td>
            </tr>
          ) : (
            Object.entries(productStats).map(([name, qty]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{qty}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MagazineOrders;
