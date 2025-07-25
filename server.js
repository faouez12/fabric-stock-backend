const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const articleRoutes = require("./routes/articleRoutes");
const articleListRoutes = require("./routes/articleListRoutes");
const bonRoutes = require("./routes/bonDeSortieRoutes");
const userRoutes = require("./routes/userRoutes"); // 🆕 for auth

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS fix for deployed frontend
const corsOptions = {
  origin: "https://fabric-stock-management.vercel.app",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connection successful 🚀" });
});

// Auth route
app.use("/api/users", userRoutes);

// MongoDB + server startup
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Register main routes
    app.use("/api/articles", articleRoutes);
    app.use("/api/articles-list", articleListRoutes);
    app.use("/api/bons-de-sortie", bonRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
