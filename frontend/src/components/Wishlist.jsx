import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Book from "./Book";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Wishlist = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(
          `https://my-library-green.vercel.app/api/books`,
        );
        if (!response.ok) throw new Error("Error fetching data");
        const allBooks = await response.json();
        setBooks(allBooks.filter((book) => book.wishlist === true));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.7
          : scrollLeft + clientWidth * 0.7;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <div className="w-full text-center text-gray-400 mt-12 font-serif">
        Loading wishlist...
      </div>
    );
  if (books.length === 0)
    return (
      <div className="w-full text-center text-gray-500 mt-12">
        Your wishlist is empty!
      </div>
    );

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto mt-9 lg:mt-16 px-4 sm:px-8">
      <h2 className="text-2xl md:text-3xl text-slate-100 font-bold tracking-tight mb-2 md:mb-4 xl:mb-6 font-sans text-center">
        My Wishlist ({books.length})
      </h2>

      <div className="relative flex items-center group">
        {/* Left Arrow - hidden on touch devices */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 hidden md:flex p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-white z-30 shadow-lg transition-transform hover:scale-110 active:scale-95 "
        >
          <IoIosArrowBack size={24} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate("/book-info", { state: { book: item } })}
              className=" snap-start cursor-pointer transition-all duration-300 hover:-translate-y-2"
            >
              <Book
                className="w-20 h-27 xs:w-25 xs:h-35 sm:w-35 sm:h-45 lg:w-38 lg:h-50 rounded-lg"
                coverImage={item.coverImage}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow - hidden on touch devices */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 hidden md:flex p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-white z-30 shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <IoIosArrowForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default Wishlist;
