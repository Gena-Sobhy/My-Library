import React from "react";

const Book = ({ className = "w-[145px] h-[195px]", coverImage }) => {
  return (
    <div
      className={`relative flex aspect-[3/4] shadow-[-20px_10px_20px_0px_rgba(0,0,0,0.3)] select-none group ${className}`}
    >
      {/* Book Spine  */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3.5%] z-20 rounded-l-sm flex-shrink-0 shadow-[inset_-4px_0_1px_0_rgba(0,0,0,0.1),_4px_0_4px_0_rgba(0,0,0,0.15)]"
        style={{
          backgroundColor: coverImage ? "transparent" : "#D1D5DB",
          backgroundImage: coverImage
            ? `linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%), url(${coverImage})`
            : "linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          filter: "brightness(0.7)",
        }}
      />

      {/* Book Cover Wrapper */}
      <div className="relative z-10 rounded-r-sm overflow-hidden flex-1 h-full ml-[3.5%] shadow-[inset_10px_0_4px_0_rgba(0,0,0,0.1)]">
        {/* Cover Shine Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-r from-[rgba(255,255,255,0.2)] via-[rgba(255,255,255,0.05)] to-transparent" />

        {coverImage ? (
          <img
            src={coverImage}
            alt="book cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>
    </div>
  );
};

export default Book;
