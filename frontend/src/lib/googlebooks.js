const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export const searchBooks = async (query) => {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${query}&key=${API_KEY}&maxResults=40`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error(`Error fetching data: ${err}`);
  }
};

export const datatoForm = (googleBook) => {
  const info = googleBook.volumeInfo;

  return {
    coverImage: info.imageLinks?.thumbnail || "",
    title: info.title || "",
    isbn:
      info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ||
      "",
    totalPages: info.pageCount || "",
    language: info.language || "",
    author: info.authors?.join(", ") || "",
    translator: "",
    illustrator: "",
    narrator: "",
    publisher: info.publisher || "",
    publicationDate: info.publishedDate || "",
    isSeries: false,
    series: { name: "", volume: "" },
    format: "Paperback",
    genres: info.categories || [],
    progressUnit: "Pages",
    description: info.description || "",
  };
};
