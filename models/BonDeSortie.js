const mongoose = require("mongoose");

const bonDeSortieSchema = new mongoose.Schema({
  annee: Number,
  numBon: String,
  client: String,
  date: { type: Date, default: Date.now },
  etat: { type: String, default: "Préparé" },
  articles: [
    {
      codeArticle: String,
      emplacement: String,
    },
  ],
});

module.exports =
  mongoose.models.BonDeSortie ||
  mongoose.model("BonDeSortie", bonDeSortieSchema);
