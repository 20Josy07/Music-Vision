
'use server';
/**
 * @fileOverview A Genkit flow to fetch song lyrics from LRCLIB.
 *
 * - fetchLyrics - A function that searches for and retrieves lyrics.
 * - FetchLyricsInput - The input type for the fetchLyrics function.
 * - FetchLyricsOutput - The return type for the fetchLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LRCLIB_API_BASE = 'https://lrclib.net/api';

const FetchLyricsInputSchema = z.object({
  trackName: z.string().describe('The name of the track.'),
  artistName: z.string().describe('The name of the artist.'),
  albumName: z.string().optional().describe('The name of the album (optional).'),
  duration: z.number().optional().describe('The duration of the track in seconds (optional).'),
});
export type FetchLyricsInput = z.infer<typeof FetchLyricsInputSchema>;

const FetchLyricsOutputSchema = z.object({
  lyricsId: z.number().nullable().describe('The ID of the lyrics on LRCLIB, if found.'),
  sourceName: z.string().nullable().describe('The name of the lyric file or entry from LRCLIB.'),
  syncedLyrics: z.string().nullable().describe('Synchronized lyrics in LRC format.'),
  plainLyrics: z.string().nullable().describe('Plain, non-synchronized lyrics.'),
  instrumental: z.boolean().describe('Whether the track is marked as instrumental.'),
  message: z.string().nullable().describe('A message, e.g., if lyrics are not found or an error occurred.'),
});
export type FetchLyricsOutput = z.infer<typeof FetchLyricsOutputSchema>;

interface LrclibSearchResult {
  id: number;
  name: string; // LRC file name
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  lang?: string;
  spotifyId?: string;
}

interface LrclibGetResult extends LrclibSearchResult {
  plainLyrics?: string;
  syncedLyrics?: string;
}

export async function fetchLyrics(input: FetchLyricsInput): Promise<FetchLyricsOutput> {
  return fetchLyricsFlow(input);
}

const fetchLyricsFlow = ai.defineFlow(
  {
    name: 'fetchLyricsFlow',
    inputSchema: FetchLyricsInputSchema,
    outputSchema: FetchLyricsOutputSchema,
  },
  async (input: FetchLyricsInput): Promise<FetchLyricsOutput> => {
    console.log('fetchLyricsFlow started with input:', JSON.stringify(input));
    try {
      const searchParams = new URLSearchParams({
        track_name: input.trackName,
        artist_name: input.artistName,
      });
      if (input.albumName) {
        searchParams.append('album_name', input.albumName);
      }
      
      const searchUrl = `${LRCLIB_API_BASE}/search?${searchParams.toString()}`;
      console.log(`LRCLIB Search URL: ${searchUrl}`);

      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        const errorBody = await searchResponse.text().catch(() => 'Could not read error body');
        console.error(`LRCLIB search API error: ${searchResponse.status} ${searchResponse.statusText}. Body: ${errorBody}`);
        return { lyricsId: null, sourceName: null, syncedLyrics: null, plainLyrics: null, instrumental: false, message: `Error searching lyrics (${searchResponse.status}): ${searchResponse.statusText}. Details: ${errorBody}` };
      }

      let searchResults: LrclibSearchResult[];
      try {
        searchResults = await searchResponse.json();
      } catch (jsonError: any) {
        const responseBody = await searchResponse.text().catch(() => 'Could not read response body for JSON error debug');
        console.error(`LRCLIB search API JSON parsing error: ${jsonError.message}. Response body: ${responseBody}`);
        return { lyricsId: null, sourceName: null, syncedLyrics: null, plainLyrics: null, instrumental: false, message: `Error parsing lyrics search results: ${jsonError.message}` };
      }
      

      if (!searchResults || searchResults.length === 0) {
        console.log('LRCLIB: Lyrics not found in search results.');
        return { lyricsId: null, sourceName: null, syncedLyrics: null, plainLyrics: null, instrumental: false, message: 'Lyrics not found.' };
      }

      let bestMatch = searchResults.find(r => !r.instrumental);
      if (!bestMatch && searchResults.length > 0) {
         bestMatch = searchResults[0]; 
      }
      
      if (!bestMatch) {
         console.log('LRCLIB: No suitable match found in search results.');
         return { lyricsId: null, sourceName: null, syncedLyrics: null, plainLyrics: null, instrumental: false, message: 'No suitable match found in search results.' };
      }

      if (bestMatch.instrumental) {
        console.log(`LRCLIB: Track identified as instrumental: ${bestMatch.name}`);
        return { lyricsId: bestMatch.id, sourceName: bestMatch.name, syncedLyrics: null, plainLyrics: null, instrumental: true, message: 'This track is instrumental.' };
      }
      
      const getUrl = `${LRCLIB_API_BASE}/get/${bestMatch.id}`;
      console.log(`LRCLIB Get URL: ${getUrl}`);
      const getResponse = await fetch(getUrl);

      if (!getResponse.ok) {
        const errorBody = await getResponse.text().catch(() => 'Could not read error body');
        console.error(`LRCLIB get API error: ${getResponse.status} ${getResponse.statusText}. Body: ${errorBody}`);
        return { lyricsId: bestMatch.id, sourceName: bestMatch.name, syncedLyrics: null, plainLyrics: null, instrumental: false, message: `Error fetching lyric details (${getResponse.status}): ${getResponse.statusText}. Details: ${errorBody}` };
      }

      let lyricDetails: LrclibGetResult;
      try {
        lyricDetails = await getResponse.json();
      } catch (jsonError: any) {
        const responseBody = await getResponse.text().catch(() => 'Could not read response body for JSON error debug');
        console.error(`LRCLIB get API JSON parsing error: ${jsonError.message}. Response body: ${responseBody}`);
        return { lyricsId: bestMatch.id, sourceName: bestMatch.name, syncedLyrics: null, plainLyrics: null, instrumental: false, message: `Error parsing lyric details: ${jsonError.message}` };
      }

      console.log('LRCLIB: Lyrics fetched successfully.');
      return {
        lyricsId: lyricDetails.id,
        sourceName: lyricDetails.name,
        syncedLyrics: lyricDetails.syncedLyrics || null,
        plainLyrics: lyricDetails.plainLyrics || null,
        instrumental: lyricDetails.instrumental || false,
        message: (lyricDetails.syncedLyrics || lyricDetails.plainLyrics) ? null : 'Lyrics found but content is empty.',
      };

    } catch (error: any) {
      console.error('Unhandled error in fetchLyricsFlow:', error, error.stack);
      return { lyricsId: null, sourceName: null, syncedLyrics: null, plainLyrics: null, instrumental: false, message: `An unexpected error occurred: ${error.message}` };
    }
  }
);
