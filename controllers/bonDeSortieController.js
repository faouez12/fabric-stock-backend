const BonDeSortie = require("../models/BonDeSortie");
const PDFDocument = require("pdfkit");

exports.createBon = async (req, res) => {
  const { client, articles } = req.body;

  if (!client || !articles || articles.length === 0) {
    return res.status(400).json({ message: "Missing data" });
  }

  const numBon = "BS_" + Date.now();
  const annee = new Date().getFullYear();

  const newBon = new BonDeSortie({
    annee,
    numBon,
    client,
    articles,
  });

  await newBon.save();
  res.status(201).json(newBon);
};

exports.getAllBons = async (req, res) => {
  const bons = await BonDeSortie.find().sort({ date: -1 });
  res.json(bons);
};

exports.generatePDF = async (req, res) => {
  const { id } = req.params;
  const bon = await BonDeSortie.findById(id);
  if (!bon) return res.status(404).json({ message: "Bon not found" });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${bon.numBon}.pdf`
  );
  doc.pipe(res);

  doc.fontSize(20).text("Bon de Sortie", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Numéro: ${bon.numBon}`);
  doc.text(`Client: ${bon.client}`);
  doc.text(`Date: ${new Date(bon.date).toLocaleDateString("fr-FR")}`);
  doc.text(`État: ${bon.etat}`);
  doc.moveDown();

  doc.text("Articles:");
  bon.articles.forEach((a, index) => {
    doc.text(`${index + 1}. ${a.codeArticle} - Emplacement: ${a.emplacement}`);
  });

  doc.end();
};
