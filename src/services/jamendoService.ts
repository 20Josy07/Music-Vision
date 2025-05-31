
'use server';

import type { Track, Album, JamendoTrack, JamendoAlbum, JamendoApiResponse } from '@/lib/types';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Helper function for placeholder artwork
const placeholderArtwork = (text: string) => `https://placehold.co/300x300/cccccc/969696.png?text=${encodeURIComponent(text)}`;

// --- Mapper Functions (not exported, used internally) ---
function mapJamendoTrackToAppTrack(jamendoTrack: JamendoTrack): Track {
  return {
    id: jamendoTrack.id,
    title: jamendoTrack.name,
    artist: jamendoTrack.artist_name,
    album: jamendoTrack.album_name || 'Unknown Album',
    duration: jamendoTrack.duration,
    artworkUrl: jamendoTrack.album_image || jamendoTrack.image || placeholderArtwork(jamendoTrack.name.substring(0, 2)),
    audioSrc: jamendoTrack.audio, // URL for streaming
    isJamendoTrack: true,
    isSpotifyTrack: false,
    source: 'jamendo',
    dataAiHint: `${jamendoTrack.name.substring(0, 10)} ${jamendoTrack.artist_name.substring(0, 10)}`.toLowerCase(),
  };
}

function mapJamendoAlbumToAppAlbum(jamendoAlbum: JamendoAlbum, tracks: Track[] = []): Album {
   // Jamendo API for albums doesn't directly embed full track list with audio URLs in a simple call.
   // We'd typically make another call to /albums/tracks with album_id to get tracks.
   // For now, we'll map album info and leave tracks empty or fill with mock if needed for UI.
   // If tracks are passed (e.g. from a dedicated album tracks fetch), use them.

  return {
    id: jamendoAlbum.id,
    title: jamendoAlbum.name,
    artist: jamendoAlbum.artist_name,
    artworkUrl: jamendoAlbum.image || placeholderArtwork(jamendoAlbum.name.substring(0, 2)),
    tracks: tracks, // Initially empty, could be populated by a subsequent call or if API provides some
    source: 'jamendo',
    dataAiHint: `${jamendoAlbum.name.substring(0, 10)} ${jamendoAlbum.artist_name.substring(0, 10)}`.toLowerCase(),
  };
}

// --- Core API Fetch Function ---
async function fetchFromJamendo<T>(endpoint: string, params: Record<string, string | number>): Promise<JamendoApiResponse<T>> {
  if (!JAMENDO_CLIENT_ID) {
    console.error("Jamendo Client ID is not configured.");
    throw new Error("Jamendo Client ID is not configured.");
  }

  const queryParams = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json', // Use 'jsonpretty' for debugging if needed
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  });

  const url = `${JAMENDO_API_BASE}${endpoint}?${queryParams.toString()}`;
  console.log(`Fetching from Jamendo: ${url}`);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Jamendo API error: ${response.status} ${response.statusText}. URL: ${url}. Body: ${errorBody}`);
      throw new Error(`Jamendo API request failed with status ${response.status}: ${errorBody}`);
    }
    const data: JamendoApiResponse<T> = await response.json();
    if (data.headers.status !== 'success') {
      console.error('Jamendo API returned an error status:', data.headers);
      // Consider throwing a more specific error or handling different error codes
      throw new Error(`Jamendo API error: ${data.headers.error_message || 'Unknown API error'}`);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching data from Jamendo endpoint ${endpoint}:`, error);
    throw error; // Re-throw to be caught by calling function
  }
}


// --- Service Functions ---
export async function getPopularJamendoTracks(limit: number = 20): Promise<Track[]> {
  try {
    const data = await fetchFromJamendo<JamendoTrack>('/tracks/', {
      limit,
      order: 'popularity_month', // Get tracks popular this month
      // imagesize: 400, // Request a specific image size if needed
    });
    return data.results.map(mapJamendoTrackToAppTrack);
  } catch (error) {
    console.error("Failed to get popular Jamendo tracks:", error);
    return []; // Return empty array on failure
  }
}

export async function getNewReleaseJamendoAlbums(limit: number = 12): Promise<Album[]> {
   try {
    const data = await fetchFromJamendo<JamendoAlbum>('/albums/', {
      limit,
      order: 'releasedate_desc', // Get newest albums
      // imagesize: 400, // Request a specific image size
    });
    // For each album, we might want to fetch its tracks.
    // This can be slow if done for many albums. For now, just map album info.
    const albums = data.results.map(album => mapJamendoAlbumToAppAlbum(album));
    
    // Optional: Fetch a few tracks for the first few albums to make them playable from browse
    // This is a simplification; a real app might do this on album detail page or more selectively.
    for (let i = 0; i < Math.min(albums.length, 3); i++) {
        try {
            const tracksData = await fetchFromJamendo<JamendoTrack>('/tracks/', {
                album_id: albums[i].id,
                limit: 5, // Fetch up to 5 tracks for this album
            });
            albums[i].tracks = tracksData.results.map(mapJamendoTrackToAppTrack);
        } catch (trackError) {
            console.warn(`Could not fetch tracks for album ${albums[i].title}:`, trackError);
            // Keep album in list, just without tracks
        }
    }
    return albums;

  } catch (error) {
    console.error("Failed to get new release Jamendo albums:", error);
    return [];
  }
}

export async function searchJamendoTracks(query: string, limit: number = 20): Promise<Track[]> {
  if (!query.trim()) return [];
  try {
    const data = await fetchFromJamendo<JamendoTrack>('/tracks/', {
      limit,
      search: query, // Use 'search' parameter for general search
      // namesearch: query, // Use 'namesearch' for track title specific search
      // artist_name: query, // for artist specific
      order: 'popularity_total',
      // imagesize: 400,
    });
    return data.results.map(mapJamendoTrackToAppTrack);
  } catch (error) {
    console.error(`Failed to search Jamendo tracks for query "${query}":`, error);
    return [];
  }
}

export async function getJamendoAlbumTracks(albumId: string, limit: number = 50): Promise<Track[]> {
  try {
    const data = await fetchFromJamendo<JamendoTrack>('/tracks/', {
      album_id: albumId,
      limit,
      order: 'track_position', // Ensure tracks are in album order
    });
    return data.results.map(mapJamendoTrackToAppTrack);
  } catch (error) {
    console.error(`Failed to get tracks for Jamendo album ID "${albumId}":`, error);
    return [];
  }
}
