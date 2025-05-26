'use server';
/**
 * @fileOverview A harmonious color suggestion AI agent.
 *
 * - getHarmoniousColors - A function that handles the color suggestion process.
 * - HarmoniousColorsInput - The input type for the getHarmoniousColors function.
 * - HarmoniousColorsOutput - The return type for the getHarmoniousColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HarmoniousColorsInputSchema = z.object({
  baseColors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .describe('An array of hex color codes representing the current palette.'),
  numSuggestions: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of harmonious color suggestions to generate.'),
});
export type HarmoniousColorsInput = z.infer<typeof HarmoniousColorsInputSchema>;

const HarmoniousColorsOutputSchema = z.object({
  suggestions: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .describe('An array of hex color codes that are harmonious with the base colors.'),
});
export type HarmoniousColorsOutput = z.infer<typeof HarmoniousColorsOutputSchema>;

export async function getHarmoniousColors(input: HarmoniousColorsInput): Promise<HarmoniousColorsOutput> {
  return harmoniousColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'harmoniousColorsPrompt',
  input: {schema: HarmoniousColorsInputSchema},
  output: {schema: HarmoniousColorsOutputSchema},
  prompt: `You are a color palette expert. Given a list of base colors, you will suggest a number of harmonious colors to expand the palette.

Base Colors:
{{#each baseColors}}
- {{this}}
{{/each}}

Number of Suggestions: {{numSuggestions}}

Please provide {{numSuggestions}} hex color codes that would be harmonious with the provided base colors. Return them as a JSON array of strings. The hex codes should be exactly 6 characters long, not including the '#'. Do not include any other text in your response. Every hex code MUST start with a '#'.`,
});

const harmoniousColorsFlow = ai.defineFlow(
  {
    name: 'harmoniousColorsFlow',
    inputSchema: HarmoniousColorsInputSchema,
    outputSchema: HarmoniousColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
