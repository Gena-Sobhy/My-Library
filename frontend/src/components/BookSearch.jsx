import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { searchBooks, datatoForm } from "../lib/googlebooks.js";
import { searchHardcover, hardcoverToForm } from "../lib/hardcover.js";

const BookSearch = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectingBook, setSelectingBook] = useState(null);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      setIsOpen(true);
      setLoading(true);

      const data = await searchHardcover(query);
      if (data.length > 0) {
        setResults(data.map(hardcoverToForm));
      } else {
        const googleData = await searchBooks(query);
        setResults(googleData.map(datatoForm));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (apiBook) => {
    setSelectingBook(apiBook.isbn || apiBook.title);
    setIsOpen(false);

    let bookToNavigate = { ...apiBook };

    if (apiBook.isbn) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/books/isbn/${apiBook.isbn}`,
        );
        if (res.ok) {
          const dbBook = await res.json();
          const existing = Array.isArray(dbBook) ? dbBook[0] : dbBook;

          if (existing?._id) {
            bookToNavigate = { ...bookToNavigate, ...existing };
          }
        }
      } catch (e) {
        console.error("Search sync error:", e);
      }
    }

    setSelectingBook(null);
    navigate("/book-info", { state: { book: bookToNavigate } });
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const deactivate = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", deactivate);
    return () => document.removeEventListener("mousedown", deactivate);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="flex items-center bg-gray-900 rounded-lg border border-gray-500 focus-within:border-indigo-500 px-3 transition-colors duration-200">
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full flex-1 bg-transparent p-3 placeholder-gray-500 placeholder:font-bold text-white focus:outline-none"
          placeholder="Search by title, author, series..."
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="custom-scroll absolute top-full left-0 w-full bg-gray-900 border border-gray-600 rounded-lg mt-1 max-h-96 overflow-y-auto z-50 shadow-xl">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate("/add-book");
            }}
            className="flex items-center justify-between p-3.5 bg-gray-950/60 border-b border-gray-800 text-gray-400 text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 group sticky top-0 backdrop-blur-md z-10"
          >
            <span>Couldn't find your book?</span>{" "}
            <span className="text-indigo-400 font-semibold tracking-wide border-b border-indigo-500/0 group-hover:border-indigo-400 pb-0.5 transition-all">
              Add Manually →
            </span>{" "}
          </div>

          {results.map((book, index) => (
            <div
              key={index}
              onClick={() => handleBookSelect(book)}
              className="flex gap-4 p-3 cursor-pointer hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0 items-center"
            >
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-800"
                />
              ) : (
                <div className="w-10 h-14 bg-gray-800 border border-gray-700 rounded flex-shrink-0" />
              )}

              <div className="flex flex-col justify-center min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate leading-tight mb-0.5">
                  {book.title}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {book.author || "Unknown author"}
                </p>
                {book.publicationDate && (
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {book.publicationDate}
                  </p>
                )}
              </div>

              {selectingBook === (book.isbn || book.title) && (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch;
