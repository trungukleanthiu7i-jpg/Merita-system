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
  // FETCH PRODUCTS FOR BARCODE LOOKUP
  // ===============================
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gabim gjatë marrjes së produkteve:", err);
      setProducts([]);
    }
  }, []);

  // ===============================
  // FETCH ALL ORDERS
  // ===============================
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/orders", {
        params: { search, date: selectedDate },
      });

      // SORT BY orderNumber descending (latest order on top)
      const sortedOrders = Array.isArray(res.data)
        ? res.data.sort((a, b) => Number(b.orderNumber) - Number(a.orderNumber))
        : [];

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Gabim gjatë marrjes së porosive:", err);
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
      setMagazines([...new Set(data.map((o) => o.magazinName).filter(Boolean))]);
      setAgents([...new Set(data.map((o) => o.agentName).filter(Boolean))]);
    } catch (err) {
      console.error("Gabim gjatë marrjes së dyqaneve/agjentëve:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchMagazinesAndAgents();
  }, [fetchOrders, fetchMagazinesAndAgents, fetchProducts]);

  // ===============================
  // DELETE ORDER
  // ===============================
  const deleteOrder = async (id) => {
    if (!window.confirm("Ta fshij këtë porosi?")) return;
    try {
      await axiosClient.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Gabim gjatë fshirjes së porosisë:", err);
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
    if (!selectedMagazine) return alert("Ju lutem zgjidhni një dyqan");
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
      console.error("Gabim gjatë marrjes së porosive të dyqanit:", err);
    }
  };

  // ===============================
  // AGENT FILTER SECTION
  // ===============================
  const fetchAgentOrders = async () => {
    if (!selectedAgent) return alert("Ju lutem zgjidhni një agjent");
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
      console.error("Gabim gjatë marrjes së porosive të agjentit:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Paneli i Administratorit</h1>

      <div className="admin-buttons">
        <button
          type="button"
          className="stats-btn"
          onClick={handleViewStatistics}
        >
          📊 Shiko statistikat
        </button>
        <button
          type="button"
          className="add-product-btn"
          onClick={handleAddProduct}
        >
          ➕ Shto produkt
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Kërko sipas agjentit ose dyqanit..."
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
      <h2>Të gjitha porositë</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Agjenti</th>
            <th>Dyqani</th>
            <th>Totali</th>
            <th>Data</th>
            <th>NIPT</th>
            <th>Adresa</th>
            <th>Përgjegjësi</th>
            <th>Nënshkrimi</th>
            <th>Detaje</th>
            <th>Fshi</th>
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
                Nuk u gjet asnjë porosi
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MAGAZINE SECTION */}
      <div className="magazine-section">
        <h2>Porositë sipas dyqanit</h2>
        <div className="filters">
          <select
            value={selectedMagazine}
            onChange={(e) => setSelectedMagazine(e.target.value)}
          >
            <option value="">Zgjidh dyqanin</option>
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
            Merr porositë
          </button>
        </div>

        {Object.keys(magazineProductStats).length > 0 && (
          <table className="stats-table">
            <thead>
              <tr>
                <th>Produkti</th>
                <th>Njësi</th>
                <th>Kuti</th>
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
        <h2>Porositë sipas agjentit</h2>
        <div className="filters">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="">Zgjidh agjentin</option>
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
            Merr porositë
          </button>
        </div>

        <div className="agent-stats">
          <p>Totali i porosive: {agentStats.totalOrders}</p>
          <p>Të ardhurat totale: {agentStats.totalRevenue.toFixed(2)} Lek</p>

          {Object.keys(agentStats.products).length > 0 && (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Produkti</th>
                  <th>Njësi</th>
                  <th>Kuti</th>
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
// ORDER ROW COMPONENT WITH BARCODE
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
    doc.text(`Porosia #${order.orderNumber}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Agjenti: ${order.agentName}`, 14, 35);
    doc.text(`Dyqani: ${order.magazinName}`, 14, 42);
    doc.text(
      `Data: ${new Date(order.createdAt).toLocaleDateString()}`,
      14,
      49
    );
    doc.text(`NIPT: ${order.cui}`, 14, 56);
    doc.text(`Adresa: ${order.address}`, 14, 63);
    doc.text(`Përgjegjësi:`, 14, 73);
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
      head: [["Produkti", "Kuti", "Njësi/Kuti", "Totali i njësive", "Çmimi", "Barkodi"]],
      body: rows.map((r) => [
        r.item.name,
        r.item.boxes,
        r.item.unitsPerBox,
        r.totalUnits,
        (r.totalUnits * Number(r.item.price || 0)).toFixed(2) + " Lek",
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
    doc.text(`TOTALI: ${total.toFixed(2)} Lek`, 14, finalY);

    doc.save(`Porosia_${order.orderNumber}.pdf`);
  };

  return (
    <>
      <tr>
        <td>{order.orderNumber}</td>
        <td>{order.agentName}</td>
        <td>{order.magazinName}</td>
        <td>{total.toFixed(2)} Lek</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>{order.cui}</td>
        <td>{order.address}</td>
        <td>{order.responsiblePerson}</td>
        <td>
          {order.signature ? (
            <img src={order.signature} alt="Nënshkrimi" className="signature-img" />
          ) : (
            "N/A"
          )}
        </td>
        <td>
          <button type="button" onClick={() => setOpen(!open)}>
            Shiko
          </button>
        </td>
        <td>
          <button
            type="button"
            className="delete-btn"
            onClick={() => deleteOrder(order._id)}
            title="Fshi"
          >
            🗑️
          </button>
          <button
            type="button"
            className="download-btn"
            onClick={handleDownloadPDF}
            title="Shkarko PDF"
          >
            ⬇️
          </button>
        </td>
      </tr>

      {open && (
        <tr className="details-row">
          <td colSpan="12">
            <div className="details-box">
              <h3>Produktet</h3>
              <table className="details-products-table">
                <thead>
                  <tr>
                    <th>Produkti</th>
                    <th>Barkodi</th>
                    <th>Kuti</th>
                    <th>Njësi/Kuti</th>
                    <th>Totali i njësive</th>
                    <th>Çmimi</th>
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
                        <td>{(totalUnits * Number(item.price || 0)).toFixed(2)} Lek</td>
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
