import { useState } from "react";
import { useNavigate } from "react-router";
import { fetchGenre, hardcoverToForm } from "../lib/hardcover";
import fantasy from "../assets/fantasy.webp";
import history from "../assets/history.webp";
import scifi from "../assets/scifi.webp";
import romance from "../assets/romance.webp";

const Genres = [
  { name: "Fantasy", slug: "fantasy", img: fantasy },
  { name: "History", slug: "history", img: history },
  { name: "Sci-Fi", slug: "sci-fi", img: scifi },
  { name: "Romance", slug: "romance", img: romance },
];

const Explore = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (genre) => {
    try {
      setLoading(true);

      // Fetch data from backend
      const hardcoverRaw = await fetchGenre(genre.slug);

      //  Schema
      const hardcoverResults = (hardcoverRaw || []).map(hardcoverToForm);

      // random shuffling
      const shuffled = [...hardcoverResults].sort(() => Math.random() - 0.5);

      //  Deduplicating by ISBN
      const duplicate = new Set();
      const exploreResults = shuffled.filter((book) => {
        if (!book.isbn || !book.title || duplicate.has(book.isbn)) return false;
        duplicate.add(book.isbn);
        return true;
      });

      // state
      navigate("/explore", {
        state: {
          books: exploreResults,
          genreName: genre.name,
        },
      });
    } catch (err) {
      console.error("Frontend Explore navigation failure:", err);
    } finally {
      setLoading(false);
    }
  };

   return (
     <div className=" grid grid-cols-2 place-items-center md:flex gap-3 lg:gap-5 mt-5">
       {Genres.map((g) => (
         <div
           key={g.name}
           onClick={() => !loading && handleSearch(g)}
           className={`cursor-pointer group select-none ${loading ? "opacity-50 pointer-events-none" : ""}`}
         >
           <div className="relative w-full h-31 sm:w-60 sm:h-60 md:w-50 md:h-60 xl:w-60 xl:h-68 border border-gray-300/20 rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-gray-400">
             <img
               src={g.img}
               alt={g.name}
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex flex-col justify-end p-4">
               <p className="font-semibold text-gray-200 tracking-wide transition-colors duration-300 group-hover:text-white items-center text-center text-sm lg:text-lg">
                 {g.name}
               </p>
             </div>
           </div>
         </div>
       ))}
     </div>
   );
};

export default Explore;
