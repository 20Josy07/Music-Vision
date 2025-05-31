
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
<<<<<<< HEAD
  isSpotifyTrack?: boolean; // Flag to indicate if the track is from Spotify
  isJamendoTrack?: boolean; // Flag for Jamendo tracks
  source?: 'spotify' | 'jamendo' | 'local'; // To differentiate track origins
  dataAiHint?: string; // For image generation hints
=======
  isSpotifyTrack?: boolean; // Flag for Spotify tracks
  isJamendoTrack?: boolean; // Flag for Jamendo tracks
  dataAiHint?: string;
  source?: 'spotify' | 'jamendo' | 'local'; // To better identify track origin
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  tracks: Track[];
  source?: 'spotify' | 'jamendo' | 'local';
  dataAiHint?: string;
  source?: 'spotify' | 'jamendo' | 'local';
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
<<<<<<< HEAD
  albums: Album[];
  source?: 'spotify' | 'jamendo' | 'local';
=======
  albums: Album[]; // Albums by this artist
  tracks?: Track[]; // Top tracks by this artist (optional)
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
  dataAiHint?: string;
  source?: 'spotify' | 'jamendo' | 'local';
}

export interface Playlist {
  id:string;
  name: string;
  description?: string;
  tracks: Track[];
<<<<<<< HEAD
  owner: string; // User ID or name
  artworkUrl?: string; // Optional: could be auto-generated from track artworks
  source?: 'spotify' | 'jamendo' | 'local';
=======
  owner: string;
  artworkUrl?: string;
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
  dataAiHint?: string;
  source?: 'spotify' | 'jamendo' | 'local';
}

export type RepeatMode = 'none' | 'one' | 'all' | 'off' | 'track' | 'context';

<<<<<<< HEAD
// --- Jamendo API Specific Types ---
export interface JamendoHeaders {
  status: string;
  code: number;
  error_message: string;
  warnings: string;
  results_count: number;
}

export interface JamendoApiResponse<T> {
  headers: JamendoHeaders;
  results: T[];
}

export interface JamendoTrack {
  id: string;
  name: string; // Track title
  duration: number; // in seconds
  artist_id: string;
  artist_name: string;
  artist_idstr: string;
  album_name: string; // Album title
  album_id: string;
  license_ccurl: string;
  position: number;
  releasedate: string;
  album_image: string; // URL to album image (various sizes might be available, this is often a good default)
  image: string; // Sometimes 'image' is used for track specific image if different from album
  audio: string; // URL to MP3 stream (usually 128kbps for free tier)
  audiodownload: string; // URL to MP3 download
  audiodownload_allowed: boolean;
  prourl: string;
  shorturl: string;
  shareurl: string;
  zip?: string; // Link to a zip if it's a full album download, usually on album object
  tags?: string[]; // Jamendo uses "vocalinstrumental", "genre", "vartags"
  // Add other fields as needed: stats (playcount, downloadcount), etc.
=======

// --- Jamendo API Specific Types (Simplified) ---
export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string; // URL to album image
  audio: string; // URL to MP3 audio file
  duration: number; // in seconds
  license_ccurl: string; // Creative Commons license URL
  // Add other fields as needed, e.g., tags, release_date
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
}

export interface JamendoAlbum {
  id: string;
<<<<<<< HEAD
  name: string; // Album title
  releasedate: string;
  artist_id: string;
  artist_name: string;
  image: string; // URL to album image
  zip: string; // URL to download album as zip
  shorturl: string;
  shareurl: string;
  // Potentially other fields like track count if API provides
=======
  name: string;
  artist_name: string;
  image: string; // URL to album image
  zip: string; // URL to download album zip
  // Add other fields as needed
}

export interface JamendoArtist {
  id: string;
  name: string;
  image: string; // URL to artist image
  // Add other fields as needed
}

export interface JamendoApiResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message?: string;
    warnings?: string;
    results_count: number;
  };
  results: T[];
>>>>>>> 375a56c323e19dd22d38310753b41f62af6a9bb0
}
