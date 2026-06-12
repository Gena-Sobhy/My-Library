import React from "react";
import aboutImg from "../assets/about.webp";
import { Explore, Wishlist } from "../components";

const Hero = () => {
  return (
    <div className="pt-20 sm:pt-25 md:pt-30 lg:pt-35 bg-gray-900 p-7 md:p-12 lg:p-20 flex flex-col min-h-screen w-full">
      <div className="main-container relative ">
        <div className="absolute top-5 md:top-8 lg:top-12 left-1/2 -translate-x-1/2 w-14 lg:w-24 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Welcome user */}
        <div className="flex flex-col justify-center items-center w-full mb-5 md:mb-8 lg:mb-12 text-center mt-1">
          <h1 className="font-bold text-white text-lg md:text-xl lg:text-3xl xl:text-4xl mb-1 ">
            Welcome John Doe :)
          </h1>
          <p className="text-sm md:text-md lg:text-lg text-gray-400">
            Welcome back to your reading dashboard
          </p>
        </div>

        {/* About Section */}
        <div className="about-container flex flex-col text-center lg:text-left lg:flex-row items-center gap-8 md:gap-12 mb-12">
          {/* Text Content */}
          <div className="about-info w-full flex flex-col justify-center">
            <h3 className="text-indigo-400 font-bold tracking-wide text-sm sm:text-md md:text-lg lg:text-xl uppercase mb-2">
              About this project
            </h3>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-tight mb-3 md:mb-6">
              Shelf: a Digital Book Tracker
            </h2>

            <div className="space-y-1 sm:space-y-2  md:space-y-4 text-gray-300/80 leading-relaxed text-justify font-semibold text-[10px] md:text-[12px] w-full">
              <p>
                This project stems from a genuine love for building clean,
                efficient software. My goal was to create a fluid environment
                where data moves effortlessly. Built as a live demonstration for
                technical teams to explore my MERN workflow, it’s a direct
                reflection of my engineering mindset and passion for
                development.
              </p>
              <p>
                To make your review completely frictionless, I intentionally
                omitted the authentication layer. There are no sign-up forms or
                barriers here—just instant access to interact with the live
                data, test the features, and see the architecture and design in
                action right away.
              </p>
            </div>
          </div>

          {/* Image Container */}
          <div className="about-img w-full md:w-3/4 flex justify-center">
            <img
              src={aboutImg}
              alt="Shelf project mockup"
              className="w-full max-w-md md:max-w-full h-auto rounded-xl object-cover "
            />
          </div>
        </div>

        {/* Explore */}
        <div className="explore flex justify-center items-center flex-col">
          <h3 className="text-indigo-400 font-bold tracking-wide text-md md:text-lg lg:text-xl uppercase ">
            Explore Collections
          </h3>
          <Explore />
        </div>

        {/* Wishlist here */}
        <div className="">
          <Wishlist />
        </div>
      </div>
    </div>
  );
};

export default Hero;
