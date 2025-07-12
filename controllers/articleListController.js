const ArticleList = require("../models/ArticleList");

// 🟢 GET all article types
exports.getAll = async (req, res) => {
  try {
    const list = await ArticleList.find().sort({ codeArticle: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch article list" });
  }
};

// 🟡 POST add a new article type
exports.add = async (req, res) => {
  const { codeArticle, libelle } = req.body;
  if (!codeArticle || !libelle) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const exists = await ArticleList.findOne({ codeArticle });
    if (exists) {
      return res.status(400).json({ message: "Code Article already exists" });
    }

    const newArticle = new ArticleList({ codeArticle, libelle });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ message: "Error saving article type" });
  }
};

// 🔴 DELETE an article type
exports.remove = async (req, res) => {
  try {
    await ArticleList.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
