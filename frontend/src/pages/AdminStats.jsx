import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "../styles/AdminStats.scss";

export default function AdminStats() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    mostSold: [],
    leastSold: [],
  });
  const [trendStats, setTrendStats] = useState({
    boxesChange: 0,
    revenueChange: 0,
    trendingProducts: [],
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ================================
  // PRELUARE POROSITE
  // ================================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get("/admin/orders");
        const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(data);
      } catch (err) {
        console.error("Eroare la preluarea porosive:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ================================
  // FILTRARE POROSITE DUPĂ DATĂ
  // ================================
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;
    return true;
  });

  // ================================
  // CALCUL STATISTICI
  // ================================
  useEffect(() => {
    if (!filteredOrders.length) {
      setProductStats({ mostSold: [], leastSold: [] });
      setTrendStats({ boxesChange: 0, revenueChange: 0, trendingProducts: [] });
      return;
    }

    const productCount = {};
    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const boxes = Number(item.boxes || 0);
        productCount[item.name] = (productCount[item.name] || 0) + boxes;
      });
    });

    const sortedProducts = Object.entries(productCount).sort(
      (a, b) => b[1] - a[1]
    );
    setProductStats({
      mostSold: sortedProducts.slice(0, 5),
      leastSold: sortedProducts.slice(-5).reverse(),
    });

    // Produse în trend & modificări procentuale
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    let boxesCurrentWeek = 0,
      boxesPreviousWeek = 0;
    let revenueCurrentMonth = 0,
      revenuePreviousMonth = 0;
    const productChangeMap = {};

    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      (order.items || []).forEach((item) => {
        const boxes = Number(item.boxes || 0);
        const unitsPerBox = Number(item.unitsPerBox || 0);
        const quantity = Number(item.quantity || 0);
        const totalUnits = quantity + boxes * unitsPerBox;
        const revenue = totalUnits * Number(item.price || 0);

        if (orderDate >= oneWeekAgo) boxesCurrentWeek += boxes;
        else boxesPreviousWeek += boxes;

        if (orderDate >= oneMonthAgo) revenueCurrentMonth += revenue;
        else revenuePreviousMonth += revenue;

        if (!productChangeMap[item.name])
          productChangeMap[item.name] = { current: 0, previous: 0 };
        if (orderDate >= oneWeekAgo) productChangeMap[item.name].current += boxes;
        else productChangeMap[item.name].previous += boxes;
      });
    });

    const boxesChange = boxesPreviousWeek
      ? Number(
          (
            ((boxesCurrentWeek - boxesPreviousWeek) / boxesPreviousWeek) *
            100
          ).toFixed(1)
        )
      : 0;
    const revenueChange = revenuePreviousMonth
      ? Number(
          (
            ((revenueCurrentMonth - revenuePreviousMonth) / revenuePreviousMonth) *
            100
          ).toFixed(1)
        )
      : 0;

    const trendingProducts = Object.entries(productChangeMap)
      .map(([name, data]) => {
        const change = data.previous
          ? Number((((data.current - data.previous) / data.previous) * 100).toFixed(1))
          : 100;
        return { name, change, direction: change >= 0 ? "up" : "down" };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);

    setTrendStats({ boxesChange, revenueChange, trendingProducts });
  }, [filteredOrders]);

  if (loading) return <p style={{ textAlign: "center" }}>Se încarcă statisticile...</p>;

  const totalOrders = filteredOrders.length;
  const totalBoxesSold = filteredOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce((s, item) => s + Number(item.boxes || 0), 0),
    0
  );
  const totalRevenue = filteredOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce((s, item) => {
        const boxes = Number(item.boxes || 0);
        const unitsPerBox = Number(item.unitsPerBox || 0);
        const quantity = Number(item.quantity || 0);
        const totalUnits = quantity + boxes * unitsPerBox;
        return s + totalUnits * Number(item.price || 0);
      }, 0),
    0
  );

  // ================================
  // BUTON ÎNAPOI
  // ================================
  const handleBack = () => {
    navigate(-1); // Mergi întotdeauna la pagina precedentă
  };

  return (
    <div className="admin-stats">
      <div
        className="back-arrow"
        role="button"
        tabIndex={0}
        onClick={handleBack}
        onKeyPress={(e) => {
          if (e.key === "Enter") handleBack();
        }}
        aria-label="Înapoi la pagina precedentă"
      >
        ← Înapoi
      </div>

      <h1>Statistici Administrator</h1>

      <div className="date-filters">
        <label>
          De la:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Până la:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="statistics-section">
        <div className="main-stats">
          <p>Număr total de porosi: {totalOrders}</p>
          <p>
            Total Kuti vândute: {totalBoxesSold}{" "}
            {trendStats.boxesChange >= 0
              ? `(+${trendStats.boxesChange}% față de săptămâna trecută)`
              : `(${trendStats.boxesChange}% față de săptămâna trecută)`}
          </p>
          <p>
            Venit total: {totalRevenue.toFixed(2)} RON{" "}
            {trendStats.revenueChange >= 0
              ? `(+${trendStats.revenueChange}% față de luna trecută)`
              : `(${trendStats.revenueChange}% față de luna trecută)`}
          </p>
        </div>

        <h3 className="product-stats-title">Statistici Produse (după kutii vândute)</h3>
        <div className="product-stats">
          <div className="stat-box">
            <h4>Produse cele mai vândute</h4>
            <ul>
              {productStats.mostSold.map(([name, boxes], idx) => (
                <li key={idx}>
                  {name} - {boxes} kutii
                </li>
              ))}
            </ul>
          </div>
          <div className="stat-box">
            <h4>Produse cele mai puțin vândute</h4>
            <ul>
              {productStats.leastSold.map(([name, boxes], idx) => (
                <li key={idx}>
                  {name} - {boxes} kutii
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="product-stats-title">Produse în trend</h3>
        <div className="product-stats">
          {trendStats.trendingProducts.map((p, idx) => (
            <div key={idx} className="stat-box">
              <h4>{p.name}</h4>
              <p style={{ color: p.direction === "up" ? "green" : "red" }}>
                {p.change > 0 ? `+${p.change}%` : `${p.change}%`}{" "}
                {p.direction === "up" ? "⬆️" : "⬇️"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
