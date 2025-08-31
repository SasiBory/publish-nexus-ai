import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { geminiPro } from '@genkit-ai/google-cloud';

configureGenkit({
  plugins: [
    firebase(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Configure the Gemini Pro model
// Ensure GOOGLE_API_KEY is set in your environment variables
// or passed directly here.
geminiPro({
  apiKey: process.env.GOOGLE_API_KEY,
});
