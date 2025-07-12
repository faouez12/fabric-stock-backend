const Article = require("../models/Article");

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addArticle = async (req, res) => {
  const { codeArticle, emplacement } = req.body;

  if (!codeArticle || !emplacement) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const existing = await Article.findOne({ codeArticle, emplacement });

    if (existing) {
      existing.quantiteEntree += 1;
      existing.quantiteRestante += 1;
      await existing.save();
      return res.status(200).json(existing);
    }

    const newArticle = new Article({
      codeArticle,
      emplacement,
      quantiteEntree: 1,
      quantiteRestante: 1,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Error saving article:", err);
    res.status(500).json({ error: "Save failed" });
  }
};

exports.destockArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    article.quantiteRestante -= 1;

    if (article.quantiteRestante <= 0) {
      await Article.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Article fully destocked and removed." });
    }

    await article.save();
    res.json(article);
  } catch (err) {
    console.error("Destock error:", err);
    res.status(500).json({ error: "Destock failed" });
  }
};

exports.searchByEmplacement = async (req, res) => {
  const { emplacement, type } = req.query;

  if (!emplacement || !type) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const article = await Article.findOne({ emplacement });
    if (!article) return res.status(404).json({ error: "Not found" });

    res.json({ ...article._doc, type });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};
