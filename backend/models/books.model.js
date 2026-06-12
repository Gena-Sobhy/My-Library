import mongoose from "mongoose";
const { Schema } = mongoose;

// ─── Library Schema ──── //
const librarySchema = new Schema(
  {
    // Basic Info
    coverImage: { type: String },
    title: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    totalPages: { type: Number, required: true },
    language: { type: String },

    // Creators
    author: { type: String, required: true },
    translator: { type: String },
    illustrator: { type: String },
    narrator: { type: String },

    // Publication
    publisher: { type: String },
    publicationDate: { type: Date },

    // Series — nested object, only meaningful when isSeries: true
    isSeries: { type: Boolean, default: false },
    series: {
      name: { type: String },
      volume: { type: Number },
    },

    // Format
    format: {
      type: String,
      enum: ["Paperback", "Hardcover", "Pocketbook", "E-book", "Audiobook"],
      required: true,
    },

    // How progress is tracked for this book
    progressUnit: {
      type: String,
      enum: ["Pages", "Percentage", "Episodes"],
      required: true,
    },

    // genres
    genres: { type: [{ type: String }], default: [] },

    // Description
    description: { type: String },

    // rating
    rating: { type: Number, min: 1, max: 5 },

    // Wishlist
    wishlist: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

// ─── Progress Schema ──── //
const progressSchema = new Schema(
  {
    // Link to the book being tracked
    book: {
      type: Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    // Progress value — pages read, % complete, or episodes watched
    currentProgress: { type: Number, default: 0 }, // unit determined by book.progressUnit

    startDate: { type: Date, required: true },
    endDate: { type: Date }, // optional until completed

    status: {
      type: String,
      enum: ["To Read", "Reading", "Completed", "Dropped"],
      required: true,
    },

    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  {
    timestamps: true,
    // Computed virtual: days spent reading
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: auto-compute daysSpent instead of storing it
progressSchema.virtual("daysSpent").get(function () {
  if (!this.startDate) return null;
  const end = this.endDate ?? new Date();
  return Math.ceil((end - this.startDate) / (1000 * 60 * 60 * 24));
});

// ─── Models ───── //
export const Library = mongoose.model("Library", librarySchema);
export const Progress = mongoose.model("Progress", progressSchema);
