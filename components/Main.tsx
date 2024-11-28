"use client";

import React, { useState, useEffect } from "react";
import BlurScreen from "./BlurScreen";
import Header from "./Header";
import UploadIcon from "./UploadIcon";
import { useToast } from "@/hooks/use-toast";

const Main = () => {
  const { toast } = useToast();

  // States
  const [currentWord, setCurrentWord] = useState("Dinner");
  const [fade, setFade] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [blurMessages, setBlurMessages] = useState<string[]>([]);
  const [currentBlurMessage, setCurrentBlurMessage] = useState<string>("");

  // Constants
  const words = ["Dinner", "Lunch", "Breakfast", "Snacks", "Brunch"];
  const genZMessages = [
    "Hang tight, your recipe's coming!",
    "Big brain AI at work! 🍴",
    "Your food is about to get leveled up. 🔥",
    "Just a sec, cooking up something awesome! 👨‍🍳",
    "Almost there... let’s get this meal ready! 😎",
    "We’re prepping that meal for you. 👏",
    "Chillin' while your recipe gets made.",
  ];

  // Word cycling effect
  useEffect(() => {
    let wordIndex = 0;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        setCurrentWord(words[wordIndex]);
        setFade(true);
      }, 600);
    }, 1900);

    return () => clearInterval(interval);
  }, []);

  // Blur message cycling
  useEffect(() => {
    if (isLoading && blurMessages.length > 0) {
      let index = 0;
      setCurrentBlurMessage(blurMessages[index]);

      const interval = setInterval(() => {
        index = (index + 1) % blurMessages.length;
        setCurrentBlurMessage(blurMessages[index]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading, blurMessages]);

  // Timeout handler
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setBlurMessages(["Taking too long... please try the app directly!"]);
      }, 20000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // File validation and upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    Array.from(selectedFiles).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          description: `${file.name} exceeds 5MB. Skipping this file.`,
          variant: "destructive",
        });
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      toast({
        description: "No valid files to upload.",
        variant: "destructive",
      });
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Safely handle result
          resolve(reader.result.split(",")[1] || ""); // Extract Base64 data
        } else {
          reject(new Error("File reading error"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  
  const handleButtonClick = async () => {
    if (files.length === 0) {
      toast({
        description: "Please upload at least one file before generating a recipe.",
        variant: "destructive",
      });
      return;
    }
  
    setIsLoading(true);
    setBlurMessages(genZMessages);
  
    try {
      const base64Files = await Promise.all(
        files.map((file) => convertToBase64(file))
      );
  
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Files }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setBlurMessages([data.message]);
      } else {
        setBlurMessages([data.analysis]);
      }
  
      setTimeout(() => setIsLoading(false), 2000);
    } catch (error) {
      console.error(error);
      setBlurMessages(["Sorry, something went wrong. Please try again."]);
      setTimeout(() => setIsLoading(false), 4000);
    }
  };
  

  return (
    <div className="text-center mt-[7.2rem] md:mt-[9.4rem] flex items-center justify-center flex-col gap-6">
      {isLoading && (
        <BlurScreen
          header={currentBlurMessage}
          text="Sit tight, we're working on your recipe!"
        />
      )}
      <Header />
      <h1 className="font-[800] text-[1.8rem] leading-[2rem] md:text-5xl text-darkblue tracking-[-2.5px] w-[88%] max-w-[600px]">
        What&#39;s For{" "}
        <mark
          className={`bg-transparent text-purple transition-opacity duration-500 inline-block ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentWord}
        </mark>{" "}
        Let Our AI Assist In The Prep
      </h1>
      <p className="text-gray w-[88%] md:w-[70%] text-[0.9rem] md:text-[0.97rem] max-w-[680px]">
        Upload pictures of the meal you want to prepare or ingredients, and
        we&#39;ll provide the perfect recipe.
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white border border-purple mt-1 border-opacity-10 py-1 px-2 flex items-center justify-between w-[88%] md:w-[70%] max-w-[600px] rounded-full"
      >
        <label
          htmlFor="upload"
          className="select-none shadow-sm shadow-4 w-[70%] text-left py-3 px-5 rounded-full flex items-center justify-start text-gray text-[0.7rem] gap-2 cursor-pointer"
        >
          {files.length > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">&times;</span>
              {files.map((file, index) => (
                <span key={index} className="inline truncate">
                  {file.name}
                </span>
              ))}
            </span>
          ) : (
            <>
              <UploadIcon />
              <span>Upload Image(s) | 5MB max.</span>
            </>
          )}
        </label>
        <input
          type="file"
          accept=".png, .jpeg, .heic, .webp, .heif, .jpg"
          id="upload"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className={`bg-purple text-[0.8rem] border-4 border-double text-white px-8 py-2 rounded-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Generate Recipe"}
        </button>
      </form>
    </div>
  );
};

export default Main;
