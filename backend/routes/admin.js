const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/* ---------------------------------------
   GET ALL ORDERS (with search + date)
---------------------------------------- */
router.get("/orders", async (req, res) => {
  try {
    const { search = "", date = "" } = req.query;

    let query = {};

    // Search by agent or magazin
    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: "i" } },
        { magazinName: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Admin GET orders error:", err);
    res.json([]); // always return array
  }
});

/* ---------------------------------------
   GET MAGAZINE ORDERS (by name + optional date range)
---------------------------------------- */
router.get("/magazine-orders", async (req, res) => {
  try {
    const { magazinName, startDate, endDate } = req.query;

    if (!magazinName)
      return res.status(400).json({ message: "Magazine name is required" });

    const query = { magazinName };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    console.log(`Magazine Orders Query:`, query);
    console.log(`Found ${orders.length} orders`);

    res.json(orders);
  } catch (err) {
    console.error("Admin GET magazine-orders error:", err);
    res.json([]);
  }
});

/* ---------------------------------------
   GET AGENT ORDERS (by name + optional date range)
---------------------------------------- */
router.get("/agent-orders", async (req, res) => {
  try {
    const { agentName, startDate, endDate } = req.query;

    if (!agentName)
      return res.status(400).json({ message: "Agent name is required" });

    const query = { agentName };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    console.log(`Agent Orders Query:`, query);
    console.log(`Found ${orders.length} orders`);

    res.json(orders);
  } catch (err) {
    console.error("Admin GET agent-orders error:", err);
    res.json([]);
  }
});

/* ---------------------------------------
   GET unique magazines & agents
---------------------------------------- */
router.get("/orders-meta", async (req, res) => {
  try {
    const orders = await Order.find({});

    const magazines = [
      ...new Set(orders.map(o => o.magazinName).filter(Boolean))
    ];
    const agents = [
      ...new Set(orders.map(o => o.agentName).filter(Boolean))
    ];

    res.json({ magazines, agents });
  } catch (err) {
    console.error("Admin GET orders-meta error:", err);
    res.json({ magazines: [], agents: [] });
  }
});

/* ---------------------------------------
   DELETE ORDER
---------------------------------------- */
router.delete("/orders/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE order error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
