const mongoose = require("mongoose");

const articleListSchema = new mongoose.Schema({
  codeArticle: { type: String, required: true, unique: true },
  libelle: { type: String, required: true },
});

module.exports =
  mongoose.models.ArticleList ||
  mongoose.model("ArticleList", articleListSchema);
