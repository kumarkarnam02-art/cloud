const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// ------------------ MODELS ------------------
const User = require("./models/User");
const Profile = require("./models/Profile");
const auth = require("./middleware/auth");

// ------------------ TEST ------------------
app.get("/", (req, res) => {
  res.send("API working");
});

// ------------------ SIGNUP ------------------
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    // create empty profile
    await Profile.create({ userId: user._id });

    res.status(201).json({
      success: true,
      message: "Signup successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ LOGIN ------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------ GET PROFILE ------------------
app.get("/profile", auth, async (req, res) => {
  const profile = await Profile.findOne({ userId: req.userId });
  res.json(profile);
});

// ------------------ UPDATE PROFILE ------------------
app.put("/profile", auth, async (req, res) => {
  const { firstName, lastName, phone, dob } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.userId },
    { firstName, lastName, phone, dob },
    { new: true }
  );

  res.json({
    success: true,
    message: "Profile updated",
    profile,
  });
});

// ------------------ SERVER ------------------
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
