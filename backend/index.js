import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import booksRouter from "./routes/books.routes.js";
import progressRouter from "./routes/progress.routes.js";
import hardcoverRouter from "./routes/hardcover.routes.js";

dotenv.config();
const app = express();

app.use(express.json());

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = ["https://gena-sobhy.github.io", "http://localhost:5173"];
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message,
    });
  }
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running perfectly!" });
});

app.use("/api/books", booksRouter);
app.use("/api/progress", progressRouter);
app.use("/api/hardcover", hardcoverRouter);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

export default app;
