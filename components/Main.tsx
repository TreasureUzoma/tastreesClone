"use client";

import React, { useState, useEffect } from "react";
import Header from "./Header";
import UploadIcon from "./UploadIcon";

const Main = () => {
  const [currentWord, setCurrentWord] = useState("Dinner");
  const [fade, setFade] = useState(true);

  const words = ["Dinner", "Lunch", "Breakfast", "Snacks", "Brunch"];

  useEffect(() => {
    let wordIndex = 0;
    const interval = setInterval(() => {
      setFade(false); // Trigger fade out
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length; // Cycle through words
        setCurrentWord(words[wordIndex]);
        setFade(true); // Trigger fade in
      }, 600); // Match the CSS fade-out duration
    }, 1900); // Word change interval
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mt-[7rem] md:mt-[9rem] flex items-center justify-center flex-col gap-6">
      <Header />
      <h1 className="font-[800] text-[2.1rem] md:text-5xl text-darkblue tracking-[-2.5px] w-[88%] max-w-[600px]">
        What&#39;s For{" "}
        <mark
          className={`bg-transparent text-purple transition-opacity duration-500 inline-block ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentWord}{" "}?
        </mark>{" "}<br className="md:hidden"/>
        Let Our AI Assist In The Prep
      </h1>
      <p className="text-gray font-medium w-[88%] md:w-[70%] text-[0.9rem] md:text-[0.97rem] max-w-[680px]">
        Upload a picture of the meal you want to prepare, or even the
        ingredients you have on hand, and we&#39;ll provide the perfect recipe
        and help you need.
      </p>
      <div className="bg-white border border-purple mt-1 border-opacity-10 py-1 px-2 flex items-center justify-between w-[88%] md:w-[70%] max-w-[600px] rounded-full">
        <label
          htmlFor="upload"
          className="select-none shadow-sm text-left py-3 px-5 rounded-full flex items-center justify-start text-gray text-[0.7rem] gap-3"
        >
          <UploadIcon />
          <span>Upload Image | 5MB max.</span>
        </label>
        <button className="bg-purple text-[0.8rem] border-4 border-double text-white px-8 py-2 rounded-full">
          Generate recipe
        </button>
      </div>
      <input
        type="file"
        accept=".png, .jpeg, .jpg, .gif, .webp, .bmp"
        id="upload"
        className="hidden"
      />
    </div>
  );
};

export default Main;
