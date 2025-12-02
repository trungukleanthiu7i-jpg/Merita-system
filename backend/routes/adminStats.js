const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

// GET STATS (basic totals)
router.get("/stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};

    // If start & end dates exist → filter by range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59")
      };
    }

    const orders = await Order.find(query);

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalBoxes = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const qty = Number(item.quantity);
        const boxes = Number(item.boxes || 0);
        const unitsPerBox = Number(item.unitsPerBox || 0);

        const units = qty + boxes * unitsPerBox;

        totalUnits += units;
        totalBoxes += boxes;
        totalRevenue += units * Number(item.price);
      });
    });

    res.json({
      totalOrders,
      totalRevenue,
      totalUnits,
      totalBoxes
    });

  } catch (err) {
    console.log("STAT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
