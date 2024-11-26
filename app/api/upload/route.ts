import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

  export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse the incoming form-data request
    const { files } = (await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    })) as { fields: formidable.Fields; files: formidable.Files };

    // Extract the uploaded file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Prepare the file for the model
    const fileData = {
      fileUri: uploadedFile.filepath, // Temporary file path
      mimeType: uploadedFile.mimetype || "application/octet-stream",
    };

    // Custom prompt
    const prompt = `
      Analyze the uploaded image and:
      1. If it is raw food, describe how it can be prepared and cooked.
      2. If it is cooked food, provide preparation details and a related YouTube video link for reference.
      3. If it is not food-related, simply respond with 'NOT FOOD'.
    `;

    // Call the AI model with the prompt and image
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await await model.generateContent([
      prompt,
      {
        fileData,
      },
    ]);

    // Extract the response
    const analysis = result.response?.text?.() || "No response from the model.";

    return res.status(200).json({ analysis });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to process the request." });
  }
}
