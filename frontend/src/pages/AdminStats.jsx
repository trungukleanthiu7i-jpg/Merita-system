import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/AdminStats.scss";

export default function AdminStats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({ mostSold: [], leastSold: [] });

  // ===========================
  // FETCH ORDERS
  // ===========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get("/admin/orders");

        // Normalize data as array
        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.orders && Array.isArray(res.data.orders)) {
          data = res.data.orders;
        }

        setOrders(data);

        // Compute product stats using boxes only
        const productCount = {};
        data.forEach(order => {
          (order.items || []).forEach(item => {
            const boxes = Number(item.boxes || 0);

            if (!productCount[item.name]) productCount[item.name] = 0;
            productCount[item.name] += boxes; // <-- Changed: count only boxes
          });
        });

        // Sort products by total boxes sold
        const sortedProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]);

        setProductStats({
          mostSold: sortedProducts.slice(0, 5),
          leastSold: sortedProducts.slice(-5).reverse(), // reverse to show least first
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
  // Totals
  // ===========================
  const totalOrders = Array.isArray(orders) ? orders.length : 0;

  const totalUnitsSold = Array.isArray(orders)
    ? orders.reduce(
        (sum, order) =>
          sum +
          (order.items || []).reduce((s, item) => {
            const boxes = Number(item.boxes || 0);
            return s + boxes; // <-- Changed: count only boxes
          }, 0),
        0
      )
    : 0;

  const totalRevenue = Array.isArray(orders)
    ? orders.reduce(
        (sum, order) =>
          sum +
          (order.items || []).reduce((s, item) => {
            const boxes = Number(item.boxes || 0);
            const unitsPerBox = Number(item.unitsPerBox || 0);
            const quantity = Number(item.quantity || 0);
            const totalUnits = quantity + boxes * unitsPerBox; // keep revenue calculation unchanged
            return s + totalUnits * Number(item.price || 0);
          }, 0),
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
          <p>Total Units Sold: {totalUnitsSold}</p>
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
                  {name} - {boxes} boxes {/* <-- Changed: display boxes */}
                </li>
              ))}
            </ul>
          </div>

          <div className="stat-box">
            <h4>Least Sold Products</h4>
            <ul>
              {productStats.leastSold.map(([name, boxes], idx) => (
                <li key={idx}>
                  {name} - {boxes} boxes {/* <-- Changed: display boxes */}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
