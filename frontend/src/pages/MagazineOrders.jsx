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
    // 🔥 ADAUGĂ TOKEN DE AUTENTIFICARE AICI
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
        console.error("Eroare la preluarea magazinelor:", err);
      }
    };

    fetchMagazines();
  }, []);

  // Preluare comenzi filtrate
  const fetchOrders = async () => {
    if (!selectedMagazine) return alert("Vă rugăm să selectați un magazin");

    try {
      const res = await axiosClient.get("/admin/magazine-orders", {
        params: { magazinName: selectedMagazine, startDate, endDate },
      });

      const ordersData = Array.isArray(res.data) ? res.data : [];
      setOrders(ordersData);

      const stats = {};
      ordersData.forEach(order => {
        (order.items || []).forEach(item => {
          const name = item.name || "Produs fără nume";
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 1);

          stats[name] = (stats[name] || 0) + totalUnits;
        });
      });

      setProductStats(stats);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor magazinului:", err);
      setProductStats({});
    }
  };

  return (
    <div>
      <h2>Comenzile Magazinelor</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Magazin:{" "}
          <select
            value={selectedMagazine}
            onChange={(e) => setSelectedMagazine(e.target.value)}
          >
            <option value="">-- Selectați un magazin --</option>
            {magazines.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Data început:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ marginLeft: "20px" }}>
          Data sfârșit:{" "}
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
          Afișează comenzile
        </button>
      </div>

      <h3>Statistici Produse</h3>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Nume produs</th>
            <th>Total unități vândute</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(productStats).length === 0 ? (
            <tr><td colSpan="2">Nu s-au găsit comenzi</td></tr>
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
