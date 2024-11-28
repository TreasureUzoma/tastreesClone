import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function base64ToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data, // Raw Base64 data (without the prefix)
      mimeType: mimeType,
    },
  };
}


// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function fetchYouTubeVideo(foodName: string): Promise<string | null> {
  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      console.error("Missing YouTube API key.");
      return null;
    }

    const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(
     "How to cook" + foodName
    )}&key=${youtubeApiKey}`;

    const response = await fetch(youtubeSearchUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '';

  const now = Date.now();

  const limit = 2; // Max requests
  const timeframe = 61 * 1000; // 1 minute

  const clientData = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  if (now - clientData.timestamp < timeframe) {
    clientData.count += 1;
  } else {
    clientData.count = 1;
    clientData.timestamp = now;
  }

  rateLimitMap.set(ip, clientData);

  if (clientData.count > limit) {
    return new Response('Too many requests', { status: 429 });
  }

  if (!origin || !origin.includes('https://tastreesclone.vercel.app')) {
    return new Response('Forbidden', { status: 403 });
  }


  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const data = await req.json();
    const { images } = data;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided." },
        { status: 400 }
      );
    }

    // Prepare prompt
    const prompt = `
      Analyze the uploaded image(s) and:
      1. If it is cooked food reply like this:
       FOOD NAME (in caps)
      
       This food is know as <b>FoodNme</b>, also known as a or b. Then a fact about the food.\n\n
      <b>Recipe for [food name]</b>
       <b>Yields:</b>x serving, Prep time: x minutes, cook time, x minutes

      <b>Ingedients:</b>
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


      2. If it is raw food, provide what you think its best to cook with and then like:

       FOOD TO COOk NAME (in caps)

      You have these ingredients available <b>items</b>\n\n
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
      <em>[Your stuff]</em>

      3. If it is not food-related, simply respond with 'NOT FOOD'

      PS: Space your reply, add paragraphs, line breaks, bold texts etc, reply with amarkdown-like syntax, react-markdown is waiting for your response.
      `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const responses = await Promise.all(
      images.map(async (imageBase64: string) => {
        try {
          const part = base64ToGenerativePart(imageBase64, "image/jpeg");

          const result = await model.generateContent([prompt, part]);

          return result.response.text() || "No response from the model.";
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error:", error.message); // Safely access error properties
            return `Error: ${error.message}`;
          } else {
            console.error("Unexpected error:", error);
            return "Error processing image";
          }
        }
      })
    );

    // Embed link logic: Extract food names and fetch YouTube videos
    const embedLinks = await Promise.all(
      responses.map(async (response) => {
        const foodNameMatch = response.match(/^[A-Z\s]+/); // Matches uppercase food names
        const foodName = foodNameMatch ? foodNameMatch[0].trim() : null;
        return foodName ? await fetchYouTubeVideo(foodName) : null;
      })
    );

    return NextResponse.json(
      {
        message: "Files processed successfully.",
        analysis: responses, // Keep the original analysis unchanged
        embedLinks: embedLinks,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message); // Safely access error properties
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500 }
      );
    } else {
      console.error("Unexpected error:", error);
      return new Response(
        JSON.stringify({ message: "An unknown error occurred" }),
        { status: 500 }
      );
    }
  }
}
