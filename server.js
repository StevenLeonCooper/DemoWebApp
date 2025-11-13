// server.js
import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { AuthorsHandler } from "./routes/authors.js";
import { BooksHandler } from "./routes/books.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ISDS411Demo";
await mongoose.connect(MONGODB_URI); // ESM allows top-level await
mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("error", (e) => console.error("MongoDB error:", e));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));


app.all(
  ["/api/books", "/api/books/:id"],
  (req, res) =>{
    const handler = new BooksHandler(req, res);
    handler.Go();
  });

  app.all(
  ["/api/authors", "/api/authors/:id"],
  (req, res) =>{
    const handler = new AuthorsHandler(req, res);
    handler.Go();
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
