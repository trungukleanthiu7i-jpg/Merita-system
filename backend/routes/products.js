const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Add a new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, unitsPerBox, image, stoc, barcode } = req.body;

    if (!name || price === undefined || !category || unitsPerBox === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize stock value
    let stockStatus = "in stoc";
    if (stoc && typeof stoc === "string") {
      const s = stoc.trim().toLowerCase();
      if (s.includes("in")) stockStatus = "in stoc";
      else if (s.includes("out")) stockStatus = "out of stoc";
    }

    const product = new Product({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: Number(price),
      category: category.trim(),
      unitsPerBox: Number(unitsPerBox),
      image: image ? image.trim() : "",
      stoc: stockStatus,
      barcode: barcode ? barcode.trim() : null, // ✅ optional barcode
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - Update an existing product by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, description, price, category, unitsPerBox, image, stoc, barcode } = req.body;

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category.trim();
    if (unitsPerBox !== undefined) updateData.unitsPerBox = Number(unitsPerBox);
    if (image !== undefined) updateData.image = image.trim();
    if (barcode !== undefined) updateData.barcode = barcode ? barcode.trim() : null; // ✅ optional barcode

    // Normalize stock value for updates
    if (stoc !== undefined) {
      const s = stoc.trim().toLowerCase();
      if (s.includes("in")) updateData.stoc = "in stoc";
      else if (s.includes("out")) updateData.stoc = "out of stoc";
      else updateData.stoc = "in stoc"; // default fallback
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
