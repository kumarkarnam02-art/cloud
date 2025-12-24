const express = require("express");
const Scheme = require("../models/Scheme");
const auth = require("auth");

const router = express.Router();

// 🔹 Get all schemes
router.get("/schemes", auth, async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json({
      success: true,
      data: schemes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Add scheme (admin use)
router.post("/schemes", async (req, res) => {
  const { title, amountPerTerm, totalTerms } = req.body;

  const scheme = await Scheme.create({
    title,
    amountPerTerm,
    totalTerms,
  });

  res.status(201).json({
    success: true,
    scheme,
  });
});

module.exports = router;
