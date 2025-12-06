import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/AdminDashboard.scss";

const MagazineOrders = () => {
  const [magazines, setMagazines] = useState([]);
  const [selectedMagazine, setSelectedMagazine] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [productStats, setProductStats] = useState({});

  useEffect(() => {
    // 🔥 ADD AUTH TOKEN HERE
    const token = localStorage.getItem("token");
    axiosClient.defaults.headers.common["Authorization"] = token
      ? `Bearer ${token}`
      : "";

    const fetchMagazines = async () => {
      try {
        const res = await axiosClient.get("/admin/orders");
        const names = [
          ...new Set(
            res.data.map(order => order.magazinName).filter(Boolean)
          ),
        ];
        setMagazines(names);
      } catch (err) {
        console.error("Error fetching magazines:", err);
      }
    };

    fetchMagazines();
  }, []);

  // Fetch filtered orders
  const fetchOrders = async () => {
    if (!selectedMagazine) return alert("Please select a magazine");

    try {
      const res = await axiosClient.get("/admin/magazine-orders", {
        params: { magazinName: selectedMagazine, startDate, endDate },
      });

      const ordersData = Array.isArray(res.data) ? res.data : [];
      setOrders(ordersData);

      const stats = {};
      ordersData.forEach(order => {
        (order.items || []).forEach(item => {
          const name = item.name || "Unnamed Product";
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 1);

          stats[name] = (stats[name] || 0) + totalUnits;
        });
      });

      setProductStats(stats);
    } catch (err) {
      console.error("Error fetching magazine orders:", err);
      setProductStats({});
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
            onChange={(e) => setSelectedMagazine(e.target.value)}
          >
            <option value="">-- Select Magazine --</option>
            {magazines.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ marginLeft: "20px" }}>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
            <th>Total Units Sold</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(productStats).length === 0 ? (
            <tr><td colSpan="2">No orders found</td></tr>
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
