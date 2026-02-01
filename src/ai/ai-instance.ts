
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// =================================================================================================
// IMPORTANT: USER ACTION REQUIRED FOR GOOGLE GENERATIVE AI
// =================================================================================================
// The application is encountering an error because the Google Generative AI API key is missing or invalid.
// This is indicated by errors like "[400 Bad Request] API key not valid. Please pass a valid API key."
//
// To fix this, you MUST:
// 1. Obtain a valid API key for Google Generative AI. You can create one in Google AI Studio:
//    https://aistudio.google.com/app/apikey
// 2. Create or update the `.env` file in the root of your project.
// 3. Add your API key to the `.env` file using the variable name GOOGLE_GENAI_API_KEY:
//    GOOGLE_GENAI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
//    Replace "YOUR_ACTUAL_API_KEY_HERE" with your REAL API key.
//
// Example (DO NOT USE THIS EXAMPLE KEY, IT IS ILLUSTRATIVE):
// GOOGLE_GENAI_API_KEY="AIzaSy**********************************"
//
// 4. IMPORTANT: Restart your Next.js development server (e.g., by stopping `npm run dev`
//    and running it again) for the changes in `.env` to take effect.
//
// Without a valid API key, AI-powered features (like task suggestions, analysis, etc.) will not work.
// =================================================================================================

// Check if the API key is set and provide a helpful message if not.
// This check runs when the server starts or this module is first imported.
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error(
    '\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' +
    'ERROR: The GOOGLE_GENAI_API_KEY environment variable is not set.\n' +
    'AI features of this application will NOT work.\n\n' +
    'TO FIX THIS:\n' +
    '1. Obtain an API key from Google AI Studio: https://aistudio.google.com/app/apikey\n' +
    '2. Create a file named .env in the root of your project (if it doesn\'t exist).\n' +
    '3. Add the following line to your .env file, replacing with your actual key:\n' +
    '   GOOGLE_GENAI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"\n' +
    '4. Restart your development server.\n' +
    '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n'
  );
}

export const ai = genkit({
  plugins: [
    googleAI(), // Genkit's googleAI plugin will automatically look for
                // GOOGLE_GENAI_API_KEY or GOOGLE_API_KEY in process.env
  ],
  // No default model is specified here. Each flow will define its own model.
});
