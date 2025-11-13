// routes/authors.js
import Author from "../data/models/author.js";
import { ResponseObject as RO } from "../data/response-object.js";

export class AuthorsHandler {
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

  // GET /api/authors  or  GET /api/authors/:id
  async GET() {
    const id = this.request.params.id || null;

    if (id) {
      try {
        const doc = await Author.findById(id).lean();
        return doc
          ? new RO(200, "Author retrieved", doc)
          : RO.notFound("Author not found");
      } catch (err) {
        if (err?.name === "CastError") return new RO(400, "Invalid id", null);
        throw err;
      }
    }

    const { q } = this.request.query;
    const filter = q
      ? { $or: [{ currentName: new RegExp(q, "i") }, { aliases: new RegExp(q, "i") }] }
      : {};
    const authors = await Author.find(filter).lean();
    return new RO(200, "Authors retrieved", authors);
  }

  // POST /api/authors
  async POST() {
    const { currentName, aliases = [] } = this.request.body || {};
    if (!currentName) {
      return RO.badRequest("currentName is required");
    }

    try {
      const newAuthor = await Author.create({ currentName, aliases });
      return RO.created(newAuthor, "Author created");
    } catch (err) {
      throw err; // Go() / Dispatch() will convert to 500 envelope
    }
  }

  // PUT /api/authors/:id
  async PUT() {
    const id = this.request.params.id;
    if (!id) return RO.badRequest("Author id required in path", null);

    try {
      const updated = await Author.findByIdAndUpdate(id, this.request.body, { new: true });
      return updated
        ? new RO(200, "Author updated", updated)
        : RO.notFound("Author not found");
    } catch (err) {
      if (err?.name === "CastError") return new RO(400, "Invalid id", null);
      throw err;
    }
  }

  // DELETE /api/authors/:id
  async DELETE() {
    const id = this.request.params.id;
    if (!id) return RO.badRequest("Author id required in path", null);

    try {
      const deleted = await Author.findByIdAndDelete(id);
      return deleted
        ? new RO.ok(null, "Author deleted")
        : RO.notFound("Author not found");
    } catch (err) {
      if (err?.name === "CastError") return new RO(400, "Invalid id", null);
      throw err;
    }
  }
}