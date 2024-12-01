import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ApiResponse {
  analysis: string | string[]; 
  embedLinks: string | string[];
}

const useUtils = () => {
  const { toast } = useToast();

  // States
  const [currentWord, setCurrentWord] = useState<string>("Dinner");
  const [fade, setFade] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reply, setReply] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [responseContent, setResponseContent] = useState<string>(""); // AI's response
  const [youtubeLink, setYoutubeLink] = useState<string>(""); // Extracted YouTube link
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
    "Keep chillin' while your recipe gets made.",
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
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        description:
          "Please upload at least one file before generating a recipe.",
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

      const data: ApiResponse = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        toast({
          title: "OOPS",
          description: "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      if (Array.isArray(data.analysis)) {
        console.log(data);
        if (
          data.analysis.includes("NOT FOOD") ||
          data.analysis.includes("NOT FOOD\\n") ||
          data.analysis.includes(`NOT FOOD\n`)
        ) {
          toast({
            description:
              "No food-related item was found in your picture. Please try again with a different image.",
            variant: "destructive",
          });
          setIsLoading(false);
          setReply(false);
          setFiles([]);
          return;
        }
        setResponseContent(data.analysis.join(" ")); // Join array into a string
      } else if (typeof data.analysis === "string") {
        if (
          /NOT FOOD/i.test(data.analysis) ||
          data.analysis.includes("NOT FOOD")
        ) {
          toast({
            description:
              "No food-related item was found in your picture. Please try again with a different image.",
            variant: "destructive",
          });
          setIsLoading(false);
          setReply(false);
          setFiles([]);
        } else {
          setResponseContent(data.analysis); 
        }
      } else {
        console.error("Unexpected data type for analysis:", data.analysis);
        setBlurMessages(["Sorry, something went wrong. Please try again."]);
      }

      if (Array.isArray(data.embedLinks)) {
        setYoutubeLink(data.embedLinks.join(" "));
      } else {
        setYoutubeLink(data.embedLinks);
      }
      setReply(true);
    } catch (error) {
      console.error(error);
      setBlurMessages(["Sorry, something went wrong. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    currentWord,
    fade,
    isLoading,
    reply,
    files,
    responseContent,
    youtubeLink,
    currentBlurMessage,
    handleFileChange,
    handleButtonClick,
  };
}

export { useUtils };