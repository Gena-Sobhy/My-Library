import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FaCamera } from "react-icons/fa";
import FormSection from "../components/FormSection";
import Book from "../components/Book";

const AddBookForm = () => {
  const location = useLocation();
  const bookData = location.state?.book;
  const navigate = useNavigate();

  const [imageURL, setImageURL] = useState("");
  const [showImageOptions, setShowImageOptions] = useState(false);

  const [formData, setFormData] = useState(
    bookData || {
      coverImage: "",
      title: "",
      isbn: "",
      totalPages: "",
      language: "",
      author: "",
      translator: "",
      illustrator: "",
      narrator: "",
      publisher: "",
      publicationDate: "",
      isSeries: false,
      series: { name: "", volume: "" },
      format: "Paperback",
      progressUnit: "Pages",
      genres: [],
      description: "",
    },
  );

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: val },
      });
    } else {
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!bookResponse.ok) {
        throw new Error(`Failed to save book static info. Status: ${bookResponse.status}`);
      }

      const savedBook = await bookResponse.json();
      // console.log("Book saved:", data);

      if (!savedBook || !savedBook._id) {
        console.error("Backend did not return a valid document _id:", savedBook);
        throw new Error("Cannot associate progress: saved book is missing an ID reference.");
      }

      const progressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: savedBook._id,
            currentProgress: 0,
            status: "Reading",
            startDate: new Date(),
          }),
        },
      );

      if (!progressResponse.ok) {
        const errorText = await progressResponse.text();
        console.error("Progress collection rejected payload. Server response:", errorText);
        throw new Error("Book registered, but progress initialization failed.");
      }

      navigate("/my-shelf");
    } catch (error) {
      console.error("Failed to POST to database:", error);
    }
  };

  //  Info
  const basicInfo = [
    { name: "title", label: "Title", type: "text" },
    { name: "isbn", label: "ISBN", type: "text" },
    { name: "totalPages", label: "Total Pages", type: "number" },
    { name: "language", label: "Language", type: "text" },
  ];

  const creatorsInfo = [
    { name: "author", label: "Author(s)", type: "text" },
    { name: "translator", label: "Translator(s)", type: "text" },
    { name: "illustrator", label: "Illustrator(s)", type: "text" },
    { name: "narrator", label: "Narrator(s)", type: "text" },
  ];

  const publicationInfo = [
    { name: "publisher", label: "Publisher", type: "text" },
    { name: "publicationDate", label: "Publication Date", type: "date" },
  ];

  const typeInfo = [
    {
      name: "format",
      label: "What type of book do you read?",
      type: "select",
      options: ["Paperback", "Hardcover", "Pocketbook", "E-book", "Audiobook"],
    },
    {
      name: "progressUnit",
      label: "How would you like to track your progress?",
      type: "select",
      options: ["Pages", "Percentage", "Episodes"],
    },
  ];

  // Change || Upload Image handler
  const handlLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result }));
        setShowImageOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleURLImageSubmit = (e) => {
    e.preventDefault();
    let cleanUrl = imageURL.trim();

    if (!cleanUrl) return;

    // Fix typical Pinterest page links to point to the raw image domain if possible
    if (cleanUrl.includes("pinterest.com/pin/")) {
      alert(
        "Please right-click the image directly and select 'Copy Image Address'. Main page links cannot be rendered.",
      );
      return;
    }

    // Verify if the link can actually be loaded into an HTML Image element safely
    const img = new Image();
    img.src = cleanUrl;

    img.onload = () => {
      setFormData((prev) => ({ ...prev, coverImage: cleanUrl }));
      setImageURL("");
      setShowImageOptions(false);
    };

    img.onerror = () => {
      alert(
        "Invalid Image URL. The host has restricted direct hotlinking, or this is a webpage link rather than an image file.",
      );
    };
  };

  return (
    <div className="pt-20 sm:pt-25 md:pt-30 lg:pt-35 bg-gray-900 p-7 md:p-12 lg:p-20 flex flex-col min-h-screen w-full">
      <div className="main-container relative">
        <header className="text-center mb-8 md:mb-12 ">
          <div className="absolute top-5 md:top-8 lg:top-12 left-1/2 -translate-x-1/2 w-14 lg:w-24 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-indigo-200 to-gray-300 font-serif pt-4 break-words">
            {bookData?.title || formData.title || "Add New Book"}
          </h1>
          <p className="text-xs italic text-indigo-400/70 mt-2 font-sans tracking-widest uppercase">
            — Add to your personal archive —
          </p>
        </header>

        {/* Book Preview  */}
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12 group">
          <div className="relative p-4 bg-gray-800 rounded-xl border border-gray-500/50 transition-all duration-500 hover:border-indigo-500/50 w-fit hover:shadow-[0_0px_7px_5px_rgba(99,102,241,0.25)]">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl group-hover:bg-indigo-500/10 transition-all " />
            <div className="relative z-10 overflow-hidden rounded-lg">
              <div className="relative">
                <Book
                  className="w-40 h-52 sm:w-55 sm:h-70"
                  coverImage={formData.coverImage}
                />
                <button
                  type="button"
                  onClick={() => setShowImageOptions(!showImageOptions)}
                  className="absolute bottom-3 right-3 bg-gray-950/80 p-2.5 rounded-full shadow-md border border-gray-700/50 z-10 text-indigo-400 cursor-pointer"
                >
                  <FaCamera size={18} />
                </button>
              </div>

              {showImageOptions && (
                <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm p-4 flex flex-col justify-center items-center gap-3 z-20 font-sans animate-fadeIn">
                  <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    Update Cover Image
                  </p>

                  <label className="w-full text-center bg-gray-800 hover:bg-gray-700 text-indigo-400 text-xs font-medium py-2 px-3 rounded-lg border border-slate-700 cursor-pointer transition-colors">
                    📁 Upload Local File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlLocalImageUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="w-full flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 focus-within:border-indigo-500/60">
                    <input
                      type="url"
                      value={imageURL}
                      onChange={(e) => setImageURL(e.target.value)}
                      placeholder="Paste Google Image URL..."
                      className="bg-transparent flex-1 p-1 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={handleURLImageSubmit}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] py-1 px-2 rounded transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {formData.coverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, coverImage: "" }));
                        setShowImageOptions(false);
                      }}
                      className="w-full text-center bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-medium py-2 px-3 rounded-lg border border-red-900/40 transition-colors"
                    >
                      ✕ Remove Current
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowImageOptions(false)}
                    className="text-gray-500 hover:text-gray-400 text-xs mt-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 md:space-y-8 font-sans"
        >
          {/* */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 sm:p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors font-sans">
              <FormSection
                title="✨ Book Info"
                fields={basicInfo}
                formData={formData}
                handleChange={handleChange}
              />
            </div>

            <div className="p-4 sm:p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors">
              <FormSection
                title="✍️ Creators Info"
                fields={creatorsInfo}
                formData={formData}
                handleChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 sm:p-6 bg-gray-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors">
              <FormSection
                title="📜 Publication Info"
                fields={publicationInfo}
                formData={formData}
                handleChange={handleChange}
              />
            </div>

            <div className="p-4 sm:p-6 bg-gray-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors">
              <FormSection
                title="🔮 Format & Blueprint "
                fields={typeInfo}
                formData={formData}
                handleChange={handleChange}
                Styling="grid grid-cols-1 gap-4 mb-4"
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-4 sm:p-6 bg-gray-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors">
            <h2 className=" text-gray-400 text-xl sm:text-2xl font-medium mb-3 flex items-center gap-2">
              📖 Synopsis & Thoughts
            </h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Capture the heart of the story here..."
              rows={4}
              className="custom-scroll bg-gray-900/60 p-4 rounded-xl w-full text-gray-200 placeholder-gray-500 border border-slate-800/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y max-h-96 overflow-y-auto"
            />
          </div>

          {/* Series */}
          <div className="p-4 sm:p-6 bg-gray-900/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-colors focus:outline-none focus:border-indigo-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className=" text-gray-400 text-xl sm:text-2xl font-medium flex items-center gap-2">
                ⏳ Is this part of a series?
              </h2>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="isSeries"
                  id="isSeries"
                  checked={formData.isSeries}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 peer-checked:after:bg-indigo-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-950/50 border border-slate-700/60"></div>
              </label>
            </div>

            {formData.isSeries && (
              <div className="flex flex-col sm:flex-row gap-4 mt-6 p-2 sm:p-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Series Name
                  </label>
                  <input
                    name="series.name"
                    type="text"
                    value={formData.series.name}
                    onChange={handleChange}
                    placeholder="e.g., The Earthsea Cycle"
                    className="bg-slate-950 p-2.5 rounded-lg text-sm text-gray-200 placeholder-gray-600 border border-slate-800 focus:outline-none focus:border-indigo-500/60 transition-colors w-full"
                  />
                </div>
                <div className="sm:w-1/3 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Volume No.
                  </label>
                  <input
                    name="series.volume"
                    type="number"
                    value={formData.series.volume}
                    onChange={handleChange}
                    placeholder="I"
                    className="bg-slate-950 p-2.5 rounded-lg text-sm text-gray-200 placeholder-gray-600 border border-slate-800 focus:outline-none focus:border-indigo-500/60 transition-colors w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="relative group mt-4 w-full bg-indigo-500 hover:bg-indigo-500/85 text-white font-serif tracking-wider font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_-2px_rgba(99,102,241,0.6)] active:scale-[0.99] cursor-pointer focus:outline-none focus:bg-yellow-500 focus:text-gray-900 focus:shadow-[0_0_25px_8px_rgba(234,179,8,0.6)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-base">
              ✦ Inscribe Into Archive ✦
            </span>
            {/* Rounded-xl matches the parent container so the gradient doesn't bleed out */}
            <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookForm;