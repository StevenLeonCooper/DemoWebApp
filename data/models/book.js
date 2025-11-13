// data/models/book.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

function isValidIsbn(val) {
  if (!val) return true;
  const s = String(val).replace(/[-\s]/g, "");
  return /^(?:\d{9}[\dXx]|\d{13})$/.test(s);
}

const bookSchema = new Schema({
  title: { type: String, required: true, trim: true },
  authorNames: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length > 0,
      message: "authorNames must be a non-empty array of strings",
    },
  },
  authorNamesLower: { type: [String], index: true },   // ← derived + indexed
  publishYear: { type: Number, min: 0 },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,  // allows multiple docs with null/undefined; avoid empty ""
    validate: {
      validator: isValidIsbn,
      message: (props) =>
        `${props.value} is not a valid ISBN (10 or 13 digits, hyphens allowed)`,
    },
  },
  genre: { type: String, trim: true, index: true },
  pages: { type: Number, min: 1 },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

bookSchema.pre("save", function (next) {
  this.authorNamesLower = (this.authorNames || []).map(s => s.toLocaleLowerCase("en"));
  next();
});

export default model("Book", bookSchema);
