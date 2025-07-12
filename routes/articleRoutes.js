const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const Article = require("../models/Article");

// ✅ Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ dateEntree: -1 });
    res.json(articles);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Error fetching articles" });
  }
});

// ✅ Add article to stockage
router.post("/", async (req, res) => {
  try {
    const {
      codeArticle,
      emplacement,
      numCommande,
      quantiteEntree = 1,
    } = req.body;

    if (!codeArticle || !emplacement) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const qrCodeDataURL = await QRCode.toDataURL(codeArticle + emplacement);

    const article = new Article({
      codeArticle,
      emplacement,
      numCommande,
      quantiteEntree,
      quantiteSortie: 0,
      dateEntree: new Date(),
      qrCodeDataURL,
    });

    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("❌ Add Stockage Error:", err);
    res.status(500).json({ error: "Error adding article" });
  }
});

// ✅ Déstockage: remove 1 from stockage, add or update quantity in destockage
router.post("/destock", async (req, res) => {
  try {
    const { codeArticle, emplacementStock, emplacementDestock } = req.body;

    if (!codeArticle || !emplacementStock || !emplacementDestock) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Step 1: Remove 1 from stockage (delete one entry)
    const removed = await Article.findOneAndDelete({
      codeArticle,
      emplacement: emplacementStock,
    });

    if (!removed) {
      return res
        .status(404)
        .json({ error: "No article found in stockage to remove" });
    }

    // Step 2: Check if article already exists in destockage
    const existing = await Article.findOne({
      codeArticle,
      emplacement: emplacementDestock,
    });

    if (existing) {
      existing.quantiteEntree += 1;
      await existing.save();
      return res.status(200).json(existing);
    }

    // Step 3: If not exist, create new destockage article
    const qrCodeDataURL = await QRCode.toDataURL(
      codeArticle + emplacementDestock
    );

    const newArticle = new Article({
      codeArticle,
      emplacement: emplacementDestock,
      emplacementStock,
      quantiteEntree: 1,
      quantiteSortie: 0,
      dateEntree: new Date(),
      qrCodeDataURL,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("❌ FULL DESTOCK ERROR:", err);
    res.status(500).json({ error: "Error destocking article" });
  }
});

// ✅ Search by emplacement
router.get("/search/:emplacement", async (req, res) => {
  try {
    const { emplacement } = req.params;
    const result = await Article.find({ emplacement });
    res.json(result);
  } catch (err) {
    console.error("❌ Search Error:", err);
    res.status(500).json({ error: "Error fetching emplacement" });
  }
});

// ✅ Delete article
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Error deleting article" });
  }
});

// ✅ Quantity summary per codeArticle + emplacement
router.get("/summary", async (req, res) => {
  try {
    const summary = await Article.aggregate([
      {
        $group: {
          _id: { codeArticle: "$codeArticle", emplacement: "$emplacement" },
          totalQuantite: { $sum: "$quantiteEntree" },
        },
      },
      {
        $project: {
          _id: 0,
          codeArticle: "$_id.codeArticle",
          emplacement: "$_id.emplacement",
          totalQuantite: 1,
        },
      },
      {
        $sort: { codeArticle: 1, emplacement: 1 },
      },
    ]);

    res.json(summary);
  } catch (err) {
    console.error("❌ Error in /summary route:", err);
    res.status(500).json({ error: "Failed to get article summary" });
  }
});

module.exports = router;
