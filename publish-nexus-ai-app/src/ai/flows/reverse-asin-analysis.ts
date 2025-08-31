'use server';

/**
 * @fileOverview A reverse ASIN analysis AI agent.
 *
 * - reverseAsinAnalysis - A function that handles the reverse ASIN analysis process.
 * - ReverseAsinAnalysisInput - The input type for the reverseAsinAnalysis function.
 * - ReverseAsinAnalysisOutput - The return type for the reverseAsinAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReverseAsinAnalysisInputSchema = z.object({
  asin: z.string().describe('The ASIN of the product to analyze.'),
});
export type ReverseAsinAnalysisInput = z.infer<typeof ReverseAsinAnalysisInputSchema>;

const KeywordSchema = z.object({
  keyword: z.string().describe('The derived keyword.'),
  searchVolume: z.string().describe('Estimated monthly search volume (e.g., "5,400/mes").'),
  competition: z.enum(['Baja', 'Media', 'Alta']).describe('The competition level for the keyword.'),
});

const ReverseAsinAnalysisOutputSchema = z.object({
  productOverview: z.string().describe('A detailed overview of the product, including title, author, and general theme.'),
  conversionMetrics: z.string().describe('Key conversion metrics for the product, such as sales rank, ratings, and review count.'),
  comparableProducts: z.string().describe('A summary of comparable products and their key features.'),
  derivedKeywords: z.array(KeywordSchema).describe('A list of keywords derived from the product listing and comparable products, including search volume and competition level.'),
  strategicWeakness: z.object({
    identified_weakness: z.string().describe('The single most significant strategic weakness of the product.'),
    exploitation_plan: z.string().describe('An actionable plan to exploit the identified weakness.'),
  }).describe('An analysis of the competitor\'s main weakness and a plan to outperform it.'),
});
export type ReverseAsinAnalysisOutput = z.infer<typeof ReverseAsinAnalysisOutputSchema>;

export async function reverseAsinAnalysis(input: ReverseAsinAnalysisInput): Promise<ReverseAsinAnalysisOutput> {
  return reverseAsinAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reverseAsinAnalysisPrompt',
  input: {schema: ReverseAsinAnalysisInputSchema},
  output: {schema: ReverseAsinAnalysisOutputSchema},
  prompt: `You are an expert in reverse-engineering successful products on Amazon KDP. Your analysis is sharp, data-driven, and focused on finding competitive advantages. Given an ASIN, you will provide a comprehensive 360° view of the product and, most importantly, a plan to outperform it.

Analyze the following ASIN: {{asin}}

Provide the following information:

- Product Overview: A detailed overview of the product.
- Conversion Metrics: Key conversion metrics for the product.
- Comparable Products: A list of comparable products and their key features.
- Derived Keywords: A list of at least 15 keywords derived from the product listing and comparable products. For each keyword, provide an estimated monthly search volume and a competition level (Baja, Media, o Alta).
- Strategic Weakness: This is the most critical part. Based on all the data above, provide:
    - **Identified Weakness:** Pinpoint the single most significant strategic weakness of this product. Look for patterns in negative reviews, a suboptimal cover, a high price, or a poorly optimized title/description.
    - **Exploitation Plan:** Provide a clear, actionable plan for a new author to exploit this weakness and launch a superior competing product.`,
});

const reverseAsinAnalysisFlow = ai.defineFlow(
  {
    name: 'reverseAsinAnalysisFlow',
    inputSchema: ReverseAsinAnalysisInputSchema,
    outputSchema: ReverseAsinAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
