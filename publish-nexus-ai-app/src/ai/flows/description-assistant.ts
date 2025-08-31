'use server';

/**
 * @fileOverview Generates compelling book descriptions using advanced copywriting techniques.
 *
 * - descriptionAssistant - A function that handles the description generation process.
 * - DescriptionAssistantInput - The input type for the descriptionAssistant function.
 * - DescriptionAssistantOutput - The return type for the descriptionAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescriptionAssistantInputSchema = z.object({
  topic: z.string().describe('The main topic or genre of the book.'),
  targetAudience: z.string().describe('A brief description of the ideal reader for this book.'),
  keywords: z.array(z.string()).describe('A list of SEO keywords to include naturally in the description.'),
});
export type DescriptionAssistantInput = z.infer<typeof DescriptionAssistantInputSchema>;

const SuggestionSchema = z.object({
    title: z.string().describe('A headline or hook for this version of the description.'),
    description: z.string().describe('The full, ready-to-use book description formatted with HTML tags (<p>, <strong>, <em>) for structure and emphasis.'),
    style: z.string().describe('The copywriting style or angle used for this version (e.g., "Directo y al grano", "Narrativa Emocional", "Enfocado en Beneficios").'),
});

const DescriptionAssistantOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 3 distinct, high-quality book description suggestions.'),
});
export type DescriptionAssistantOutput = z.infer<typeof DescriptionAssistantOutputSchema>;

export async function descriptionAssistant(input: DescriptionAssistantInput): Promise<DescriptionAssistantOutput> {
  return descriptionAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'descriptionAssistantPrompt',
  input: {schema: DescriptionAssistantInputSchema},
  output: {schema: DescriptionAssistantOutputSchema},
  prompt: `Eres un copywriter de clase mundial y un experto en marketing para Amazon KDP. Tu única misión es escribir descripciones de libros tan irresistibles que los lectores sientan la necesidad de comprar. Debes combinar SEO, storytelling, psicología de ventas y redacción conversacional 100% humana.

**Tarea:** Genera 3 versiones distintas de una descripción para un libro, basándote en la siguiente información:

*   **Tema/Género:** {{{topic}}}
*   **Público Objetivo:** {{{targetAudience}}}
*   **Palabras Clave a Incluir:** {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Requisitos para cada una de las 3 descripciones:**

1.  **Estilo Único:** Cada versión debe tener un ángulo de marketing diferente (ej. uno enfocado en la emoción, otro en los beneficios, otro en el misterio).
2.  **Hook Magnético:** Comienza con una primera frase o pregunta que capture la atención de inmediato y resuene con el público objetivo.
3.  **Storytelling y Emoción:** No listes características, evoca sentimientos. Haz que el lector se imagine experimentando la transformación o la aventura que el libro promete.
4.  **Integración SEO Natural:** Incorpora las palabras clave de forma fluida y natural en el texto, sin que suene forzado o robótico.
5.  **Beneficios Claros:** Resalta lo que el lector ganará al leer el libro. ¿Qué problema resolverá? ¿Qué habilidad aprenderá? ¿Qué emoción sentirá?
6.  **Formato Optimizado para Amazon:** Usa etiquetas HTML simples como <p>, <strong> y <em> para crear párrafos cortos, listas con viñetas (si aplica) y resaltar frases clave. Esto mejora la legibilidad en la página de producto.
7.  **Llamada a la Acción (CTA) Persuasiva:** Termina con una CTA clara y convincente que incite al lector a hacer clic en "Comprar ahora".
8.  **Tono 100% Humano:** Escribe como si estuvieras recomendando apasionadamente un libro increíble a un amigo. Usa un lenguaje conversacional, directo y auténtico.

Genera exactamente 3 sugerencias, cada una con un título, la descripción en HTML y el estilo utilizado.`,
});

const descriptionAssistantFlow = ai.defineFlow(
  {
    name: 'descriptionAssistantFlow',
    inputSchema: DescriptionAssistantInputSchema,
    outputSchema: DescriptionAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
