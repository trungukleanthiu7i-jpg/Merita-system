require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const auth = require("basic-auth");
const connectDB = require("./db");

// Routes
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const adminOrdersRoutes = require("./routes/admin");
const adminStatsRoutes = require("./routes/adminStats");
const authRoutes = require("./routes/auth");

const app = express();

// -------------------------
// Connect to MongoDB Atlas
// -------------------------
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

// -------------------------
// Middleware
// -------------------------
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://frontend-9ppa.onrender.com"   // ★ Frontend Render domain
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static images
app.use("/images", express.static(path.join(__dirname, "images")));

// -------------------------
// Admin BASIC AUTH
// -------------------------
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin111";

function adminAuth(req, res, next) {
  const user = auth(req);
  if (!user || user.name !== ADMIN_USER || user.pass !== ADMIN_PASS) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin API"');
    return res.status(401).send("Authentication required.");
  }
  next();
}

// -------------------------
// API Routes
// -------------------------
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminAuth, adminOrdersRoutes);
app.use("/api/adminStats", adminAuth, adminStatsRoutes);
app.use("/api/auth", authRoutes);

// -------------------------
// Health Check
// -------------------------
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is working ✅" });
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Backend running on port ${PORT}`);
});
