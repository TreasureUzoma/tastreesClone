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
  const origin = req.headers.get("origin");
  const ip =
    req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "";

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
    return new Response("Too many requests", { status: 429 });
  }

  if (!origin || !origin.includes("https://tastreesclone.vercel.app")) {
    return new Response("Forbidden", { status: 403 });
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

    // prompt
    const prompt = `
You are a professional chef and food analyst. Analyze the uploaded image(s) carefully and respond **in clean Markdown only** — do not use HTML tags.

---

### Rules:

1. **If it is cooked food**, reply starting with:
FOOD NAME
(Use uppercase letters and spaces only for the food name — so it can be matched by const foodNameMatch = response.match(/^[A-Z\\s]+/);)

Then continue with:

This food is known as **FoodName**, also known as _a_ or _b_. Then include one interesting fact about it.

---

## Recipe for FoodName

**Yields:** x servings  
**Prep time:** x minutes  
**Cook time:** x minutes  

### Ingredients
1. Ingredient 1  
2. Ingredient 2  
3. Ingredient 3  

### Equipment
Describe the main tools or kitchenware needed in a short paragraph.

### Instructions
Step-by-step cooking process in numbered points.

### Plating
How to serve **FoodName** (presentation ideas).

### Nutritional Value (per serving, approximate)
List key nutrition info such as calories, protein, fat, etc.

### Pro Chef Tips
Chef-level advice to improve or customize this dish.

---

2. **If it is raw food**, reply starting with:
FOOD TO COOK NAME
(Use uppercase letters and spaces only for the name — same regex applies.)

Then continue with:

You have these ingredients available: **list them briefly**

The best food you can prepare is **FoodName** — add a short fun fact.

---

## Recipe for FoodName

**Yields:** x servings  
**Prep time:** x minutes  
**Cook time:** x minutes  

### Ingredients
1. Ingredient 1  
2. Ingredient 2  
3. Ingredient 3  

### Equipment
Describe the tools required.

### Instructions
Detailed but concise cooking steps.

### Plating
Serving and presentation ideas.

### Nutritional Value (per serving, approximate)
Nutritional breakdown.

### Pro Chef Tips
_Pro tips in italics._

---

3. **If none of the images are food-related**, simply respond:
NOT FOOD

---

### Output requirements:
- Use **Markdown only**, not HTML.
- Use blank lines between sections.
- Use headings (**##**, **###**) and bold text consistently.
- Do not add code blocks.
- Ensure the very first line always starts with the uppercase identifier (FOOD NAME / FOOD TO COOK NAME / NOT FOOD).
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
      });
    } else {
      console.error("Unexpected error:", error);
      return new Response(
        JSON.stringify({ message: "An unknown error occurred" }),
        { status: 500 }
      );
    }
  }
}
