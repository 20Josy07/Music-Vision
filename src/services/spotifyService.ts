
import { spotifyApi, callSpotifyApi } from './spotify'; // Import the configured spotifyApi instance
import type { SpotifyTrackItem } from '@/types/spotify';

// No hardcoded token needed here anymore.

export async function getMyTopTracks(options?: SpotifyApi.UsersTopTracksOptions): Promise<SpotifyTrackItem[]> {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  try {
    // Ensure options is an object, default if not provided
    const requestOptions = options || { time_range: 'long_term', limit: 5 };
    const response = await callSpotifyApi(() => spotifyApi.getMyTopTracks(requestOptions));
    return (response?.items || []) as SpotifyTrackItem[]; // spotify-web-api-js types might be slightly different, cast if necessary
  } catch (error) {
    // Error is already logged by callSpotifyApi, but can re-log or re-throw if needed
    console.error("Failed to fetch top Spotify tracks in spotifyService:", error);
    return []; // Return empty array on error to prevent UI crashes
  }
}

// You can add more specific service functions here, e.g.:
// export async function searchTracks(query: string, options?: SpotifyApi.SearchForItemParameterObject) {
//   try {
//     const response = await callSpotifyApi(() => spotifyApi.searchTracks(query, options));
//     return response?.tracks?.items || [];
//   } catch (error) {
//     console.error("Failed to search Spotify tracks:", error);
//     return [];
//   }
// }

