const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

/* ---------------------------------------
   GET ALL ORDERS (with search + date)
---------------------------------------- */
router.get("/orders", async (req, res) => {
  try {
    const { search = "", date = "" } = req.query;

    let query = {};

    // FILTER: search by agent or magazin
    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: "i" } },
        { magazinName: { $regex: search, $options: "i" } }
      ];
    }

    // FILTER: by date (yyyy-mm-dd)
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.log("Admin GET orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------
   GET ORDERS BY MAGAZINE (with optional date range)
---------------------------------------- */
router.get("/magazine-orders", async (req, res) => {
  try {
    const { magazinName, startDate, endDate } = req.query;

    if (!magazinName) return res.status(400).json({ message: "Magazine name is required" });

    const query = { magazinName };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Admin GET magazine-orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------------------
   DELETE ORDER
---------------------------------------- */
router.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE order error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
