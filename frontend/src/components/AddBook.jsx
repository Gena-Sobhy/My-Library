import { useState } from "react";
import { useNavigate } from "react-router";

const AddBook = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMethod = (method) => {
    if (method == "input") navigate("/add-book", { state: { method } });
    else if (method == "search")
      navigate("/search-book", { state: { method } });
  };

  // fetch book data from google books api

  // post book data to backend (manually)
  // AddBookForm component ← just different initial data (props: { bookData }   ← empty object {} if manual, pre-filled if from API)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div
        className="bg-gray-800 p-8 flex justify-center cursor-pointer  transition-colors h-64 w-80 flex-col rounded-xl border-gray-500 border shadow-xl hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h1 className="text-white text-2xl font-bold mb-2">Add a Book</h1>
        <p className="text-white">Is there a book you are reading</p>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-3 transform transition-all">
            <div className="m-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
                Choose Method
              </h2>
              <p className="text-gray-500 text-sm">
                How would you like to add this book?
              </p>
            </div>

            <button
              onClick={() => handleMethod("search")}
              className="cursor-pointer w-full py-3 px-4 bg-gray-200 hover:bg-indigo-600 hover:text-white rounded-lg font-medium transition-all text-left capitalize"
            >
              by search
            </button>
            <button
              onClick={() => handleMethod("input")}
              className="cursor-pointer w-full py-3 px-4 bg-gray-200 hover:bg-indigo-600 hover:text-white rounded-lg font-medium transition-all text-left capitalize"
            >
              by input
            </button>

            <button
              className="text-red-700 font-bold cursor-pointer mt-2 text-xl"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBook;
