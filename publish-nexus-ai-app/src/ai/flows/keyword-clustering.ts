'use server';

/**
 * @fileOverview Groups a list of keywords into thematic clusters.
 *
 * - keywordClustering - A function that handles the keyword clustering process.
 * - KeywordClusteringInput - The input type for the keywordClustering function.
 * - KeywordClusteringOutput - The return type for the keywordClustering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schema for the input, which is a list of keywords and the overall niche context.
export const KeywordClusteringInputSchema = z.object({
  niche: z.string().describe('The main niche or topic for context (e.g., "Novela de Misterio").'),
  keywords: z.array(z.string()).describe('The list of keywords to be clustered.'),
});
export type KeywordClusteringInput = z.infer<typeof KeywordClusteringInputSchema>;

// Schema for a single cluster.
const ClusterSchema = z.object({
  clusterName: z.string().describe('A descriptive name for the thematic keyword cluster.'),
  clusterDescription: z.string().describe('A brief strategic explanation of what this cluster represents.'),
  keywords: z.array(z.string()).describe('The list of keywords from the input that belong to this cluster.'),
});

// Schema for the final output of the flow.
export const KeywordClusteringOutputSchema = z.object({
  clusters: z.array(ClusterSchema).describe('An array of keyword clusters.'),
});
export type KeywordClusteringOutput = z.infer<typeof KeywordClusteringOutputSchema>;

/**
 * Main function to be called from the frontend. Orchestrates the keyword clustering.
 */
export async function keywordClustering(input: KeywordClusteringInput): Promise<KeywordClusteringOutput> {
  return await keywordClusteringFlow(input);
}

// Define the AI prompt for clustering.
const keywordClusteringPrompt = ai.definePrompt({
  name: 'keywordClusteringPrompt',
  input: {schema: KeywordClusteringInputSchema},
  output: {schema: KeywordClusteringOutputSchema},
  prompt: `Eres un estratega de mercado editorial y un experto en SEO para Amazon KDP. Tu tarea es analizar la siguiente lista de palabras clave para el nicho "{{{niche}}}" y agruparlas en clústeres temáticos y lógicos.

Cada clúster debe representar una sub-temática clara, una intención de búsqueda específica o un ángulo de marketing dentro del nicho principal.

Para cada clúster, proporciona:
1.  **clusterName:** Un nombre de clúster conciso y descriptivo (ej., "Recetas para Principiantes", "Misterios Históricos").
2.  **clusterDescription:** Una breve explicación estratégica (1-2 frases) sobre la oportunidad o el público de este clúster.
3.  **keywords:** La lista de palabras clave exactas de la entrada que pertenecen a este clúster.

Asegúrate de que cada palabra clave de la lista de entrada se asigne a UN SOLO clúster para evitar duplicados y proporcionar una visión clara y organizada.

Lista de palabras clave a analizar:
{{#each keywords}}
- {{{this}}}
{{/each}}
`,
});

// Define the Genkit flow for the clustering process.
const keywordClusteringFlow = ai.defineFlow(
  {
    name: 'keywordClusteringFlow',
    inputSchema: KeywordClusteringInputSchema,
    outputSchema: KeywordClusteringOutputSchema,
  },
  async (input) => {
    const {output} = await keywordClusteringPrompt(input);
    return output!;
  }
);