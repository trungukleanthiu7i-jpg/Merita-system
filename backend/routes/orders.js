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
      documentType,
      agentName,
      magazinName,
      cui,
      address,
      responsiblePerson,
      comments,
      signature,
    } = req.body;

    console.log("📥 Incoming order payload:");
    console.log({
      documentType,
      agentName,
      magazinName,
      cui,
      address,
      responsiblePerson,
      comments,
      itemsCount: Array.isArray(items) ? items.length : 0,
      hasSignature: !!signature,
    });

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !agentName ||
      !magazinName ||
      !cui ||
      !address ||
      !responsiblePerson ||
      !signature
    ) {
      return res.status(400).json({
        message:
          "All fields are required, including signature and at least one item.",
      });
    }

    const normalizedDocumentType =
      documentType === "aviz" ? "aviz" : "invoice";

    for (const item of items) {
      if (!item._id) {
        return res
          .status(400)
          .json({ message: "Each item must have a valid _id." });
      }

      const product = await Product.findById(item._id);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${item._id}` });
      }

      if (product.stoc === "out of stoc") {
        return res.status(400).json({
          message: `Cannot order — product out of stock: ${product.name}`,
        });
      }
    }

    const total = items.reduce((sum, item) => {
      const boxes = Number(item.boxes || 0);
      const unitsPerBox = Number(item.unitsPerBox || 1);
      const quantity = Number(item.quantity || 0);
      const price = Number(item.customPrice ?? item.price ?? 0);
      const totalUnits = quantity + boxes * unitsPerBox;
      return sum + totalUnits * price;
    }, 0);

    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    const newOrder = new Order({
      orderNumber: nextOrderNumber,
      documentType: normalizedDocumentType,
      items,
      agentName: agentName.trim(),
      magazinName: magazinName.trim(),
      cui: cui.trim(),
      address: address.trim(),
      responsiblePerson: responsiblePerson.trim(),
      comments: (comments || "").trim(),
      signature,
      total,
      createdAt: new Date(),
    });

    console.log("🛠 Order before save:", {
      orderNumber: newOrder.orderNumber,
      documentType: newOrder.documentType,
      agentName: newOrder.agentName,
      magazinName: newOrder.magazinName,
      comments: newOrder.comments,
    });

    const savedOrder = await newOrder.save();

    console.log("✅ Order saved:", {
      _id: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      documentType: savedOrder.documentType,
      comments: savedOrder.comments,
    });

    res.status(201).json({
      message: "Order saved successfully!",
      order: savedOrder,
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({
      message: "Error saving order",
      error: err.message,
    });
  }
});

// =========================
// Get all orders
// =========================
router.get("/", async (req, res) => {
  try {
    const { search, date } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: "i" } },
        { magazinName: { $regex: search, $options: "i" } },
        { documentType: { $regex: search, $options: "i" } },
        { comments: { $regex: search, $options: "i" } },
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

    console.log(`📦 Orders fetched from /api/orders: ${orders.length}`);

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({
      message: "Error fetching orders",
      error: err.message,
    });
  }
});

module.exports = router;