import express from "express";
const hardcoverRouter = express.Router();

const HARDCOVER_GQL = "https://api.hardcover.app/v1/graphql";

const hardcoverFetch = async (query, variables = {}) => {
  const response = await fetch(HARDCOVER_GQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: process.env.HARDCOVER_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
};

// Genre/Explore Router
// FIX: the API doesn't have filter by genre
// IDEA: fetch random pages from the array with each hit and pull/filter the genre from the middle
hardcoverRouter.get("/genre/:genre", async (req, res) => {
  const { genre } = req.params;
  const genreSlug = genre.toLowerCase();

  // Search 4 pages _ randomize the results with each hit
  const totalPages = 4;
  const randomOffset = Math.floor(Math.random() * 20);

  const buildQuery = (page) => `
    query GetGenreBooks_${page} {
      search(
        query: "*",
        query_type: "Book",
        per_page: 50,
        page: ${randomOffset + page}
      ) {
        results
      }
    }
  `;

  try {
    // Fire all 4 page requests
    const responses = await Promise.all(
      Array.from({ length: totalPages }, (_, i) =>
        hardcoverFetch(buildQuery(i + 1)),
      ),
    );

    const hasErrors = responses.find((r) => r.errors);
    if (hasErrors)
      return res.status(500).json({
        message: "GraphQL error",
        errors: hasErrors.errors,
      });

    const allDocuments = responses.flatMap((response) => {
      const rawResults = response.data?.search?.results;
      const parsedResults =
        typeof rawResults === "string" ? JSON.parse(rawResults) : rawResults;
      return (parsedResults?.hits || [])
        .map((hit) => hit.document)
        .filter(Boolean);
    });

    // Fish from the pool _ only genres
    const filtered = allDocuments.filter((doc) => {
      const docGenres = (doc.genres || []).map((g) => g.toLowerCase());
      return docGenres.some((g) => g.includes(genreSlug));
    });

    res.json(filtered);
  } catch (err) {
    console.error("Backend Error: GET /genre/:genre —", err);
    res.status(500).json({ message: "Error fetching genre" });
  }
});

// Search Router
hardcoverRouter.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query is required!" });

  const graphqlQuery = `
    query SearchBooks($query: String!) {
      search(query: $query, query_type: "Book", per_page: 40, page: 1) {
        results
      }
    }
  `;

  try {
    const data = await hardcoverFetch(graphqlQuery, { query });

    if (data.errors)
      return res
        .status(500)
        .json({ message: "GraphQL error", errors: data.errors });

    const books =
      data.data?.search?.results?.hits?.map((item) => item.document) || [];
    res.json(books);
  } catch (err) {
    console.error("Search route error:", err);
    res.status(500).json({ message: "Error fetching data from Hardcover" });
  }
});

// Get book by ISBN
hardcoverRouter.get("/isbn/:isbn", async (req, res) => {
  const { isbn } = req.params;

  if (!isbn) return res.status(400).json({ message: "ISBN is required!" });

  // Notice we request 'results' directly, not 'results { hits }'
  const graphqlQuery = `
    query SearchByIsbn($isbn: String!) {
      search(query: $isbn, query_type: "Book", per_page: 1) {
        results
      }
    }
  `;

  try {
    const data = await hardcoverFetch(graphqlQuery, { isbn });

    if (data.errors) {
      return res
        .status(500)
        .json({ message: "GraphQL error", errors: data.errors });
    }

    // The API returns 'results' as a JSON string, so we must parse it
    const rawResults = data.data?.search?.results;
    const parsedResults =
      typeof rawResults === "string" ? JSON.parse(rawResults) : rawResults;

    // Access the document inside the hits array
    const book = parsedResults?.hits?.[0]?.document;

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    console.error("Error finding ISBN:", err);
    res.status(500).json({ message: "Error processing book data" });
  }
});

export default hardcoverRouter;
