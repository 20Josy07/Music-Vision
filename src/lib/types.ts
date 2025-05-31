
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  artworkUrl: string;
  audioSrc?: string; // Mocked or actual URL for local playback
  spotifyUri?: string; // URI for Spotify playback
  isSpotifyTrack?: boolean; // Flag to indicate if the track is from Spotify
  isJamendoTrack?: boolean; // Flag for Jamendo tracks
  source?: 'spotify' | 'jamendo' | 'local'; // To differentiate track origins
  dataAiHint?: string; // For image generation hints
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  tracks: Track[];
  source?: 'spotify' | 'jamendo' | 'local';
  dataAiHint?: string;
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
  albums: Album[];
  source?: 'spotify' | 'jamendo' | 'local';
  dataAiHint?: string;
}

export interface Playlist {
  id:string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: string; // User ID or name
  artworkUrl?: string; // Optional: could be auto-generated from track artworks
  source?: 'spotify' | 'jamendo' | 'local';
  dataAiHint?: string;
}

export type RepeatMode = 'none' | 'one' | 'all' | 'off' | 'track' | 'context'; // Added Spotify's 'off', 'track', 'context'

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
}

export interface JamendoAlbum {
  id: string;
  name: string; // Album title
  releasedate: string;
  artist_id: string;
  artist_name: string;
  image: string; // URL to album image
  zip: string; // URL to download album as zip
  shorturl: string;
  shareurl: string;
  // Potentially other fields like track count if API provides
}
