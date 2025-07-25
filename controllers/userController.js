const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ✅ Create user manually with logs
exports.registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log("👉 Received from frontend:", { username, password, role });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    console.log("🧾 Ready to save user:", newUser);

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "User creation failed" });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Clean user data (no password returned)
    const userData = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
