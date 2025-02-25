import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};

const requestLog: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove old requests
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT.windowMs) {
    requestLog.shift();
  }
  // Check if we're over the limit
  if (requestLog.length >= RATE_LIMIT.maxRequests) {
    return false;
  }
  // Add new request
  requestLog.push(now);
  return true;
}

export async function analyzeImage(image: string, symptoms: string) {
  try {
    // Check if Gemini API key is configured
    if (!config.gemini.apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    // Input validation
    if (!image || !symptoms) {
      throw new Error('Image and symptoms are required');
    }

    // Rate limiting
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const base64Data = image.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image format');
    }

    // Initialize Gemini only when needed
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

    // Sanitize symptoms input
    const sanitizedSymptoms = symptoms.replace(/[<>]/g, '');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a medical diagnostic assistant. Analyze the provided medical image and symptoms: ${sanitizedSymptoms}

Please provide a structured analysis in the following format (do not include any markdown ** symbols):

DISCLAIMER:
This is an AI-assisted preliminary analysis for informational purposes only. This is not a substitute for professional medical advice.

ANALYSIS OF IMAGE:
[Provide a clear, professional description of what you observe in the medical image]

POTENTIAL CONDITIONS:
• [Condition 1]: [Brief explanation]
• [Condition 2]: [Brief explanation]
• [Additional conditions as needed]

LEVEL OF CONCERN:
[State whether the concern level is Low, Medium, or High and provide a brief justification]

RECOMMENDED NEXT STEPS:
• [Step 1]
• [Step 2]
• [Additional steps as needed]

MEDICAL ATTENTION:
[Clearly state whether immediate medical attention is recommended]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No analysis generated');
    }
    
    // Clean up any remaining markdown symbols and sanitize output
    return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/[<>]/g, '');
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during analysis');
  }
}