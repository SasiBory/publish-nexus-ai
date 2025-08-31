'use server';

/**
 * @fileOverview Provides title and subtitle suggestions for a book based on a topic.
 *
 * - titleAssistant - A function that handles the title suggestion process.
 * - TitleAssistantInput - The input type for the titleAssistant function.
 * - TitleAssistantOutput - The return type for the titleAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TitleAssistantInputSchema = z.object({
  topic: z.string().describe('The main topic or keyword for the book.'),
});
export type TitleAssistantInput = z.infer<typeof TitleAssistantInputSchema>;

const SuggestionSchema = z.object({
    title: z.string().describe('The suggested book title. Should be compelling and ideally under 60 characters.'),
    subtitle: z.string().describe('The suggested book subtitle. Should be descriptive, include keywords, and be under 200 characters.'),
    reasoning: z.string().describe('A brief explanation of why this title/subtitle combination is effective.'),
});

const TitleAssistantOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 5-7 title and subtitle suggestions.'),
});
export type TitleAssistantOutput = z.infer<typeof TitleAssistantOutputSchema>;

export async function titleAssistant(input: TitleAssistantInput): Promise<TitleAssistantOutput> {
  return titleAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'titleAssistantPrompt',
  input: {schema: TitleAssistantInputSchema},
  output: {schema: TitleAssistantOutputSchema},
  prompt: `Eres un experto en copywriting y SEO para Amazon KDP. Tu tarea es generar una lista de combinaciones de título y subtítulo atractivas y optimizadas para un libro sobre el siguiente tema.

Tema del libro: {{{topic}}}

Genera entre 5 y 7 sugerencias. Para cada sugerencia:
1.  **Título:** Crea un título que sea corto, memorable y que despierte la curiosidad. Idealmente, menos de 60 caracteres para una visualización óptima en los resultados de búsqueda.
2.  **Subtítulo:** Escribe un subtítulo descriptivo que contenga palabras clave relevantes, aclare el beneficio principal para el lector y actúe como un gancho de venta. Idealmente, menos de 200 caracteres.
3.  **Justificación:** Proporciona una breve explicación (1-2 frases) de por qué la combinación de título y subtítulo es efectiva, mencionando el ángulo de marketing o la intención de búsqueda que aborda.

Asegúrate de que las sugerencias sean variadas, explorando diferentes ángulos (ej. para principiantes, para expertos, orientado a resultados, orientado al problema).`,
});

const titleAssistantFlow = ai.defineFlow(
  {
    name: 'titleAssistantFlow',
    inputSchema: TitleAssistantInputSchema,
    outputSchema: TitleAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

