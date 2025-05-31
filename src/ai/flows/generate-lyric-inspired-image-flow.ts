
'use server';
/**
 * @fileOverview A Genkit flow to generate an image inspired by a song lyric.
 *
 * - generateLyricInspiredImage - A function that takes a lyric and returns an image URL.
 * - GenerateLyricInspiredImageInput - The input type.
 * - GenerateLyricInspiredImageOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLyricInspiredImageInputSchema = z.object({
  lyricLine: z.string().describe('A line of song lyrics to inspire the image.'),
});
export type GenerateLyricInspiredImageInput = z.infer<typeof GenerateLyricInspiredImageInputSchema>;

const GenerateLyricInspiredImageOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe('The URL of the generated image (data URI). Null if generation failed.'),
  promptUsed: z.string().optional().describe('The actual prompt used for generation.'),
});
export type GenerateLyricInspiredImageOutput = z.infer<typeof GenerateLyricInspiredImageOutputSchema>;

// This is the function that will be called from the client component.
export async function generateLyricInspiredImage(input: GenerateLyricInspiredImageInput): Promise<GenerateLyricInspiredImageOutput> {
  return lyricImageGenerationFlow(input);
}

const lyricImageGenerationFlow = ai.defineFlow(
  {
    name: 'lyricImageGenerationFlow',
    inputSchema: GenerateLyricInspiredImageInputSchema,
    outputSchema: GenerateLyricInspiredImageOutputSchema,
  },
  async (input) => {
    const imagePrompt = `Create an abstract, artistic, visually appealing background image inspired by the feeling and imagery of the following lyric. Do not include any text in the image. Focus on mood, color, and texture. Lyric: "${input.lyricLine}"`;
    
    try {
      const {media, usage} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Ensure this model supports image generation
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Important for image generation models
          // Optional: Configure safety settings if default is too restrictive
           safetySettings: [
             { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
             { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
             { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
             { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
           ],
        },
      });

      if (media?.url) {
        return { imageUrl: media.url, promptUsed: imagePrompt };
      } else {
        console.warn('Image generation did not return a media URL. Usage:', usage);
        return { imageUrl: null, promptUsed: imagePrompt };
      }
    } catch (error: any) {
      console.error('Error during image generation in flow:', error.message ? `${error.message} - ${error.stack}` : error);
      return { imageUrl: null, promptUsed: imagePrompt };
    }
  }
);
