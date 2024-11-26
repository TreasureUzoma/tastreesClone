// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate environment variable upfront
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('API key is missing in environment variables.');
}


// GET handler
export async function GET() {
  // Fully qualified URL to the public image
  const imageUrl = `C:/Users/HU/Desktop/tastressclone/public/images/logo.png`;

  try {
    // Step 1: Use a public image URL
    const fileManager = new GoogleAIFileManager(<string>GEMINI_API_KEY);
    const uploadResult = await fileManager.uploadFile(imageUrl, {
      mimeType: 'image/jpeg',
      displayName: 'Logo Image',
    });

    // Step 2: Use the uploaded file in the Generative AI model
    const genAI = new GoogleGenerativeAI(<string>GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      'Tell me about this image.',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    // Step 3: Respond with the AI-generated result
    return NextResponse.json({
      message: 'Image analyzed successfully.',
      fileUri: uploadResult.file.uri,
      analysis: result.response.text(),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error analyzing image:', error);
      return NextResponse.json({ error: 'Failed to analyze the image.', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
    }
  }
}
