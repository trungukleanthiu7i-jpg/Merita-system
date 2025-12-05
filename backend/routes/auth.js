const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // schema User

// --------------------
// Login
// --------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", { username, password }); // 🔥 log ce trimite frontendul

  if (!username || !password) {
    console.log("Missing username or password");
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    console.log("User found in DB:", user); // 🔥 vezi dacă găsește ceva

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.json({
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// --------------------
// Get current logged-in user (dummy session for now)
// --------------------
router.get("/me", async (req, res) => {
  // Într-o versiune cu autentificare reală poți folosi JWT sau sesiuni
  res.json({ user: null }); // momentan nu păstrăm sesiunea
});

module.exports = router;
