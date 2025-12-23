const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  phone: String,
  dob: Date,
});

module.exports = mongoose.model("Profile", profileSchema);
