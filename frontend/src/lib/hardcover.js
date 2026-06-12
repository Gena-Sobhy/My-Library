export const hardcoverToForm = (book) => {
  return {
    coverImage: book.image?.url || "",
    title: book.title || "",
    isbn: book.isbns?.[0]?.isbn13 || book.isbns?.[0] || "",
    totalPages: book.pages || "",
    language: "",
    author: Array.isArray(book.author_names)
      ? book.author_names.join(", ")
      : book.author_names || "",
    translator: "",
    illustrator: "",
    narrator: "",
    publisher: "",
    publicationDate: book.release_date || book.release_year || "",
    isSeries: !!book.featured_series,
    rating: book.rating,
    series: {
      name: book.featured_series?.series?.name || book.series_names?.[0] || "",
      volume: book.featured_series_position || "",
    },
    format: "Paperback",
    genres: book.genres || [], 
    progressUnit: "Pages",
    description: book.description || "",
    slug: book.slug || "",
  };
};

export const searchHardcover = async (query) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/hardcover/search?query=${query}`,
    );
    const data = await response.json();
    return data || [];
  } catch (err) {
    console.error(`Frontend: Error fetching data from Hardcover, ${err}`);
  }
};

export const fetchGenre = async (genre) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/hardcover/genre/${genre}`,
    );
    const data = await response.json();

    // Guard: API may return an error object instead of an array
    if (!Array.isArray(data)) {
      console.error("fetchGenre: unexpected response shape", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error(`Frontend: Error fetching genres from Hardcover`, err);
    return [];
  }
};
