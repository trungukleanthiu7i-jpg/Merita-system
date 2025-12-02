const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product"); // 👈 IMPORT PRODUCT MODEL

// Create new order
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
      !items ||
      items.length === 0 ||
      !agentName ||
      !magazinName ||
      !cui ||
      !address ||
      !responsiblePerson ||
      !signature
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🔥 NEW: Check stock before order is accepted
    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item._id}` });
      }

      if (product.stoc === "out of stoc") {
        return res.status(400).json({
          message: `Cannot order — product out of stock: ${product.name}`,
        });
      }
    }

    // Calculate total price
    const total = items.reduce((sum, item) => {
      const boxes = item.boxes || 0;
      const unitsPerBox = item.unitsPerBox || 1;
      const price = item.customPrice || item.price || 0;
      return sum + boxes * unitsPerBox * price;
    }, 0);

    // Auto-generate order number
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const nextOrderNumber = lastOrder && !isNaN(lastOrder.orderNumber)
      ? lastOrder.orderNumber + 1
      : 1;

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

    await newOrder.save();

    res.status(201).json({
      message: "Order saved successfully!",
      orderNumber: nextOrderNumber,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Error saving order", error: err });
  }
});
module.exports = router;