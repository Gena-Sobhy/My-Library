import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import shelf from "../assets/shelf.webp";
import Book from "../components/Book";

const ExploreCollections = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const books = location.state?.books || [];
  const genreName = location.state?.genreName || "Collection";

  const [booksPerShelf, setBooksPerShelf] = useState(5);

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

  const shelves = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  return (
    <div className="pt-20 md:pt-25 lg:pt-30 bg-[#090D11]  flex flex-col min-h-screen w-full">
      <h1 className="mb-6 md:mb-12 lg:mb-10 flex justify-center items-center font-sans text-indigo-400 font-bold tracking-wide text-md md:text-xl lg:text-3xl uppercase">
        {genreName} Books
      </h1>

      {books.length === 0 ? (
        <p className="text-gray-400 text-center font-serif">No books found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="relative w-full">
              {/* Shelf image as the base */}
              <img
                src={shelf}
                alt=""
                className="w-full h-[100px] xs:h-[130px] sm:h-auto object-fill"
              />

              <div className="absolute inset-0 flex items-end justify-center gap-4 xs:gap-5 sm:gap-7 md:gap-10 lg:gap-15 pb-[16px] xs:pb-[20px] sm:pb-[5%] px-4">
                {shelfBooks.map((book) => (
                  <div
                    key={book._id}
                    onClick={() => navigate("/book-info", { state: { book } })}
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    <Book
                      className="w-14 h-19 sm:w-17 sm:h-22 md:w-22 md:h-30 lg:w-37 lg:h-47"
                      coverImage={book.coverImage}
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

export default ExploreCollections;
