
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
  dataAiHint?: string; // For image generation hints
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  tracks: Track[];
  dataAiHint?: string;
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl: string;
  albums: Album[];
  dataAiHint?: string;
}

export interface Playlist {
  id:string;
  name: string;
  description?: string;
  tracks: Track[];
  owner: string; // User ID or name
  artworkUrl?: string; // Optional: could be auto-generated from track artworks
  dataAiHint?: string;
}

export type RepeatMode = 'none' | 'one' | 'all' | 'off' | 'track' | 'context'; // Added Spotify's 'off', 'track', 'context'

