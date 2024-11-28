import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function base64ToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,  // Raw Base64 data (without the prefix)
      mimeType: mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY." }, { status: 500 });
    }

    const data = await req.json();
    const { images } = data;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    // Prepare prompt
    const prompt = `
      Analyze the uploaded image(s) and:
      1. If it is cooked food reply like this: 
       This food is know as FoodNme, also known as a or b. Then a fact about the food. 
      Recipe for [food name]
      Yields:x serving, Prep time: x minutes, cook time, x minutes

      Ingedients:
      [recipe in ordered list]

      Equipment:
      [a paragraph of equipment]

      Instructions:
      [do your stuff]

      Plating:
      Serve [Foodname] as [your stuff]

      Nutritional Value (per serving, approximate)
      [your stuff]

      Pro Chef Tips:
      [Your stuff]

      [youtube video link]


      2. If it is raw food, provide what you think its best to cook with and then like:
      You have these ingredients available
       The best food you can prepare is: Then a fact about the food. 
      Recipe for [food name]
      Yields:x serving, Prep time: x minutes, cook time, x minutes

      Ingedients:
      [recipe in ordered list]

      Equipment:
      [a paragraph of equipment]

      Instructions:
      [do your stuff]

      Plating:
      Serve [Foodname] as [your stuff]

      Nutritional Value (per serving, approximate)
      [your stuff]

      Pro Chef Tips:
      [Your stuff]

      [youtube video link]

      3. If it is not food-related, simply respond with 'NOT FOOD'

      PS: youtube video link should be an embedded link for iframe tag, only reply with the link not tag like this (https://www.youtube.com/embed/watch/dQw4w9WgXcQ)(/(https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+)/) without watch?v= or any label to it
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const responses = await Promise.all(
      images.map(async (imageBase64: string) => {
        try {
          const part = base64ToGenerativePart(imageBase64, "image/jpeg");

          const result = await model.generateContent([prompt, part]);

          return result.response.text() || "No response from the model.";
        } catch (error ) {
          if (error instanceof Error) {
            console.error("Error:", error.message); // Safely access error properties
            return new Response(JSON.stringify({ message: error.message }), { status: 500 });
          } else {
            console.error("Unexpected error:", error);
            return new Response(JSON.stringify({ message: "Error processing image" }), { status: 500 });
          }
        }
      })
    );

    return NextResponse.json(
      { message: "Files processed successfully.", analysis: responses },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message); // Safely access error properties
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return new Response(JSON.stringify({ message: "An unknown error occurred" }), { status: 500 });
    }
  }
  }
