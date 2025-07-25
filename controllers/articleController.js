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
  const { codeArticle, emplacementActuel, nouvelEmplacement } = req.body;

  if (!codeArticle || !emplacementActuel || !nouvelEmplacement) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1. Find the source article (stockage)
    const sourceArticle = await Article.findOne({
      codeArticle,
      emplacement: emplacementActuel,
    });

    if (!sourceArticle) {
      return res.status(404).json({ error: "Article not found in stockage" });
    }

    // 2. Decrease quantity or delete
    sourceArticle.quantiteRestante -= 1;
    if (sourceArticle.quantiteRestante <= 0) {
      await sourceArticle.deleteOne();
    } else {
      await sourceArticle.save();
    }

    // 3. Add or update destination article (déstockage)
    const destArticle = await Article.findOne({
      codeArticle,
      emplacement: nouvelEmplacement,
    });

    if (destArticle) {
      destArticle.quantiteEntree += 1;
      destArticle.quantiteRestante += 1;
      await destArticle.save();
    } else {
      const newDest = new Article({
        codeArticle,
        emplacement: nouvelEmplacement,
        quantiteEntree: 1,
        quantiteRestante: 1,
      });
      await newDest.save();
    }

    res.status(200).json({ message: "Déstockage effectué avec succès." });
  } catch (err) {
    console.error("Erreur déstockage:", err);
    res.status(500).json({ error: "Erreur serveur déstockage" });
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
