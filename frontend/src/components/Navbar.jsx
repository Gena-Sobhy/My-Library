import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
// import Logo from "../assets/logo.svg";
import BookSearch from "./BookSearch";
import { IoLibrary } from "react-icons/io5";
import { use } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check path
  const searchPage = location.pathname === "/search-book";

  // handle resizing screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && searchPage) {
        if (window.history.length > 2) navigate(-1);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [navigate, searchPage]);

  return (
    <nav className="absolute top-0 left-0 w-full px-7 sm:px-10 md:px-15 lg:px-22 pt-5 sm:pt-7 md:pt-10 flex items-center justify-between gap-4 z-50 ">
      {/*  Logo Section  */}
      <div
        className="flex items-center gap-2.5 cursor-pointer select-none group"
        onClick={() => navigate("/")}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Shelf Logo"
          className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
        />
        <h3 className="text-white font-bold text-xl tracking-wide hidden sm:block">
          Shelf
        </h3>
      </div>
      {/* container */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 justify-end max-w-xl">
        <div className="hidden lg:flex w-100">
          <BookSearch />
        </div>

        {/* Conditionally rendering search icons for below lg screens */}
        {!searchPage && (
          <div
            onClick={() => navigate("/search-book")}
            className="block lg:hidden p-2 border border-gray-400 rounded-full"
          >
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
          </div>
        )}

        {/* Library Button */}
        <button
          onClick={() => navigate("/my-shelf")}
          className="p-2 text-indigo-500 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-all duration-200 flex-shrink-0"
          aria-label="Go to Bookshelf"
        >
          <IoLibrary size={26} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
