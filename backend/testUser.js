require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"); // path corect

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✔ Connected to MongoDB Atlas");

    const usernameToTest = "admin1";
    const user = await User.findOne({ username: usernameToTest });
    console.log("Login attempt:", { username: usernameToTest });
    console.log("User found in DB:", user);

    process.exit();
  })
  .catch(err => console.error(err));
