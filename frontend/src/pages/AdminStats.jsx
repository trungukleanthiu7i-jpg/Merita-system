import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/AdminStats.scss";

export default function AdminStats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    mostSold: [],
    leastSold: []
  });

  // ===========================
  // FETCH ORDERS
  // ===========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get("/admin/orders");

        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.orders && Array.isArray(res.data.orders)) {
          data = res.data.orders;
        }

        setOrders(data);

        // ===========================
        // COUNT BOXES per product
        // ===========================
        const productCount = {};

        data.forEach(order => {
          (order.items || []).forEach(item => {
            const boxes = Number(item.boxes || 0);

            if (!productCount[item.name]) productCount[item.name] = 0;
            productCount[item.name] += boxes; // ✅ COUNT BOXES ONLY
          });
        });

        const sortedProducts = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1]); // highest boxes first

        setProductStats({
          mostSold: sortedProducts.slice(0, 5),
          leastSold: sortedProducts.slice(-5).reverse()
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading statistics...</p>;

  // ===========================
  // Totals (in boxes)
  // ===========================
  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  const totalBoxesSold = Array.isArray(orders)
    ? orders.reduce(
        (sum, order) =>
          sum +
          (order.items || []).reduce(
            (s, item) => s + Number(item.boxes || 0),
            0
          ),
        0
      )
    : 0;

  const totalRevenue = Array.isArray(orders)
    ? orders.reduce(
        (sum, order) =>
          sum +
          (order.items || []).reduce(
            (s, item) =>
              s + Number(item.boxes || 0) * Number(item.price || 0),
            0
          ),
        0
      )
    : 0;

  return (
    <div className="admin-stats">
      <h1>Admin Statistics</h1>

      <div className="statistics-section">
        {/* Main Totals */}
        <div className="main-stats">
          <p>Total Orders: {totalOrders}</p>
          <p>Total Boxes Sold: {totalBoxesSold}</p>
          <p>Total Revenue: {totalRevenue.toFixed(2)} RON</p>
        </div>

        {/* Product Stats */}
        <h3 className="product-stats-title">Product Stats (by total boxes)</h3>
        <div className="product-stats">
          <div className="stat-box">
            <h4>Most Sold Products</h4>
            <ul>
              {productStats.mostSold.map(([name, boxes], idx) => (
                <li key={idx}>
                  {name} — {boxes} boxes
                </li>
              ))}
            </ul>
          </div>

          <div className="stat-box">
            <h4>Least Sold Products</h4>
            <ul>
              {productStats.leastSold.map(([name, boxes], idx) => (
                <li key={idx}>
                  {name} — {boxes} boxes
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
