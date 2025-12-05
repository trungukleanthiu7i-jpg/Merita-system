require("dotenv").config();
const express = require("express");
const path = require("path");
const auth = require("basic-auth");
const cors = require("cors");
const connectDB = require("./db");

// Routes
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const adminOrdersRoutes = require("./routes/admin");
const adminStatsRoutes = require("./routes/adminStats");
const authRoutes = require("./routes/auth"); // login / register etc.

const app = express();

// --------------------
// Connect to MongoDB Atlas
// --------------------
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve images
app.use("/images", express.static(path.join(__dirname, "images")));

// --------------------
// Admin BASIC AUTH
// --------------------
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

// --------------------
// API routes
// --------------------
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminAuth, adminOrdersRoutes);
app.use("/api/adminStats", adminAuth, adminStatsRoutes);
app.use("/api/auth", authRoutes);

// --------------------
// Serve frontend (React build)
// --------------------
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

// --------------------
// SPA fallback for React Router
// --------------------
app.get(/^\/(?!api|images).*$/, (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// --------------------
// Health check
// --------------------
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is working ✅" });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Backend & frontend running on http://localhost:${PORT}`);
});
