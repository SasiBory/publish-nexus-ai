'use server';

/**
 * @fileOverview Analyzes book listing text for compliance with KDP policies.
 *
 * - complianceCheck - A function that handles the compliance check process.
 * - ComplianceCheckInput - The input type for the complianceCheck function.
 * - ComplianceCheckOutput - The return type for the complianceCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceCheckInputSchema = z.object({
  listingText: z.string().describe('The full text from a book listing description to be analyzed.'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

const ComplianceIssueSchema = z.object({
  riskLevel: z.enum(['Bajo', 'Medio', 'Alto']).describe('The assessed risk level of the issue.'),
  issue: z.string().describe('A short description of the potential compliance issue found.'),
  suggestion: z.string().describe('A suggestion on how to remedy the potential issue.'),
});

const ComplianceCheckOutputSchema = z.object({
  overallVerdict: z.enum(['Aprobado', 'Revisión Necesaria']).describe('The overall compliance verdict.'),
  kdpTOS: z.array(ComplianceIssueSchema).describe('Potential issues related to KDP Terms of Service.'),
  copyright: z.array(ComplianceIssueSchema).describe('Potential issues related to copyright.'),
  trademark: z.array(ComplianceIssueSchema).describe('Potential issues related to trademarks.'),
});
export type ComplianceCheckOutput = z.infer<typeof ComplianceCheckOutputSchema>;

export async function complianceCheck(input: ComplianceCheckInput): Promise<ComplianceCheckOutput> {
  return complianceCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceCheckPrompt',
  input: {schema: ComplianceCheckInputSchema},
  output: {schema: ComplianceCheckOutputSchema},
  prompt: `Eres un experto en las políticas de Amazon KDP, derechos de autor y marcas registradas. Analiza el siguiente texto de la descripción de un libro para identificar posibles incumplimientos.

Texto a analizar:
---
{{{listingText}}}
---

Evalúa el texto en busca de:
1.  **Incumplimientos de los Términos de Servicio de KDP:** Busca lenguaje prohibido, promesas de resultados no garantizados, uso de testimonios no permitidos, etc.
2.  **Problemas de Copyright:** Identifica posibles usos de material protegido por derechos de autor, como citas extensas sin atribución o referencias a personajes/mundos de otros autores.
3.  **Problemas de Marcas Registradas:** Detecta el uso de nombres de marcas, empresas o productos registrados que podrían infringir los derechos de marca.

Para cada problema encontrado, clasifica el riesgo como 'Bajo', 'Medio' o 'Alto', describe el problema y ofrece una sugerencia para solucionarlo. Si no se encuentran problemas en una categoría, devuelve un array vacío.

El veredicto general debe ser 'Aprobado' si no hay problemas o solo hay riesgos 'Bajos'. Si hay algún riesgo 'Medio' o 'Alto', el veredicto debe ser 'Revisión Necesaria'.`,
});

const complianceCheckFlow = ai.defineFlow(
  {
    name: 'complianceCheckFlow',
    inputSchema: ComplianceCheckInputSchema,
    outputSchema: ComplianceCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);