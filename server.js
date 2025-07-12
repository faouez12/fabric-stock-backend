const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const articleRoutes = require("./routes/articleRoutes");
const articleListRoutes = require("./routes/articleListRoutes");
const bonRoutes = require("./routes/bonDeSortieRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connection successful 🚀" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Register API routes
    app.use("/api/articles", articleRoutes);
    app.use("/api/articles-list", articleListRoutes);
    app.use("/api/bons-de-sortie", bonRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
