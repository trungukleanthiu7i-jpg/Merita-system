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

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gabim la preluarea produselor:", err);
      setProducts([]);
    }
  }, []);

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

  const deleteOrder = async (id) => {
    if (!window.confirm("Doriți să ștergeți această comandă?")) return;
    try {
      await axiosClient.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Eroare la ștergerea comenzii:", err);
    }
  };

  const handleViewStatistics = () => navigate("/admin/stats");
  const handleAddProduct = () => navigate("/admin/add-product");

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

      <h2>Toate comenzile</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Tip document</th>
            <th>Agent</th>
            <th>Magazin</th>
            <th>Total</th>
            <th>Data</th>
            <th>NIPT</th>
            <th>Adresă</th>
            <th>Responsabil</th>
            <th>Comentarii</th>
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
              <td colSpan="13" style={{ textAlign: "center" }}>
                Nu s-a găsit nicio comandă
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

  const documentTypeLabel =
    order.documentType === "aviz" ? "Aviz" : "Factură";

  const commentsText = order.comments?.trim() ? order.comments : "—";

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const logo = "/zdrava.png";
    const marginX = 14;
    let currentY = 16;

    const labelValue = (label, value, y) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, marginX, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "—"), marginX + 32, y);
    };

    const rows = order.items.map((item) => {
      const totalUnits =
        Number(item.quantity || 0) +
        Number(item.boxes || 0) * Number(item.unitsPerBox || 0);

      return {
        item,
        totalUnits,
      };
    });

    doc.setFillColor(248, 249, 251);
    doc.roundedRect(10, 10, 190, 38, 3, 3, "F");

    try {
      doc.addImage(logo, "PNG", pageWidth - 52, 15, 34, 16);
    } catch (err) {
      console.warn("Logo could not be loaded in PDF:", err);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Comanda #${order.orderNumber}`, marginX, 22);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generată la: ${new Date(order.createdAt).toLocaleDateString()}`,
      marginX,
      30
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Tip document: ${documentTypeLabel}`, marginX, 38);

    currentY = 58;

    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(10, currentY - 8, 190, 52, 3, 3);

    labelValue("Agent:", order.agentName, currentY);
    currentY += 8;

    labelValue("Magazin:", order.magazinName, currentY);
    currentY += 8;

    labelValue("Data:", new Date(order.createdAt).toLocaleDateString(), currentY);
    currentY += 8;

    labelValue("NIPT:", order.cui, currentY);
    currentY += 8;

    labelValue("Adresă:", order.address, currentY);
    currentY += 8;

    labelValue("Responsabil:", order.responsiblePerson, currentY);
    currentY += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Comentarii:", marginX, currentY);

    const wrappedComments = doc.splitTextToSize(commentsText, 165);
    const commentsHeight = Math.max(12, wrappedComments.length * 6 + 6);

    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(10, currentY + 3, 190, commentsHeight, 3, 3);

    doc.setFont("helvetica", "normal");
    doc.text(wrappedComments, marginX + 3, currentY + 10);

    currentY += commentsHeight + 16;

    doc.setFont("helvetica", "bold");
    doc.text("Semnătură:", marginX, currentY);

    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(10, currentY + 3, 65, 32, 3, 3);

    if (order.signature) {
      try {
        doc.addImage(order.signature, "PNG", 14, currentY + 7, 55, 22);
      } catch (err) {
        console.warn("Signature could not be loaded in PDF:", err);
      }
    }

    currentY += 42;

    autoTable(doc, {
      startY: currentY,
      head: [["Produs", "Box", "Buc/Cutie", "Total Buc", "Preț", "Cod Bare"]],
      body: rows.map((r) => [
        r.item.name || "—",
        String(r.item.boxes ?? 0),
        String(r.item.unitsPerBox ?? 1),
        String(r.totalUnits),
        `${(r.totalUnits * Number(r.item.price || 0)).toFixed(2)} RON`,
        "",
      ]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
        textColor: [40, 40, 40],
        valign: "middle",
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 62 },
        1: { cellWidth: 16 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 28 },
        5: { cellWidth: 30 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.cell.section === "body") {
          const item = rows[data.row.index].item;
          const barcodeValue =
            products.find((p) => p.name === item.name)?.barcode || "";

          if (!barcodeValue) return;

          const canvas = document.createElement("canvas");
          JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 1.2,
            height: 18,
            displayValue: false,
            margin: 0,
          });

          const imgData = canvas.toDataURL("image/png");

          const imgWidth = 24;
          const imgHeight = 8;
          const x = data.cell.x + (data.cell.width - imgWidth) / 2;
          const y = data.cell.y + 1.5;

          doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

          doc.setFontSize(5);
          doc.setTextColor(60, 60, 60);
          doc.text(
            barcodeValue,
            data.cell.x + data.cell.width / 2,
            data.cell.y + 12,
            { align: "center" }
          );
        }
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(248, 249, 251);
    doc.roundedRect(130, finalY - 4, 70, 14, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`TOTAL: ${total.toFixed(2)} RON`, 165, finalY + 5, {
      align: "center",
    });

    doc.save(`Comanda-${order.orderNumber}.pdf`);
  };

  return (
    <>
      <tr>
        <td>{order.orderNumber}</td>
        <td>{documentTypeLabel}</td>
        <td>{order.agentName}</td>
        <td>{order.magazinName}</td>
        <td>{total.toFixed(2)} RON</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>{order.cui}</td>
        <td>{order.address}</td>
        <td>{order.responsiblePerson}</td>
        <td>{commentsText}</td>
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
          <td colSpan="13">
            <div className="details-box">
              <h3>Produse</h3>
              <p style={{ marginBottom: "12px", fontWeight: "600" }}>
                Tip document: {documentTypeLabel}
              </p>
              <p style={{ marginBottom: "12px" }}>
                <strong>Comentarii:</strong> {commentsText}
              </p>
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