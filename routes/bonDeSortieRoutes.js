const express = require("express");
const router = express.Router();
const BonDeSortie = require("../models/BonDeSortie");
const Article = require("../models/Article");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ✅ Create Bon de Sortie
router.post("/", async (req, res) => {
  try {
    const { client, articles } = req.body;

    const bon = new BonDeSortie({
      client,
      articles,
      date: new Date(),
      annee: new Date().getFullYear(),
      numBon: `BS_${Date.now()}`,
      etat: "Préparé",
    });

    await bon.save();

    // ✅ Decrement quantity from each selected article
    for (const art of articles) {
      const found = await Article.findOne({
        codeArticle: art.codeArticle,
        emplacement: art.emplacement,
      });

      if (found) {
        if (found.quantiteEntree > 1) {
          found.quantiteEntree -= 1;
          await found.save();
        } else {
          await Article.findByIdAndDelete(found._id);
        }
      }
    }

    res.status(201).json(bon);
  } catch (err) {
    console.error("Error creating Bon:", err);
    res.status(500).json({ error: "Failed to create bon" });
  }
});

// ✅ Get all Bons de Sortie
router.get("/", async (req, res) => {
  try {
    const bons = await BonDeSortie.find().sort({ date: -1 });
    res.json(bons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bons" });
  }
});

// ✅ Delete Bon de Sortie (without restoring quantity)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await BonDeSortie.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Bon not found" });
    }

    // ❌ Do NOT restore quantity back to Article

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting Bon:", err);
    res.status(500).json({ error: "Failed to delete bon" });
  }
});

// ✅ Download Bon de Sortie PDF
router.get("/:id/pdf", async (req, res) => {
  try {
    const bon = await BonDeSortie.findById(req.params.id);
    if (!bon) return res.status(404).json({ error: "Bon not found" });

    const doc = new PDFDocument();
    const filename = `Bon_De_Sortie_${bon.numBon}.pdf`;
    const folderPath = path.join(__dirname, "..", "bon_de_sortie");
    fs.mkdirSync(folderPath, { recursive: true });
    const filePath = path.join(folderPath, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).text("Bon de Sortie", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Client: ${bon.client}`);
    doc.text(`Date: ${new Date(bon.date).toLocaleDateString("fr-FR")}`);
    doc.text(`Num Bon: ${bon.numBon}`);
    doc.moveDown();

    bon.articles.forEach((art, index) => {
      doc.text(`${index + 1}. ${art.codeArticle} - ${art.emplacement}`);
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath);
    });
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

module.exports = router;
