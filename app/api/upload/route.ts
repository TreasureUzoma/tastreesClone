import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
      1. If it is raw food, describe how it can be prepared and cooked.
      2. If it is cooked food, provide preparation details and a related YouTube video link for reference.
      3. If it is not food-related, simply respond with 'NOT FOOD'.
    `;

    // Process images and generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const responses = await Promise.all(
      images.map(async (imageBase64: string) => {
        try {
          const result = await model.generateContent([
            prompt,
            {
              fileData: {
                fileUri: imageBase64,
                mimeType: "image/jpeg",
              },
            },
          ]);

          return result.response?.text() || "No response from the model.";
        } catch (error) {
          console.error("Error processing image:", error);
          return "Error processing image.";
        }
      })
    );

    return NextResponse.json({ message: "Files processed successfully.", analysis: responses }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error || "Internal Server Error" }, { status: 500 });
  }
}

