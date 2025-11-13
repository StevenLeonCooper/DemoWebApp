// routes/books.js
import Author from "../data/models/author.js";
import Book from "../data/models/book.js";
import { ResponseObject as RO } from "../data/response-object.js";


function escapeRx(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}



export class BooksHandler {
    constructor(req, res) {
        this.request = req;
        this.response = res;
        this.query = req.query;
        this.method = req.method.toUpperCase();
        this.status = 200;
        this.allowed = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
        if (this.allowed.indexOf(this.method.toUpperCase()) === -1) {
            this.status = 405;
        }
    }

    async Go() {
        const response = await this.Dispatch();

        if (!this.response.headersSent) {
            this.response.status(response.status).json(response);
        }
    }

    async Dispatch() {
        if (this.status === 405) {
            return RO.notAllowed("Method not allowed");
        }
        try {
            const fn = this[this.method] || (method === "HEAD" ? this.GET : null);

            const result = await fn.call(this);

            return new RO(result);
        } catch (error) {
            this.status = 500;
            return RO.error(500, "Internal server error", null);
        }
    }

    async OPTIONS() {
        return new RO(204, "No Content", null);
    }

    async GET() {
        const { q, authorName } = this.query;

        let filter = {};

        // 1. Filter by title text
        if (q) {
            const regex = new RegExp(q, "i");
            filter.title = regex;
        }

        // 2. Filter by author name (search across current + aliases)
        if (authorName && authorName.trim()) {
            const regex = new RegExp(authorName, "i");
            // Find author by current name or aliases
            const author = await Author.findOne({
                $or: [{ currentName: regex }, { aliases: regex }],
            }).lean();

            if (!author) {
                return new RO(200, "Books retrieved", []);
            }

            // Build all variants (lowercase) you expect to see in books
            const namesLower = new Set([
                author.currentNameLower,
                ...((author.aliasesLower || []))
            ].filter(Boolean));

            // Also build anchored regexes for robustness (handles whitespace/punctuation variations)
            const exactRegexes = [
                author.currentName,
                ...(author.aliases || [])
            ]
                .filter(Boolean)
                .map(n => new RegExp(`^${escapeRx(n)}$`, "i"));

            const books = await Book.find({
                $or: [
                    // fast path: derived lowercased field (exact match)
                    { authorNamesLower: { $in: [...namesLower] } },
                    // fallback: case-insensitive exact regex on original field
                    { authorNames: { $in: exactRegexes } }
                ]
            }).lean();

            return new RO(200, "Books retrieved", books);
        }

        const books = await Book.find(filter).lean();

        return new RO(200, "Books retrieved", books);
    }

    /**
     * POST /api/books
     * body: { title, publishYear, authorNames: ["Name1", "Name2"] }
     */
    async POST() {
        const { title, publishYear, authorNames = [] } = this.request.body;
        if (!title || !authorNames.length) {
            return RO.badRequest("title and at least one author required");
        }

        const newBook = await Book.create({ title, publishYear, authorNames });

        return RO.created("Book created", newBook);
    }

    /**
     * PUT /api/books/:id
     */
    async PUT() {
        const id = this.request.routeRemainder || this.request.params.id;
        const updated = await Book.findByIdAndUpdate(id, this.request.body, { new: true });
        if (!updated) return RO.notFound("Book not found");
        return new RO(200, "Book updated", updated);
    }

    /**
     * DELETE /api/books/:id
     */
    async DELETE() {
        const id = this.request.routeRemainder || this.request.params.id;
        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) return RO.notFound("Book not found");
        return new RO(200, "Book deleted", null);
    }
}