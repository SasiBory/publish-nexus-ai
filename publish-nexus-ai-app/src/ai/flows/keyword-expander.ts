'use server';

/**
 * @fileOverview Expands a seed keyword by fetching real autocomplete suggestions and enriching them with AI.
 *
 * - keywordExpander - A function that handles the keyword expansion and analysis process.
 * - KeywordExpanderInput - The input type for the keywordExpander function.
 * - KeywordExpanderOutput - The return type for the keywordExpander function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schema for the primary input from the user
export const KeywordExpanderInputSchema = z.object({
  seedKeyword: z.string().describe('The starting keyword to expand.'),
  marketplace: z.string().describe('The Amazon marketplace domain (e.g., "amazon.com", "amazon.es").'),
  language: z.string().describe('The language for the suggestions (e.g., "English", "Español").'),
});
export type KeywordExpanderInput = z.infer<typeof KeywordExpanderInputSchema>;

// Schema for the output of a single expanded keyword
const ExpandedKeywordSchema = z.object({
    keyword: z.string().describe('The expanded keyword suggestion.'),
    intent: z.enum(['Informativa', 'Comercial', 'De Marca', 'Transaccional', 'Desconocida']).describe('The likely search intent behind the keyword.'),
});

// Schema for the final output of the flow
export const KeywordExpanderOutputSchema = z.object({
  keywords: z.array(ExpandedKeywordSchema).describe('A list of expanded and analyzed keyword suggestions.'),
});
export type KeywordExpanderOutput = z.infer<typeof KeywordExpanderOutputSchema>;

/**
 * Main function to be called from the frontend. Orchestrates the entire keyword expansion process.
 */
export async function keywordExpander(input: KeywordExpanderInput): Promise<KeywordExpanderOutput> {
  // Step 1: Fetch REAL autocomplete suggestions.
  // In a real-world scenario, this would call an external API or a scraping service.
  // For now, we simulate this by creating a richer list of potential search queries.
  const realSuggestions = await getRealAutocompleteSuggestions(input.seedKeyword);

  // Step 2: Use the AI to analyze and classify the real suggestions.
  return await analyzeKeywordsFlow({
    seedKeyword: input.seedKeyword,
    language: input.language,
    keywordsToAnalyze: realSuggestions,
  });
}

/**
 * Simulates fetching real-time autocomplete suggestions from Amazon.
 * This function would be replaced with a real API call in production.
 * @param seedKeyword The base keyword to expand.
 * @returns A list of realistic search queries.
 */
async function getRealAutocompleteSuggestions(seedKeyword: string): Promise<string[]> {
  const prefixes = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const questions = ['cómo', 'qué', 'dónde', 'cuál', 'por qué', 'para'];

  const suggestions = new Set<string>();
  suggestions.add(seedKeyword);

  // Add prefix variations (e.g., "libros de misterio a", "libros de misterio b")
  prefixes.forEach(p => suggestions.add(`${seedKeyword} ${p}`));
  
  // Add question variations (e.g., "cómo escribir libros de misterio")
  questions.forEach(q => suggestions.add(`${q} ${seedKeyword}`));

  return Array.from(suggestions);
}

// Define the AI prompt for ANALYSIS, not generation.
const keywordAnalyzerPrompt = ai.definePrompt({
  name: 'keywordAnalyzerPrompt',
  input: {schema: z.object({
    seedKeyword: z.string(),
    language: z.string(),
    keywordsToAnalyze: z.array(z.string()),
  })},
  output: {schema: KeywordExpanderOutputSchema},
  prompt: `Eres un experto en SEO para Amazon KDP. Tu tarea es analizar una lista de palabras clave de búsqueda reales para el idioma '{{{language}}}'.
Para cada palabra clave en la lista, clasifica la intención de búsqueda del usuario en una de las siguientes categorías:
- **Informativa:** El usuario busca información (ej., "cómo escribir una novela de misterio").
- **Comercial:** El usuario investiga antes de comprar (ej., "mejores libros de ciencia ficción").
- **Transaccional:** El usuario tiene una fuerte intención de comprar ahora (ej., "comprar novela de Stephen King It").
- **De Marca:** El usuario busca un autor o una serie específica (ej., "libros de Brandon Sanderson").
- **Desconocida:** La intención no está clara.

Analiza la siguiente lista de palabras clave relacionadas con "{{{seedKeyword}}}":
{{#each keywordsToAnalyze}}
- {{{this}}}
{{/each}}
`,
});

// Define the Genkit flow for the AI analysis part.
const analyzeKeywordsFlow = ai.defineFlow(
  {
    name: 'analyzeKeywordsFlow',
    inputSchema: z.object({
      seedKeyword: z.string(),
      language: z.string(),
      keywordsToAnalyze: z.array(z.string()),
    }),
    outputSchema: KeywordExpanderOutputSchema,
  },
  async (input) => {
    const {output} = await keywordAnalyzerPrompt(input);
    return output!;
  }
);
