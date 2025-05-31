
export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtistSummary {
  id: string;
  name: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbumSummary {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  album_type?: string;
  artists?: SpotifyArtistSummary[];
}

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artists: SpotifyArtistSummary[];
  album: SpotifyAlbumSummary;
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  popularity: number;
  uri: string;
  explicit?: boolean;
}

// --- App Specific Types ---
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artworkUrl: string;
  audioSrc?: string; // Direct URL for Howler.js or local playback
  spotifyUri?: string; // URI for Spotify playback
  isSpotifyTrack?: boolean; // Flag for Spotify tracks
  dataAiHint?: string;
  source?: 'spotify' | 'local'; // To better identify track origin
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  tracks: Track[];
  dataAiHint?: string;
  source?: 'spotify' | 'local';
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
  albums: Album[]; // Albums by this artist
  tracks?: Track[]; // Top tracks by this artist (optional)
  dataAiHint?: string;
  source?: 'spotify' | 'local';
}

export interface Playlist {
  id:string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: string;
  artworkUrl?: string;
  dataAiHint?: string;
  source?: 'spotify' | 'local';
}

export type RepeatMode = 'none' | 'one' | 'all' | 'off' | 'track' | 'context';
