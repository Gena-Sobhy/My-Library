import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Book, Rating } from "../components/index";
import BookProgress from "../components/BookProgress";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";

const BookInfo = () => {
  // Goal: fetch isbn from local DB first ? fetch data from local DB : fallback to fetching data from API using id
  const location = useLocation();
  const navigate = useNavigate();

  const incomingBook = location.state?.book;
  const isbn = incomingBook?.isbn;

  // Initialization
  const [dbId, setDbId] = useState(null);
  const [localBookDetails, setLocalBookDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("To Read");
  const [submit, setSubmit] = useState(false);
  const [progressData, setProgressData] = useState(null);

  const statusOptions = ["To Read", "Reading", "Completed", "Dropped"];
  const activeBook = localBookDetails || incomingBook;

  // Goal: check local DB for saved book info first ? fetch info & progress from local DB : fallback to api search
  // Note: Refresh with every search
  useEffect(() => {
    if (!incomingBook) return;

    const syncWithLocalDatabase = async () => {
      // Clear old data on navigation
      setLocalBookDetails(null);
      setProgressData(null);
      setCurrentStatus(incomingBook?.status || "To Read");

      let currentTargetId = incomingBook?._id || incomingBook?.id || null;
      setDbId(currentTargetId);

      try {
        // Search local DB by ISBN if we don't have a MongoDB _id
        if (!currentTargetId && isbn) {
          const cleanIsbn = String(isbn).trim();
          const checkBookRes = await fetch(
            `https://my-library-green.vercel.app/api/books/isbn/${cleanIsbn}`,
          );

          if (checkBookRes.ok) {
            const existingBook = await checkBookRes.json();
            if (existingBook && existingBook._id) {
              currentTargetId = existingBook._id;
              setDbId(existingBook._id);
              setLocalBookDetails(existingBook);
            }
          }
        }

        // Fetch progress using the confirmed ID
        if (currentTargetId) {
          const res = await fetch(
            `https://my-library-green.vercel.app/api/progress/${currentTargetId}`,
          );

          if (res.ok) {
            const data = await res.json();
            if (data) {
              setProgressData(data);
              if (data.status) setCurrentStatus(data.status);
            }
          }
        }
      } catch (err) {
        console.error("Local database sync workflow failed:", err);
      }
    };

    syncWithLocalDatabase();

    // Dependencies include location.key to ensure re-run on navigation
  }, [location.key, incomingBook, isbn]);

  if (!incomingBook) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 text-lg font-medium">
          No records found for this book!
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-indigo-400 hover:text-indigo-300 transition-colors underline mt-4 font-medium"
        >
          Back to main page
        </button>
      </div>
    );
  }

  const bookData = [
    { label: "Book Type", value: activeBook.format || "N/A" },
    { label: "Page Type", value: activeBook.progressUnit || "N/A" },
    { label: "Total Pages", value: activeBook.totalPages || "N/A" },
    { label: "ISBN", value: activeBook.isbn || "N/A" },
    {
      label: "Registered Date",
      value: progressData?.startDate
        ? new Date(progressData?.startDate).toLocaleDateString()
        : "N/A",
    },
  ];

  const handleProgress = async (status) => {
    setSubmit(true);
    setIsOpen(false);

    let nextProgress = progressData?.currentProgress || 0;

    if (status === "Reading" && currentStatus !== "Reading") {
      nextProgress = 0;
    } else if (status === "Completed") {
      nextProgress = activeBook.totalPages || nextProgress;
    }

    try {
      let currentDbId = dbId;

      if (!currentDbId) {
        const bookResponse = await fetch(
          `https://my-library-green.vercel.app/api/books`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incomingBook),
          },
        );

        const savedBookData = await bookResponse.json();
        if (!bookResponse.ok) throw new Error(savedBookData.message);

        currentDbId = savedBookData._id;
        setDbId(savedBookData._id);
        setLocalBookDetails(savedBookData);
      }

      const progressResponse = await fetch(
        `https://my-library-green.vercel.app/api/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: currentDbId,
            status: status,
            currentProgress: nextProgress,
            startDate: progressData?.startDate || new Date(),
          }),
        },
      );

      const savedProgressData = await progressResponse.json();

      if (progressResponse.ok) {
        setCurrentStatus(status);
        setProgressData(savedProgressData);
      }
    } catch (err) {
      console.error(`Frontend workflow error: ${err.message}`);
    } finally {
      setSubmit(false);
    }
  };

  // Add to wishlist
  const handleWishlist = async (e) => {
    e.preventDefault();

    const currentState = activeBook?.wishlist || false;
    const targetState = !currentState;

    const payload = { ...activeBook, wishlist: targetState };

    try {
      const response = await fetch(
        `https://my-library-green.vercel.app/api/books`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setLocalBookDetails({ ...data });
      }
    } catch (error) {
      console.error("Failed to POST to database:", error);
    }
  };

  // Delete book from DB
  const handleDelete = async () => {
    if (!dbId) {
      console.error("No book ID found, cannot delete.");
      return;
    }

    try {
      const response = await fetch(
        `https://my-library-green.vercel.app/api/progress/${dbId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        const err = await response.json();
        console.error("Failed to delete book:", err.message);
        return;
      }

      const data = await response.json();
      console.log("Deleted successfully:", data);

      navigate("/my-shelf");
    } catch (error) {
      console.error("Error deleting the book from DB", error);
    }
  };

  return (
    <div className="pt-20 sm:pt-25 md:pt-30 lg:pt-35 bg-gray-900 p-7 md:p-12 lg:p-20 flex flex-col min-h-screen w-full">
      <div className="main-container w-full max-w-6xl space-y-12">
        <div className="main-info flex flex-col md:flex-row gap-8 lg:gap-12 justify-center items-center text-center lg:text-left">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <Book
              className="w-45 h-55 sm:w-56 sm:h-76 md: lg:w-58 lg:h-74"
              coverImage={activeBook.coverImage}
            />
            <Rating
              className={"flex-row md:flex-col gap-3 "}
              wh={"w-8 h-8 md:w-11 md:h-11"}
              rating={activeBook?.rating}
              bookId={dbId}
            />
          </div>

          <div className="flex flex-col gap-4 w-full justify-between py-1">
            <div className="flex flex-col gap-2 items-center md:items-start w-full">
              <div className="flex w-full justify-center md:justify-start items-center md:items-start">
                {activeBook.isSeries && activeBook.series?.name && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/60 text-indigo-300 text-xs rounded-full font-serif tracking-wide mb-1 shadow-sm max-w-full truncate">
                    <span className="flex-shrink-0">📖</span>
                    <span className="truncate">
                      {activeBook.series?.name} &bull; Vol.{" "}
                      {activeBook.series?.volume}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between w-3/4 lg:w-full gap-3 md:gap-4 max-w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 font-sans leading-tight lg:leading-none break-words flex text-center md:text-left">
                  {activeBook.title}
                </h1>

                <div className="btn-container flex gap-1 md:gap-2">
                  <button
                    className="focus:outline-none p-2 sm:p-2.5 rounded-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 text-slate-400 hover:text-indigo-400 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center shadow-md flex-shrink-0"
                    onClick={() =>
                      navigate("/add-book", { state: { book: activeBook } })
                    }
                    title="Edit Book Details"
                  >
                    <FaEdit size={18} className="cursor-pointer" />
                  </button>
                  {dbId && (
                    <button
                      className="focus:outline-none p-2 sm:p-2.5 rounded-full bg-slate-800/40 hover:bg-red-400/10 border border-slate-700/30 text-slate-400 hover:text-red-400 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 flex items-center justify-center shadow-md flex-shrink-0"
                      onClick={() => handleDelete()}
                      title="Delete Book"
                    >
                      <RiDeleteBin6Fill size={18} className="cursor-pointer" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="text-gray-300 font-sans text-lg md:text-xl font-medium mt-1">
                <span className="text-indigo-400/80 italic font-normal mr-1.5">
                  by
                </span>
                {activeBook.author}
              </h4>

              <div className="flex items-center text-slate-400 gap-2 font-serif text-sm bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800/40 mt-1">
                {activeBook.totalPages && (
                  <span>{activeBook.totalPages} Pages</span>
                )}
                {activeBook.totalPages && activeBook.publicationDate && (
                  <span className="text-slate-600">|</span>
                )}
                {activeBook.publicationDate && (
                  <span>
                    {new Date(activeBook.publicationDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>

            {/* btn container */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-6 items-center justify-center md:justify-start w-full mx-auto lg:mx-0">
              {/* Status Dropdown Button Group */}
              <div className="relative inline-block text-left z-40 w-full sm:w-auto">
                <div
                  className={`flex items-center justify-between rounded-lg overflow-hidden transition-all duration-300 divide-x divide-white/10 w-full sm:w-44 md:w-48 lg:w-56 ${
                    currentStatus !== "To Read"
                      ? "bg-amber-500 hover:bg-amber-500/90 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)]"
                      : "bg-indigo-600 hover:bg-indigo-600/90 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.3)]"
                  }`}
                >
                  <button
                    type="button"
                    className="flex-1 text-white font-serif tracking-wider font-semibold py-3 px-4 text-center cursor-pointer truncate text-sm md:text-base"
                    title={currentStatus}
                  >
                    <span>{currentStatus}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-12 h-12 flex items-center justify-center text-white cursor-pointer hover:bg-black/10 transition-colors"
                    aria-label="Expand status menu"
                  >
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Menu Overlay */}
                {isOpen && (
                  <div className="absolute left-0 mt-2 w-full sm:w-56 rounded-lg shadow-xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="py-1">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleProgress(status)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            currentStatus === status
                              ? "bg-slate-800 font-bold text-indigo-400"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Action Button */}
              <button
                type="button"
                onClick={handleWishlist}
                className={`w-full sm:w-44 md:w-48 lg:w-56 text-sm md:text-base text-white font-serif tracking-wider font-semibold py-3 px-4 rounded-lg transition-all duration-300 active:scale-[0.99] cursor-pointer truncate ${
                  activeBook?.wishlist
                    ? "bg-amber-500 hover:bg-amber-500/90 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)]"
                    : "bg-indigo-600 hover:bg-indigo-600/90 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.3)]"
                }`}
              >
                {activeBook?.wishlist ? "In Wishlist" : "Add to wishlist"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 lg:pt-5 w-full">
          {bookData.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1.5 p-4 sm:p-5 rounded-lg bg-slate-950/45 border border-slate-800/50 items-center justify-center text-center shadow-inner h-24
        w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] 
        grow last:w-full md:last:w-[calc(20%-13px)]`}
            >
              <span className="text-[10px] sm:text-xs lg:text-sm font-semibold tracking-wider text-indigo-300 uppercase font-sans">
                {item.label}
              </span>
              <p className="text-sm sm:text-base text-gray-200 font-bold font-serif truncate w-full">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="book-info">
          {activeBook.description && (
            <div className="pt-6 border-t border-slate-800/60 max-w-4xl">
              <h3 className="text-indigo-400 font-serif text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
                Synopsis
              </h3>
              <p className="text-slate-400 leading-relaxed font-serif text-sm sm:text-base whitespace-pre-wrap text-justify lg:text-left">
                {activeBook.description}
              </p>
            </div>
          )}
        </div>

        {["Reading", "Completed", "Dropped"].includes(currentStatus) && (
          <div className="lg:pt-2">
            <BookProgress
              progressData={progressData}
              book={activeBook}
              onProgressUpdate={(updatedProgress) => {
                setProgressData(updatedProgress);
                if (updatedProgress.status) {
                  setCurrentStatus(updatedProgress.status);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookInfo;
