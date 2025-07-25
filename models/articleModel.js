const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  codeArticle: { type: String, required: true },
  emplacement: { type: String, required: true }, // this was missing
  quantiteEntree: { type: Number, default: 1 },
  quantiteRestante: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Article || mongoose.model("Article", articleSchema);
