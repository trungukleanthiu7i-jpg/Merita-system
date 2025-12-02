import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/AdminStats.scss";

export default function AdminStats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({ mostSold: [], leastSold: [] });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get("/admin/orders");
        setOrders(res.data);

        // Compute product stats using boxes
        const productCount = {};
        res.data.forEach(order => {
          order.items.forEach(item => {
            const boxes = Number(item.boxes || 0);
            if (!productCount[item.name]) productCount[item.name] = 0;
            productCount[item.name] += boxes;
          });
        });

        // Sort products by boxes sold
        const sortedProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]);

        setProductStats({
          mostSold: sortedProducts.slice(0, 5),
          leastSold: sortedProducts.slice(-5), // bottom 5
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

  // Totals using boxes
  const totalOrders = orders.length;
  const totalBoxes = orders.reduce((sum, order) =>
    sum + order.items.reduce((s, item) => s + Number(item.boxes || 0), 0), 0
  );

  const totalRevenue = orders.reduce((sum, order) =>
    sum + order.items.reduce((s, item) => {
      const boxes = Number(item.boxes || 0);
      const unitsPerBox = Number(item.unitsPerBox || 0);
      const quantity = Number(item.quantity || 0);
      const totalUnits = quantity + boxes * unitsPerBox;
      return s + totalUnits * Number(item.price || 0);
    }, 0), 0
  );

  return (
    <div className="admin-stats">
      <h1>Admin Statistics</h1>

      <div className="statistics-section">
        {/* Main totals */}
        <div className="main-stats">
          <p>Total Orders: {totalOrders}</p>
          <p>Total Revenue: {totalRevenue.toFixed(2)} RON</p>
          <p>Total Boxes Sold: {totalBoxes}</p>
        </div>

        {/* Product stats section */}
        <h3 className="product-stats-title">Product Stats (by boxes)</h3>
        <div className="product-stats">
          <div className="stat-box">
            <h4>Most Sold Products</h4>
            <ul>
              {productStats.mostSold.map(([name, boxes], idx) => (
                <li key={idx}>{name} - {boxes} boxes</li>
              ))}
            </ul>
          </div>

          <div className="stat-box">
            <h4>Least Sold Products</h4>
            <ul>
              {productStats.leastSold.map(([name, boxes], idx) => (
                <li key={idx}>{name} - {boxes} boxes</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
