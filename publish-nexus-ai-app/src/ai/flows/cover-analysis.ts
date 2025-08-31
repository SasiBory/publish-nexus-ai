'use server';

/**
 * @fileOverview Analyzes book cover images and provides feedback on design elements.
 *
 * - analyzeCover - A function that handles the book cover analysis process.
 * - AnalyzeCoverInput - The input type for the analyzeCover function.
 * - AnalyzeCoverOutput - The return type for the analyzeCover function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCoverInputSchema = z.object({
  coverDataUri: z
    .string()
    .describe(
      "A book cover photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCoverInput = z.infer<typeof AnalyzeCoverInputSchema>;

const AnalyzeCoverOutputSchema = z.object({
  legibility: z
    .string()
    .describe('An analysis of the legibility of the text on the cover.'),
  contrast: z
    .string()
    .describe('An analysis of the contrast of the colors on the cover.'),
  visualHierarchy: z
    .string()
    .describe('An analysis of the visual hierarchy of the elements on the cover.'),
  attentionHeatmap: z
    .string()
    .describe(
      'A description of the attention heatmap of the cover, indicating which areas are most likely to attract attention.'
    ),
});
export type AnalyzeCoverOutput = z.infer<typeof AnalyzeCoverOutputSchema>;

export async function analyzeCover(input: AnalyzeCoverInput): Promise<AnalyzeCoverOutput> {
  return analyzeCoverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCoverPrompt',
  input: {schema: AnalyzeCoverInputSchema},
  output: {schema: AnalyzeCoverOutputSchema},
  prompt: `You are an expert book cover designer with deep knowledge of the Amazon KDP marketplace. You understand what makes a cover stand out in a sea of thumbnails and convert clicks into sales on Amazon. Your analysis must be based on KDP's best practices.

You will analyze the provided book cover and provide feedback on its legibility, contrast, visual hierarchy, and attention heatmap. Be specific in your feedback, and provide actionable suggestions for improvement that align with what works on Amazon.

Use the following as the primary source of information about the book cover.

Cover: {{media url=coverDataUri}}`,
});

const analyzeCoverFlow = ai.defineFlow(
  {
    name: 'analyzeCoverFlow',
    inputSchema: AnalyzeCoverInputSchema,
    outputSchema: AnalyzeCoverOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
