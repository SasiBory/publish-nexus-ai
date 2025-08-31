import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: () => {
        if (typeof window !== 'undefined') {
          const key = (window as Window & { __GEMINI_API_KEY?: string }).__GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
          if (key) return key;
        }
        
        const key = process.env.GEMINI_API_KEY;
        if (key) return key;

        // This error will be shown to the user if they haven't set an API key.
        throw new GenkitError({
          status: 'INVALID_ARGUMENT',
          message: 'Debes configurar una clave de API de Google AI. Ve a "Configuración" para agregar tu clave.',
        });
      },
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
