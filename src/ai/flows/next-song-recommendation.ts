// src/ai/flows/next-song-recommendation.ts
'use server';

/**
 * @fileOverview Recommends the next song based on the user's current playlist and listening history.
 *
 * - getNextSongRecommendation - A function that takes the current playlist and listening history as input and returns a song recommendation.
 * - NextSongRecommendationInput - The input type for the getNextSongRecommendation function.
 * - NextSongRecommendationOutput - The return type for the getNextSongRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NextSongRecommendationInputSchema = z.object({
  playlist: z
    .array(z.string())
    .describe('The current playlist of songs (names only).'),
  listeningHistory: z
    .array(z.string())
    .describe('The user listening history of songs (names only).'),
});
export type NextSongRecommendationInput = z.infer<
  typeof NextSongRecommendationInputSchema
>;

const NextSongRecommendationOutputSchema = z.object({
  recommendedSong: z.string().describe('The name of the recommended song.'),
  reason: z
    .string()
    .describe('The reason why this song was recommended.'),
});
export type NextSongRecommendationOutput = z.infer<
  typeof NextSongRecommendationOutputSchema
>;

export async function getNextSongRecommendation(
  input: NextSongRecommendationInput
): Promise<NextSongRecommendationOutput> {
  return nextSongRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nextSongRecommendationPrompt',
  input: {schema: NextSongRecommendationInputSchema},
  output: {schema: NextSongRecommendationOutputSchema},
  prompt: `Based on the current playlist and listening history, recommend the next song to play.

Current Playlist: {{#each playlist}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Listening History: {{#each listeningHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Reason your recommendation in a short sentence, taking into account songs from both the playlist and listening history.

Recommended Song:`,
});

const nextSongRecommendationFlow = ai.defineFlow(
  {
    name: 'nextSongRecommendationFlow',
    inputSchema: NextSongRecommendationInputSchema,
    outputSchema: NextSongRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
