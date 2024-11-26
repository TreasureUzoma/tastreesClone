"use client";

import React, { useState, useEffect } from "react";
import BlurScreen from "./BlurScreen";
import Header from "./Header";
import UploadIcon from "./UploadIcon";
import { useToast } from "@/hooks/use-toast";

const Main = () => {
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState("Dinner");
  const [fade, setFade] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const truncateFileName = (name: string) => {
    const words = name.split(" ");
    if (words.length > 7) {
      return words.slice(0, 7).join(" ") + "...";
    }
    return name;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;

    if (!files || files.length === 0) {
      toast({
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 1) {
      toast({
        description: "You can upload only one image at a time.",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        description: "File size exceeds 5MB. Please upload a smaller file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(truncateFileName(file.name));

  };

  const handleButtonClick = async () => {
    if (!fileName) {
      toast({
        description: "Please upload a file before generating a recipe.",
        variant: "destructive",
      });
      return;
      
    }
    setIsLoading(true);
  };

  const removeFile = () => {
    setFileName(null);
    const fileInput = document.getElementById("upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Clear file input
    }
  };

  return (
    <div className="text-center mt-[7.2rem] md:mt-[9.4rem] flex items-center justify-center flex-col gap-6">
      {isLoading && <BlurScreen />}
      <Header />
      <h1 className="font-[800] text-[1.8rem] leading-[2rem] md:text-5xl text-darkblue tracking-[-2.5px] w-[88%] max-w-[600px]">
        What&#39;s For{" "}
        <mark
          className={`bg-transparent text-purple transition-opacity duration-500 inline-block ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentWord} ?
        </mark>{" "}
        <br className="md:hidden" />
        Let Our AI Assist In The Prep
      </h1>
      <p className="text-gray w-[88%] md:w-[70%] text-[0.9rem] md:text-[0.97rem] max-w-[680px]">
        Upload a picture of the meal you want to prepare, or even the
        ingredients you have on hand, and we&#39;ll provide the perfect recipe
        and help you need.
      </p>
      <form
        onSubmit={(e) => e.preventDefault()} // Prevent form submission
        className="bg-white border border-purple mt-1 border-opacity-10 py-1 px-2 flex items-center justify-between w-[88%] md:w-[70%] max-w-[600px] rounded-full"
      >
        <label
          htmlFor="upload"
          className="select-none shadow-sm shadow-4 w-[70%] text-left py-3 px-5 rounded-full flex items-center justify-start text-gray text-[0.7rem] gap-2 cursor-pointer"
        >
          {fileName ? (
            <>
              <button
                type="button"
                className="text-gray font-medium text-lg"
                onClick={removeFile}
              >
                &times;
              </button>
              <span className="truncate">{fileName}</span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span>Upload Image(s) | 5MB max.</span>
            </>
          )}
        </label>
        <button
          type="button"
          onClick={handleButtonClick}
          className={`bg-purple text-[0.8rem] border-4 border-double text-white px-8 py-2 rounded-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Generate recipe"}
        </button>
      </form>
      <input
        type="file"
        accept=".png, .jpeg, .jpg, .gif, .webp, .bmp"
        id="upload"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Main;
