const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will be hashed
  role: { type: String, enum: ["admin", "worker"], default: "worker" },
});

const User = mongoose.model("User", userSchema);

module.exports = User; // ✅ CommonJS export for require()
