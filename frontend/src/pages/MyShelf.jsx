import { useState, useEffect } from "react";
import shelf from "../assets/shelf.webp";
import Book from "../components/Book";
import { useNavigate } from "react-router";

const MyShelf = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksPerShelf, setBooksPerShelf] = useState(5);
  const navigate = useNavigate();

  // Handle responsive shelf capacity based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Small screens match Tailwind's 'sm' breakpoint (640px)
      if (window.innerWidth < 640) {
        setBooksPerShelf(4);
      } else {
        setBooksPerShelf(5);
      }
    };

    // Run on initial load
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch all books from your database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          `https://my-library-green.vercel.app/api/progress`,
        );
        const data = await response.json();
        const activeBooks = data.filter((entry) =>
          ["Reading", "Dropped", "Completed"].includes(entry.status),
        );
        setBooks(activeBooks);
        // console.log(data);
        // console.log(activeBooks);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // split books into chunks dynamically based on responsive capacity
  const shelves = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  // always show at least one empty shelf
  if (shelves.length === 0) shelves.push([]);

  return (
    <div className="bg-[#090D11] min-h-screen w-full pt-34">
      {loading ? (
        <p className="text-gray-400 text-center pt-20 font-serif">
          Loading your shelf...
        </p>
      ) : (
        <div>
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="relative w-full">
              {/* Shelf image as the base */}
              <img
                src={shelf}
                alt=""
                className="w-full h-[100px] xs:h-[130px] sm:h-auto object-fill"
              />

              {/* Books absolutely positioned over the shelf */}
              <div className="absolute inset-0 flex items-end justify-center gap-4 xs:gap-5 sm:gap-7 md:gap-10 lg:gap-15 pb-[16px] xs:pb-[20px] sm:pb-[5%] px-4">
                {shelfBooks.map((entry) => (
                  <div
                    key={entry._id}
                    onClick={() =>
                      navigate("/book-info", { state: { book: entry.book } })
                    }
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    {/* display precentage progress on each book */}
                    <Book
                      className="w-14 h-19 sm:w-17 sm:h-22 md:w-22 md:h-30 lg:w-33 lg:h-43"
                      coverImage={entry.book?.coverImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShelf;
