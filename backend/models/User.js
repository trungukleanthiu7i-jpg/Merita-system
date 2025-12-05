const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash cu bcrypt
  role: { type: String, enum: ["admin", "client"], default: "client" },
});

// "User" e modelul, "Users" e colecția exactă
module.exports = mongoose.model("User", UserSchema, "Users");