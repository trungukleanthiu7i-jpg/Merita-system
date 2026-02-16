import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/AdminDashboard.scss";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReactBarcode } from "react-jsbarcode";
import JsBarcode from "jsbarcode";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [products, setProducts] = useState([]);
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
  // FETCH PRODUSE PENTRU BARCODE
  // ===============================
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gabim la preluarea produselor:", err);
      setProducts([]);
    }
  }, []);

  // ===============================
  // FETCH TOATE POROSILE
  // ===============================
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/orders", {
        params: { search, date: selectedDate },
      });

      const sortedOrders = Array.isArray(res.data)
        ? res.data.sort((a, b) => Number(b.orderNumber) - Number(a.orderNumber))
        : [];

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor:", err);
      setOrders([]);
    }
  }, [search, selectedDate]);

  // ===============================
  // FETCH MAGAZINE + AGENTI
  // ===============================
  const fetchMagazinesAndAgents = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/orders");
      const data = Array.isArray(res.data) ? res.data : [];
      setMagazines([...new Set(data.map((o) => o.magazinName).filter(Boolean))]);
      setAgents([...new Set(data.map((o) => o.agentName).filter(Boolean))]);
    } catch (err) {
      console.error("Gabim la preluarea dyqaneve/agjentëve:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchMagazinesAndAgents();
  }, [fetchOrders, fetchMagazinesAndAgents, fetchProducts]);

  // ===============================
  // ȘTERGERE POROSIE
  // ===============================
  const deleteOrder = async (id) => {
    if (!window.confirm("Doriți să ștergeți această comandă?")) return;
    try {
      await axiosClient.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Eroare la ștergerea comenzii:", err);
    }
  };

  // ===============================
  // NAVIGAȚIE
  // ===============================
  const handleViewStatistics = () => navigate("/admin/stats");
  const handleAddProduct = () => navigate("/admin/add-product");

  // ===============================
  // FILTRU DYQAN
  // ===============================
  const fetchMagazineOrders = async () => {
    if (!selectedMagazine) return alert("Vă rugăm să selectați un magazin");
    try {
      const res = await axiosClient.get("/admin/magazine-orders", {
        params: { magazinName: selectedMagazine, startDate, endDate },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const stats = {};
      data.forEach((order) => {
        order.items?.forEach((item) => {
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
          const totalBoxes = Number(item.boxes || 0);
          if (!stats[item.name]) stats[item.name] = { units: 0, boxes: 0 };
          stats[item.name].units += totalUnits;
          stats[item.name].boxes += totalBoxes;
        });
      });
      setMagazineProductStats(stats);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor magazinului.:", err);
    }
  };

  // ===============================
  // FILTRU AGENT
  // ===============================
  const fetchAgentOrders = async () => {
    if (!selectedAgent) return alert("Vă rugăm să selectați un agent");
    try {
      const res = await axiosClient.get("/admin/agent-orders", {
        params: {
          agentName: selectedAgent,
          startDate: agentStartDate,
          endDate: agentEndDate,
        },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      let totalRevenue = 0;
      const products = {};
      data.forEach((order) => {
        order.items?.forEach((item) => {
          const totalUnits =
            Number(item.quantity || 0) +
            Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
          const totalBoxes = Number(item.boxes || 0);
          totalRevenue += totalUnits * Number(item.price || 0);
          if (!products[item.name]) products[item.name] = { units: 0, boxes: 0 };
          products[item.name].units += totalUnits;
          products[item.name].boxes += totalBoxes;
        });
      });
      setAgentStats({ totalRevenue, totalOrders: data.length, products });
    } catch (err) {
      console.error("Eroare la preluarea comenzilor agenților:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Paneli Administrator</h1>

      <div className="admin-buttons">
        <button
          type="button"
          className="stats-btn"
          onClick={handleViewStatistics}
        >
          📊 Vezi statistici
        </button>
        <button
          type="button"
          className="add-product-btn"
          onClick={handleAddProduct}
        >
          ➕ Adaugă produs
        </button>
      </div>

      {/* Filtre */}
      <div className="filters">
        <input
          type="text"
          placeholder="Caută după agent sau magazin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Tabel porosi */}
      <h2>Toate comenzile</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Agent</th>
            <th>Magazin</th>
            <th>Total</th>
            <th>Data</th>
            <th>NIPT</th>
            <th>Adresă</th>
            <th>Responsabil</th>
            <th>Semnătură</th>
            <th>Detalii</th>
            <th>Șterge</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                deleteOrder={deleteOrder}
                products={products}
              />
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                Nu s-a găsit nicio comandă
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Sectiune Magazin */}
      <div className="magazine-section">
        <h2>Comenzile pe magazin</h2>
        <div className="filters">
          <select
            value={selectedMagazine}
            onChange={(e) => setSelectedMagazine(e.target.value)}
          >
            <option value="">Alege magazin</option>
            {magazines.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button type="button" onClick={fetchMagazineOrders}>
            Preia comenzile
          </button>
        </div>

        {Object.keys(magazineProductStats).length > 0 && (
          <table className="stats-table">
            <thead>
              <tr>
                <th>Produs</th>
                <th>Unități</th>
                <th>Box</th>
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

      {/* Sectiune Agent */}
      <div className="agent-section">
        <h2>Comenzile pe agent</h2>
        <div className="filters">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="">Alege agent</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={agentStartDate}
            onChange={(e) => setAgentStartDate(e.target.value)}
          />
          <input
            type="date"
            value={agentEndDate}
            onChange={(e) => setAgentEndDate(e.target.value)}
          />
          <button type="button" onClick={fetchAgentOrders}>
            Preia comenzile
          </button>
        </div>

        <div className="agent-stats">
          <p>Total comenzi: {agentStats.totalOrders}</p>
          <p>Venituri totale: {agentStats.totalRevenue.toFixed(2)} RON</p>

          {Object.keys(agentStats.products).length > 0 && (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Produs</th>
                  <th>Unități</th>
                  <th>Box</th>
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
// COMPONENT RÂND POROSIE CU BARCODE
// ==========================================
function OrderRow({ order, deleteOrder, products }) {
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
    const logo = "/zdrava.png";
    doc.addImage(logo, "PNG", 150, 10, 60, 60);
    doc.setFontSize(18);
    doc.text(`Comanda #${order.orderNumber}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Agent: ${order.agentName}`, 14, 35);
    doc.text(`Magazin: ${order.magazinName}`, 14, 42);
    doc.text(
      `Data: ${new Date(order.createdAt).toLocaleDateString()}`,
      14,
      49
    );
    doc.text(`NIPT: ${order.cui}`, 14, 56);
    doc.text(`Adresă: ${order.address}`, 14, 63);
    doc.text(`Responsabil:`, 14, 73);
    doc.text(order.responsiblePerson, 14, 80);

    if (order.signature) {
      doc.addImage(order.signature, "PNG", 14, 88, 50, 25);
    }

    const rows = order.items.map((item) => {
      const totalUnits =
        Number(item.quantity || 0) +
        Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
      return { item, totalUnits };
    });

    autoTable(doc, {
      startY: 120,
      head: [["Produs", "Box", "Unități/Cutie", "Total Unități", "Preț", "Cod Bare"]],
      body: rows.map((r) => [
        r.item.name,
        r.item.boxes,
        r.item.unitsPerBox,
        r.totalUnits,
        (r.totalUnits * Number(r.item.price || 0)).toFixed(2) + " RON",
        "",
      ]),
      didDrawCell: (data) => {
        if (
          data.column.index === data.table.columns.length - 1 &&
          data.cell.section === "body"
        ) {
          const item = rows[data.row.index].item;
          const barcodeValue = products.find((p) => p.name === item.name)?.barcode || "";
          if (!barcodeValue) return;

          const canvas = document.createElement("canvas");
          JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 3,
            height: 40,
            displayValue: false,
            margin: 0,
          });

          const cellPadding = 2;
          const scale = Math.min(
            1,
            (data.cell.width - cellPadding * 2) / canvas.width
          );
          const imgWidth = canvas.width * scale;
          const imgHeight = canvas.height * scale;
          const imgData = canvas.toDataURL("image/png");

          doc.addImage(
            imgData,
            "PNG",
            data.cell.x + cellPadding,
            data.cell.y + cellPadding,
            imgWidth,
            imgHeight
          );

          doc.setFontSize(4);
          doc.text(
            barcodeValue,
            data.cell.x + data.cell.width / 2,
            data.cell.y + cellPadding + imgHeight + 2,
            { align: "center" }
          );
        }
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: ${total.toFixed(2)} RON`, 14, finalY);

    doc.save(`Comanda${order.orderNumber}.pdf`);
  };

  return (
    <>
      <tr>
        <td>{order.orderNumber}</td>
        <td>{order.agentName}</td>
        <td>{order.magazinName}</td>
        <td>{total.toFixed(2)} RON</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>{order.cui}</td>
        <td>{order.address}</td>
        <td>{order.responsiblePerson}</td>
        <td>
          {order.signature ? (
            <img src={order.signature} alt="Semnătură" className="signature-img" />
          ) : (
            "N/A"
          )}
        </td>
        <td>
          <button type="button" onClick={() => setOpen(!open)}>
            Vezi
          </button>
        </td>
        <td>
          <button
            type="button"
            className="delete-btn"
            onClick={() => deleteOrder(order._id)}
            title="Șterge"
          >
            🗑️
          </button>
          <button
            type="button"
            className="download-btn"
            onClick={handleDownloadPDF}
            title="Descarcă PDF"
          >
            ⬇️
          </button>
        </td>
      </tr>

      {open && (
        <tr className="details-row">
          <td colSpan="12">
            <div className="details-box">
              <h3>Produse</h3>
              <table className="details-products-table">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Cod Bare</th>
                    <th>Box</th>
                    <th>Unități/Cutie</th>
                    <th>Total Unități</th>
                    <th>Preț</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const totalUnits =
                      Number(item.quantity || 0) +
                      Number(item.boxes || 0) * Number(item.unitsPerBox || 0);
                    const barcode =
                      products.find((p) => p.name === item.name)?.barcode || "";
                    return (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>
                          {barcode ? (
                            <ReactBarcode
                              value={barcode}
                              format="CODE128"
                              width={1.5}
                              height={40}
                              displayValue={true}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
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
