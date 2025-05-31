
'use server';
<<<<<<< HEAD

import type { Track, Album, JamendoTrack, JamendoAlbum, JamendoApiResponse } from '@/lib/types';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Helper function for placeholder artwork
const placeholderArtwork = (text: string) => `https://placehold.co/300x300/cccccc/969696.png?text=${encodeURIComponent(text)}`;

// --- Mapper Functions (not exported, used internally) ---
=======
/**
 * @fileOverview Service for interacting with the Jamendo API.
 * Currently uses mock data. Replace with actual API calls when a client_id is available.
 */

import type { Track, Album, JamendoTrack, JamendoAlbum, JamendoApiResponse } from '@/lib/types';

// TODO: Replace with your actual Jamendo Client ID, ideally from .env
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'YOUR_JAMENDO_CLIENT_ID';
const JAMENDO_API_BASE_URL = 'https://api.jamendo.com/v3.0';

const placeholderArtwork = (text: string) => `https://placehold.co/300x300/5A67D8/FFFFFF.png?text=${encodeURIComponent(text)}`;
const placeholderAudio = "/audio/synthwave-nostalgia.mp3"; // Use existing mock audio

// --- Mock Data ---
const mockJamendoTracks: JamendoTrack[] = [
  { id: 'jam_track_1', name: 'Electro Dreams', artist_name: 'Digital Nomad', album_name: 'Cyber Beats', album_image: placeholderArtwork('ED'), audio: placeholderAudio, duration: 180, license_ccurl: '' },
  { id: 'jam_track_2', name: 'Acoustic Sunrise', artist_name: 'Morning Dew', album_name: 'Quiet Moments', album_image: placeholderArtwork('AS'), audio: placeholderAudio, duration: 210, license_ccurl: '' },
  { id: 'jam_track_3', name: 'Rock Anthem', artist_name: 'Voltage', album_name: 'High Energy', album_image: placeholderArtwork('RA'), audio: placeholderAudio, duration: 240, license_ccurl: '' },
  { id: 'jam_track_4', name: 'Ambient Journey', artist_name: 'Ethereal Soundscapes', album_name: 'Mind Travel', album_image: placeholderArtwork('AJ'), audio: placeholderAudio, duration: 300, license_ccurl: '' },
  { id: 'jam_track_5', name: 'Funky Groove', artist_name: 'The Beatmasters', album_name: 'Get Down', album_image: placeholderArtwork('FG'), audio: placeholderAudio, duration: 190, license_ccurl: '' },
  { id: 'jam_track_6', name: 'Classical Interlude', artist_name: 'Orchestra Nova', album_name: 'Timeless Pieces', album_image: placeholderArtwork('CI'), audio: placeholderAudio, duration: 220, license_ccurl: '' },
];

const mockJamendoAlbums: JamendoAlbum[] = [
  { id: 'jam_album_1', name: 'Future Sounds', artist_name: 'Synth Pilot', image: placeholderArtwork('FS'), zip: '' },
  { id: 'jam_album_2', name: 'Chill Cafe', artist_name: 'Coffee Beats', image: placeholderArtwork('CC'), zip: '' },
  { id: 'jam_album_3', name: 'Indie Waves', artist_name: 'The Undercurrents', image: placeholderArtwork('IW'), zip: '' },
  { id: 'jam_album_4', name: 'Global Rhythms', artist_name: 'World Fusion Collective', image: placeholderArtwork('GR'), zip: '' },
  { id: 'jam_album_5', name: 'Piano Dreams', artist_name: 'Lucid Notes', image: placeholderArtwork('PD'), zip: '' },
  { id: 'jam_album_6', name: 'Epic Soundtracks', artist_name: 'Cinema Scape', image: placeholderArtwork('ES'), zip: '' },
];

// --- Mapper Functions ---
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
function mapJamendoTrackToAppTrack(jamendoTrack: JamendoTrack): Track {
  return {
    id: jamendoTrack.id,
    title: jamendoTrack.name,
    artist: jamendoTrack.artist_name,
<<<<<<< HEAD
    album: jamendoTrack.album_name || 'Unknown Album',
    duration: jamendoTrack.duration,
    artworkUrl: jamendoTrack.album_image || jamendoTrack.image || placeholderArtwork(jamendoTrack.name.substring(0, 2)),
    audioSrc: jamendoTrack.audio, // URL for streaming
    isJamendoTrack: true,
    isSpotifyTrack: false,
    source: 'jamendo',
    dataAiHint: `${jamendoTrack.name.substring(0, 10)} ${jamendoTrack.artist_name.substring(0, 10)}`.toLowerCase(),
=======
    album: jamendoTrack.album_name,
    duration: jamendoTrack.duration,
    artworkUrl: jamendoTrack.album_image || placeholderArtwork(jamendoTrack.name.substring(0,2)),
    audioSrc: jamendoTrack.audio,
    isJamendoTrack: true,
    isSpotifyTrack: false,
    source: 'jamendo',
    dataAiHint: `${jamendoTrack.name.substring(0,10)} ${jamendoTrack.artist_name.substring(0,10)}`.toLowerCase(),
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
  };
}

function mapJamendoAlbumToAppAlbum(jamendoAlbum: JamendoAlbum, tracks: Track[] = []): Album {
<<<<<<< HEAD
   // Jamendo API for albums doesn't directly embed full track list with audio URLs in a simple call.
   // We'd typically make another call to /albums/tracks with album_id to get tracks.
   // For now, we'll map album info and leave tracks empty or fill with mock if needed for UI.
   // If tracks are passed (e.g. from a dedicated album tracks fetch), use them.
=======
  // In a real scenario, you'd fetch tracks for this album
  const mockTracksForAlbum = mockJamendoTracks
    .slice(0, 2) // take first 2 mock tracks for this album for now
    .map(jt => ({...mapJamendoTrackToAppTrack(jt), album: jamendoAlbum.name, artworkUrl: jamendoAlbum.image }));
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0

  return {
    id: jamendoAlbum.id,
    title: jamendoAlbum.name,
    artist: jamendoAlbum.artist_name,
<<<<<<< HEAD
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
=======
    artworkUrl: jamendoAlbum.image || placeholderArtwork(jamendoAlbum.name.substring(0,2)),
    tracks: tracks.length > 0 ? tracks : mockTracksForAlbum, // Use provided tracks or mock
    source: 'jamendo',
    dataAiHint: `${jamendoAlbum.name.substring(0,10)} ${jamendoAlbum.artist_name.substring(0,10)}`.toLowerCase(),
  };
}

// --- Mock API Service Functions ---

/**
 * Fetches popular tracks from Jamendo (mocked).
 * In a real implementation, this would call:
 * `${JAMENDO_API_BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&order=popularity_week`
 */
export async function getPopularJamendoTracks(limit: number = 6): Promise<Track[]> {
  console.log(`jamendoService: Fetching ${limit} popular Jamendo tracks (mocked)`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // To make it dynamic, let's shuffle and slice mock tracks
  const shuffled = [...mockJamendoTracks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit).map(mapJamendoTrackToAppTrack);
}

/**
 * Fetches new release albums from Jamendo (mocked).
 * In a real implementation, this would call:
 * `${JAMENDO_API_BASE_URL}/albums/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&order=releasedate_desc`
 */
export async function getNewReleaseJamendoAlbums(limit: number = 6): Promise<Album[]> {
  console.log(`jamendoService: Fetching ${limit} new release Jamendo albums (mocked)`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const shuffled = [...mockJamendoAlbums].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit).map(album => mapJamendoAlbumToAppAlbum(album));
}

/**
 * Searches tracks on Jamendo (mocked).
 * Real API: `${JAMENDO_API_BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&search=${encodeURIComponent(query)}`
 */
export async function searchJamendoTracks(query: string, limit: number = 10): Promise<Track[]> {
  console.log(`jamendoService: Searching Jamendo tracks for "${query}" (mocked)`);
  await new Promise(resolve => setTimeout(resolve, 300));
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return mockJamendoTracks
    .filter(track => 
      track.name.toLowerCase().includes(lowerQuery) || 
      track.artist_name.toLowerCase().includes(lowerQuery) ||
      track.album_name.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
    .map(mapJamendoTrackToAppTrack);
}

// --- Helper for actual API calls (when client_id is available) ---
async function fetchFromJamendo<T>(endpoint: string, params: Record<string, string> = {}): Promise<JamendoApiResponse<T> | null> {
  if (JAMENDO_CLIENT_ID === 'YOUR_JAMENDO_CLIENT_ID') {
    console.warn('Jamendo API calls are mocked. Please provide a valid JAMENDO_CLIENT_ID.');
    // Return a mock error or empty response structure if needed by calling code
    return null; 
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
  }

  const queryParams = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
<<<<<<< HEAD
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
=======
    format: 'json',
    ...params,
  });

  const url = `${JAMENDO_API_BASE_URL}/${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Jamendo API error: ${response.status} ${response.statusText}`, await response.text());
      return null;
    }
    const data: JamendoApiResponse<T> = await response.json();
    if (data.headers.status !== 'success') {
      console.error('Jamendo API call not successful:', data.headers.error_message || data.headers.warnings);
      return data; // Still return data so caller can see error_message
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch from Jamendo API:', error);
    return null;
  }
}

>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
