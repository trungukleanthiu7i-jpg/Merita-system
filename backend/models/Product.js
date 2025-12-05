const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    unitsPerBox: { type: Number, required: true },
    image: { type: String, default: "" },
    stoc: {
      type: String,
      enum: ["in stoc", "out of stoc"],
      default: "in stoc",
    },
  },
  { timestamps: true }
);

// Explicitly set collection name to match your MongoDB Atlas collection
module.exports = mongoose.model("Product", ProductSchema, "products");
