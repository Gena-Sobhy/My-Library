import React from "react";
import whiteStar from "../assets/white-star.webp";
import amberStar from "../assets/amber-star.webp";

const Rating = ({ wh = "w-6 h-6", className, rating }) => {
  const getStarFill = (starIndex) => {
    const fill = (rating ?? 0) - (starIndex - 1);
    return Math.min(1, Math.max(0, fill)) * 100;
  };

  return (
    <div className={`${className} flex items-center justify-center`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercent = getStarFill(starIndex);

        return (
          <div key={starIndex} className={`${wh} relative`}>
            {/*  Fill (Cut sharply from the right) */}
            <img
              src={amberStar}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                //cuts off the inverse percentage from the right side
                clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
              }}
            />

            {/* Background star */}
            <img
              src={whiteStar}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Rating;
