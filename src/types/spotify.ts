
export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtistSummary { // Renamed to avoid conflict if more detailed artist type is needed
  id: string;
  name: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbumSummary { // Renamed for clarity
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  album_type?: string; // Optional: sometimes useful
  artists?: SpotifyArtistSummary[]; // Albums can also have artists
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
  uri: string; // Often needed for playback commands
  explicit?: boolean;
}

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

export interface SpotifyContext {
  type: string;
  href: string;
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyPlaybackActions {
  interrupting_playback?: boolean;
  pausing?: boolean;
  resuming?: boolean;
  seeking?: boolean;
  skipping_next?: boolean;
  skipping_prev?: boolean;
  toggling_repeat_context?: boolean;
  toggling_shuffle?: boolean;
  toggling_repeat_track?: boolean;
  transferring_playback?: boolean;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context: SpotifyContext | null;
  timestamp: number;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyTrackItem | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    disallows: SpotifyPlaybackActions;
  };
}
