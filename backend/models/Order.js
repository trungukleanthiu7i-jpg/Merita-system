const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
    unique: true,
  },

  agentName: {
    type: String,
    required: true,
  },

  magazinName: {
    type: String,
    required: true,
  },

  items: [
    {
      name: String,
      price: Number,
      boxes: Number,
      unitsPerBox: Number,
      quantity: Number,
    },
  ],

  total: {
    type: Number,
    required: true,
  },

  cui: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  responsiblePerson: {
    type: String,
    required: true,
  },

  signature: {
    type: String, // base64 image
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema, "orders");

