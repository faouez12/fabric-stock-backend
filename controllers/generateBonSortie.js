const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const BonDeSortie = require("../models/bonDeSortie");

const generateBonSortie = async (req, res) => {
  try {
    const { bonId } = req.params;

    const bon = await BonDeSortie.findById(bonId);
    if (!bon) {
      return res.status(404).json({ message: "Bon de Sortie not found" });
    }

    // Create PDF
    const doc = new PDFDocument();
    const fileName = `Bon_De_Sortie_${bon.numBon}.pdf`;

    const folderPath = path.join(__dirname, "..", "bons_pdf");
    const filePath = path.join(folderPath, fileName);
    fs.mkdirSync(folderPath, { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 📄 PDF Content
    doc.fontSize(20).text("Bon de Sortie", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Année: ${bon.annee}`);
    doc.text(`Numéro Bon: ${bon.numBon}`);
    doc.text(`Client: ${bon.client}`);
    doc.text(`Date: ${new Date(bon.date).toLocaleDateString("fr-FR")}`);
    doc.text(`État: ${bon.etat}`);
    doc.moveDown();

    // 🧾 Table Header
    doc.fontSize(14).text("Articles:");
    doc.moveDown();
    doc.fontSize(12);
    doc.text("Code Article      |     Emplacement", { underline: true });
    doc.moveDown(0.5);

    // 📋 Articles Loop
    bon.articles.forEach((a) => {
      doc.text(`${a.codeArticle.padEnd(18)} |     ${a.emplacement}`);
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName); // Send the file as download
    });
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
    res.status(500).json({ message: "Error generating Bon de Sortie PDF." });
  }
};

module.exports = generateBonSortie;
