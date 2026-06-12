import React, { useState, useEffect } from "react";

const BookProgress = ({ progressData, book, onProgressUpdate }) => {
  //   const totalPages = book?.totalPages || 0;
  const progressUnit = book?.progressUnit;
  let totalPages = 0;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(0);
  const [submit, setSubmit] = useState(false);

  if (progressUnit === "Pages") {
    totalPages = book?.totalPages || 0;
  } else if (progressUnit === "Percentage") {
    totalPages = 100;
  } else if (progressUnit === "Episodes") {
    totalPages = book?.totalEpisodes || 0; //////////debug
  }

  // COMPLETED
  // if pages are max => status = "Completed"
  const isCompletedStatus = progressData?.status === "Completed";

  // if status "Completed" => totalpages = max
  const currentProgress =
    isCompletedStatus && totalPages > 0
      ? totalPages
      : progressData?.currentProgress || 0;

  // Reading Progress Percentage
  const progressPercentage =
    totalPages > 0 ? Math.round((currentProgress / totalPages) * 100) : 0;

  useEffect(() => {
    setValue(currentProgress);
    setEditing(false);
  }, [progressData, currentProgress]);

  // Days Reading
  const daysReading = () => {
    if (!progressData?.startDate) return 1;
    const start = new Date(progressData.startDate);
    const today = new Date();
    const timeDifference = today.getTime() - start.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference <= 0 ? 1 : daysDifference + 1;
  };

  // Handle save progress
  const handleSaveProgress = async (e) => {
    e.preventDefault();
    const numValue = Number(value);

    //   reject negative numbers
    if (isNaN(numValue) || numValue < 0) {
      alert("Progress cannot be a negative number.");
      return;
    }
    //   reject exceeding numbers
    if (totalPages > 0 && numValue > totalPages) {
      alert(
        `Progress cannot exceed total book capacity (${totalPages} ${progressUnit}).`,
      );
      return;
    }

    setSubmit(true);

    // if pages are max => status = "Completed"
    let targetStatus = progressData?.status || "Reading";
    if (totalPages > 0 && numValue === totalPages) {
      targetStatus = "Completed";
    }

    //   Note: we need to search by both ISBN and dbBookID
    try {
      let dbBookID = book?.id || book?._id;

      // STRATEGY: If no direct Database ID exists, check DB by ISBN before creating a duplicate
      if (!dbBookID && book?.isbn) {
        try {
          const checkBookRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/books/isbn/${book.isbn}`,
          );
          if (checkBookRes.ok) {
            const existingBook = await checkBookRes.json();
            if (existingBook && existingBook._id) {
              dbBookID = existingBook._id;
            }
          }
        } catch (findErr) {
          console.error(
            "Book not found by ISBN in DB, proceeding to create initialization row.",
            findErr,
          );
        }
      }

      if (!dbBookID) {
        const bookResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/books`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
          },
        );

        const savedBookData = await bookResponse.json();
        console.log(savedBookData);
        if (!bookResponse.ok) throw new Error(savedBookData.message);
        dbBookID = savedBookData._id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: dbBookID,
            status: targetStatus,
            currentProgress: numValue,
            startDate: progressData?.startDate || new Date(),
          }),
        },
      );

      const updatedData = await response.json();

      if (response.ok) {
        if (typeof onProgressUpdate === "function") {
          onProgressUpdate(updatedData);
        }
        setEditing(false);
      } else {
        alert(`Server Error: ${updatedData.message}`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
      {/* CARD 1: READING PROGRESS METRICS */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-slate-950/40 border border-slate-800/60 shadow-inner">
        <div className="flex flex-col gap-1 w-full mr-4">
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase font-sans">
            Reading Progress
          </span>

          <div className="flex items-baseline gap-1.5 mt-1 min-h-10">
            {editing ? (
              <form
                onSubmit={handleSaveProgress}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-20 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xl font-bold text-gray-100 focus:outline-none font-serif"
                  autoFocus
                  disabled={submit}
                  min="0"
                  max={totalPages || undefined}
                />
                <button
                  type="submit"
                  disabled={submit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 py-1.5 rounded font-sans uppercase font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {submit ? "..." : "Save"}
                </button>
                <button
                  type="button"
                  disabled={submit}
                  onClick={() => {
                    setValue(currentProgress);
                    setEditing(false);
                  }}
                  className="text-gray-500 hover:text-gray-400 text-xs px-1 py-1.5 font-sans uppercase disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div
                onClick={() => setEditing(true)}
                className="group flex items-baseline gap-1.5 cursor-pointer"
                title="Click to update progress"
              >
                <span className="text-3xl font-bold text-gray-100 font-serif border-b border-dashed border-gray-600 group-hover:border-indigo-400 transition-colors">
                  {currentProgress}
                </span>
                <span className="text-gray-500 text-sm font-sans">
                  / {totalPages || "—"} {progressUnit}
                </span>
                <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 font-sans">
                  ✏️ edit
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 font-sans font-bold text-sm min-w-12.5 text-center">
          {progressPercentage}%
        </div>
      </div>

      {/* CARD 2: DAYS SPENT / TIME TRACKING METRICS */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-slate-950/40 border border-slate-800/60 shadow-inner">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-sans">
            Reading Days
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-bold text-gray-100 font-serif">
              {daysReading()}
            </span>
            <span className="text-gray-500 text-sm font-sans">
              {daysReading() === 1 ? "Day" : "Days"} reading
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 text-xl select-none">
          ⏱️
        </div>
      </div>
    </div>
  );
};

export default BookProgress;
