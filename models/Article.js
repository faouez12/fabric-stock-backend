const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    codeArticle: { type: String, required: true },
    numCommande: { type: String },
    emplacement: { type: String, required: true }, // target (stockage or destockage)
    emplacementStock: { type: String }, // source emplacement during destockage
    quantiteEntree: { type: Number, required: true },
    quantiteSortie: { type: Number, default: 0 },
    quantiteRestante: { type: Number },
    dateEntree: { type: Date, default: Date.now },
    qrCodeDataURL: { type: String }, // base64 QR code
  },
  { timestamps: true }
);

// Auto-calculate remaining quantity
articleSchema.pre("save", function (next) {
  if (this.quantiteEntree != null && this.quantiteSortie != null) {
    this.quantiteRestante = this.quantiteEntree - this.quantiteSortie;
  }
  next();
});

module.exports =
  mongoose.models.Article || mongoose.model("Article", articleSchema);
