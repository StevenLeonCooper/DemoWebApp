// data/models/author.js
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  currentName: { type: String, required: true },
  currentNameLower: { type: String, index: true },   // ← derived
  aliases: [String],
  aliasesLower: { type: [String], index: true },     // ← derived
  birthYear: Number,
  deathYear: Number,
  nationality: String,
  bio: String
}, { timestamps: true });

authorSchema.pre("save", function (next) {
  this.currentNameLower = this.currentName?.toLocaleLowerCase("en");
  this.aliasesLower = (this.aliases || []).map(s => s.toLocaleLowerCase("en"));
  next();
});

export default mongoose.model("Author", authorSchema);
