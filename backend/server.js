require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const auth = require("basic-auth");
const path = require("path");

// Routes
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const adminOrdersRoutes = require("./routes/admin");
const adminStatsRoutes = require("./routes/adminStats");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// --------------------
// API routes (no auth)
// --------------------
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminOrdersRoutes);
app.use("/api/admin", adminStatsRoutes);

// --------------------
// Serve images (no auth)
// --------------------
app.use("/images", express.static("images"));

// --------------------
// HTTP Basic Auth: protect ALL frontend requests
// --------------------
const USERS = {
  Christi: "christi123",
  Ernest: "neke123"
};

const frontendBuildPath = path.join(__dirname, "../frontend/build");

// Apply Basic Auth before serving any frontend files
app.use((req, res, next) => {
  // Skip API routes and images
  if (req.path.startsWith("/api") || req.path.startsWith("/images")) return next();

  const user = auth(req);
  if (!user || !USERS[user.name] || USERS[user.name] !== user.pass) {
    res.set("WWW-Authenticate", 'Basic realm="Orders Site"');
    return res.status(401).send("Authentication required.");
  }

  next();
});

// --------------------
// Serve React frontend static files
// --------------------
app.use(express.static(frontendBuildPath));

// Catch-all for React Router
app.use((req, res) => {
  // Skip API and images (extra safety)
  if (req.path.startsWith("/api") || req.path.startsWith("/images")) return res.status(404).send("Not Found");

  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// --------------------
// Test Route
// --------------------
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is working ✅" });
});

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Images available at http://localhost:${PORT}/images/<filename>`);
});
