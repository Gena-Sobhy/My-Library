import express from "express";
import { Progress, Library } from "../models/books.model.js";

const progressRouter = express.Router();

// 1.a. GET: Fetch all Books & their progress
progressRouter.get("/", async (req, res) => {
  try {
    const books = await Progress.find({}).populate("book");

    // console.log(books)
    res.json(books);
  } catch (err) {
    console.error("PROGRESS BACKEND ERROR:", err);
    res.status(500).json({
      message: "Error fetching books from progress DB",
      details: err.message,
    });
  }
});

// 1.b GET: Fetch tracking record via Book ObjectId
progressRouter.get("/:bookId", async (req, res) => {
  try {
    const progress = await Progress.findOne({ book: req.params.bookId });
    if (!progress) {
      return res
        .status(404)
        .json({ message: "No progress tracking found for this book." });
    }
    res.json(progress);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error fetching progress: ${err.message}` });
  }
});

// 2. POST: Upsert Progress Status (Creates or Updates smoothly)
progressRouter.post("/", async (req, res) => {
  try {
    const { book, currentProgress, status, startDate } = req.body;

    if (!book || !status)
      return res
        .status(400)
        .json({ message: "Bad request! Missing book ID or status." });

    const updatedProgress = await Progress.findOneAndReplace(
      { book },
      {
        book,
        currentProgress: currentProgress || 0,
        status,
        startDate: startDate || new Date(),
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );

    res.status(201).json(updatedProgress);
  } catch (err) {
    console.error(`Error editing progress: ${err}`);
    res.status(500).json({ message: `Error editing progress: ${err.message}` });
  }
});

// 3. PUT: Update progress settings by Book ID
progressRouter.put("/:bookId", async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.status === "Completed" && !updates.endDate) {
      updates.endDate = new Date();
    }

    const updatedProgress = await Progress.findOneAndUpdate(
      { book: req.params.bookId },
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("book");

    if (!updatedProgress) {
      return res.status(404).json({ message: "Tracking record not found." });
    }

    res.status(200).json(updatedProgress);
  } catch (err) {
    res
      .status(400)
      .json({ message: `Failed to update progress records! ${err.message}` });
  }
});

progressRouter.delete("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Delete from Progress DB
    const progress = await Progress.findOneAndDelete({ book: bookId });

    if (!progress) {
      return res
        .status(404)
        .json({ message: "No tracking record found for this book." });
    }

    // Delete from Library DB
    const book = await Library.findByIdAndDelete(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found in library." });
    }

    res.json({ message: "Book deleted successfully.", progress, book });
  } catch (err) {
    res.status(500).json({ message: `Error deleting book: ${err.message}` });
  }
});

export default progressRouter;
