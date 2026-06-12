import express from "express";
import { Library } from "../models/books.model.js";

const booksRouter = express.Router();

// Get all books
booksRouter.get("/", async (req, res) => {
  try {
    const books = await Library.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error });
  }
});

// get book by isbn
booksRouter.get("/isbn/:isbn", async (req, res) => {
  try {
    const searchIsbn = req.params.isbn;
    // .trim();
    const localBook = await Library.findOne({ isbn: searchIsbn });

    if (!localBook) {
      return res
        .status(404)
        .json({ message: "Book not found in local library" });
    }

    res.json(localBook);
  } catch (err) {
    console.error("Local database error:", err);
    res.status(500).json({ message: "Database query failed" });
  }
});

// Get book by ID
booksRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const findBook = await Library.findOne({ _id: id });

    if (!id) {
      return res.status(404).json({ message: "Book id not found" });
    }

    res.json(findBook);
  } catch (err) {
    console.error(`Book router Error: Error fetching book from DB with id`, err);
    res.status(500).json({
      message: "Book router Error: Error fetching book from DB with id",
    });
  }
});

// Add a new book
// Add or find a book in your library router
booksRouter.post("/", async (req, res) => {
  try {
    const { isbn, _id, __v, ...incomingData } = req.body;

    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }

    let book = await Library.findOneAndUpdate(
      {
        isbn: isbn,
      },
      { $set: incomingData },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    res.status(201).json(book);
  } catch (err) {
    console.error("MongoDB book save error:", err.message);
    res
      .status(500)
      .json({ message: "Error processing book data", error: err.message });
  }
});

export default booksRouter;
