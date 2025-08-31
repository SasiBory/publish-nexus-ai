'use server';

/**
 * @fileOverview Analyzes a niche keyword for its viability on Amazon KDP.
 *
 * - nicheAnalysis - A function that handles the niche analysis process.
 * - NicheAnalysisInput - The input type for the nicheAnalysis function.
 * - NicheAnalysisOutput - The return type for the nicheAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NicheAnalysisInputSchema = z.object({
  nicheKeyword: z.string().describe('The niche keyword to analyze (e.g., "libros de colorear para adultos").'),
});
export type NicheAnalysisInput = z.infer<typeof NicheAnalysisInputSchema>;

const NicheAnalysisOutputSchema = z.object({
  nicheSize: z.enum(['Pequeño', 'Mediano', 'Grande', 'Muy Grande']).describe('Estimated size of the niche based on search volume and product count.'),
  competitionLevel: z.enum(['Baja', 'Media', 'Alta', 'Muy Alta']).describe('The level of competition in this niche.'),
  averageBSR: z.string().describe('The estimated average Best Sellers Rank (BSR) for top products in this niche.'),
  seasonality: z.string().describe('A brief description of the niche\'s seasonality (e.g., "Alta en Navidad", "Constante todo el año").'),
  strategicGuidance: z.object({
    summary: z.string().describe('A summary of the niche\'s viability for a new author.'),
    angle_of_attack: z.string().describe('A specific, actionable recommendation on how to enter and succeed in this niche.'),
    potential_pitfalls: z.string().describe('A warning about potential difficulties or traps in this niche.'),
  }).describe('Actionable strategic guidance for the author.'),
});
export type NicheAnalysisOutput = z.infer<typeof NicheAnalysisOutputSchema>;

export async function nicheAnalysis(input: NicheAnalysisInput): Promise<NicheAnalysisOutput> {
  return nicheAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nicheAnalysisPrompt',
  input: {schema: NicheAnalysisInputSchema},
  output: {schema: NicheAnalysisOutputSchema},
  prompt: `Eres un estratega de publicación de clase mundial y experto en investigación de nichos para Amazon KDP. Tu tarea es realizar un análisis profundo de la siguiente palabra clave de nicho y proporcionar una guía estratégica accionable para un autor.

Palabra clave del nicho: {{{nicheKeyword}}}

Realiza tu análisis basándote en datos simulados del mercado y proporciona:
1.  **Tamaño del Nicho:** (Pequeño, Mediano, Grande, Muy Grande).
2.  **Nivel de Competencia:** (Baja, Media, Alta, Muy Alta).
3.  **BSR Promedio:** Una estimación del BSR promedio de los libros top.
4.  **Estacionalidad:** Descripción breve de patrones de estacionalidad.
5.  **Guía Estratégica (strategicGuidance):**
    - **Resumen (summary):** Un párrafo conciso sobre si el nicho es viable y por qué.
    - **Ángulo de Ataque (angle_of_attack):** Esta es la parte más importante. Proporciona una recomendación creativa y específica sobre CÓMO un autor puede diferenciarse y tener éxito. Busca un punto débil en el mercado. Ejemplos: "Enfócate en un sub-nicho desatendido como 'libros de colorear de dinosaurios para niñas'", "Diferénciate con un estilo de humor irreverente, ya que los competidores son muy serios", "Crea una portada con un estilo ilustrado a mano para destacar entre las portadas generadas por IA".
    - **Riesgos Potenciales (potential_pitfalls):** Advierte sobre 1-2 dificultades clave. Ejemplos: "El nicho está dominado por una serie de un autor muy establecido", "Los márgenes de ganancia son bajos debido a los altos costos de impresión a color".`,
});

const nicheAnalysisFlow = ai.defineFlow(
  {
    name: 'nicheAnalysisFlow',
    inputSchema: NicheAnalysisInputSchema,
    outputSchema: NicheAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
