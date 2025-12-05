const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// =========================
// Create new order
// =========================
router.post("/create", async (req, res) => {
  try {
    const {
      items,
      agentName,
      magazinName,
      cui,
      address,
      responsiblePerson,
      signature,
    } = req.body;

    // Validate required fields
    if (
      !items || !Array.isArray(items) || items.length === 0 ||
      !agentName || !magazinName || !cui ||
      !address || !responsiblePerson || !signature
    ) {
      return res.status(400).json({
        message: "All fields are required, including signature and at least one item.",
      });
    }

    // Validate each item and stock
    for (const item of items) {
      if (!item._id) {
        return res.status(400).json({ message: "Each item must have a valid _id." });
      }

      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item._id}` });
      }

      if (product.stoc === "out of stoc") {
        return res.status(400).json({ message: `Cannot order — product out of stock: ${product.name}` });
      }
    }

    // Calculate total price
    const total = items.reduce((sum, item) => {
      const boxes = Number(item.boxes || 0);
      const unitsPerBox = Number(item.unitsPerBox || 1);
      const quantity = Number(item.quantity || 0);
      const price = Number(item.customPrice ?? item.price ?? 0);
      const totalUnits = quantity + boxes * unitsPerBox;
      return sum + totalUnits * price;
    }, 0);

    // Generate next order number
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const nextOrderNumber = lastOrder?.orderNumber ? lastOrder.orderNumber + 1 : 1;

    // Create new order
    const newOrder = new Order({
      orderNumber: nextOrderNumber,
      items,
      agentName,
      magazinName,
      cui,
      address,
      responsiblePerson,
      signature,
      total,
      createdAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order saved successfully!",
      order: savedOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Error saving order", error: err.message });
  }
});

// =========================
// Get all orders (for admin)
// =========================
router.get("/", async (req, res) => {
  try {
    const { search, date } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: "i" } },
        { magazinName: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

module.exports = router;
