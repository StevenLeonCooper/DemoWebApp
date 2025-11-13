import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ISDS411HW8";
await mongoose.connect(MONGODB_URI);

// Raw collections so this is fast and doesn't need your models
const authors = mongoose.connection.collection("authors");
const books   = mongoose.connection.collection("books");

// Backfill authors: currentNameLower + aliasesLower
await authors.updateMany({}, [
  {
    $set: {
      currentNameLower: { $toLower: "$currentName" },
      aliasesLower: {
        $map: { input: { $ifNull: ["$aliases", []] }, as: "a", in: { $toLower: "$$a" } }
      }
    }
  }
]);

// Backfill books: authorNamesLower
await books.updateMany({}, [
  {
    $set: {
      authorNamesLower: {
        $map: { input: { $ifNull: ["$authorNames", []] }, as: "a", in: { $toLower: "$$a" } }
      }
    }
  }
]);

console.log("Backfill complete.");
await mongoose.disconnect();
process.exit(0);
