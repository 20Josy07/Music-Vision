
import SpotifyWebApi from 'spotify-web-api-js';
import { 
  processTokensFromUrlParams, 
  isTokenExpired, 
  getStoredToken, 
  getStoredTokenExpiry, 
  clearStoredToken, 
  storeToken,
  getStoredRefreshToken
} from './authHelpers';
import type { SpotifyPlaybackState, SpotifyUser, SpotifyDevice } from '@/types/spotify';

const spotifyApi = new SpotifyWebApi();

const CLIENT_ID = '39a30a2429d64fd196f2cb003ce75e21'; // This is public
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming', 
];

let isRefreshingToken = false; // Simple flag to prevent multiple refresh attempts

const getConstructedRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${appBaseUrl}/api/spotify/exchange-code`;
  }
  // Fallback for server-side or build-time if needed, though primarily used client-side
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  return `${appBaseUrl}/api/spotify/exchange-code`;
};

export const getLoginUrl = (): string => {
  const constructedRedirectUri = getConstructedRedirectUri();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: constructedRedirectUri,
    scope: SCOPES.join(' '),
    response_type: 'code',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshingToken) {
    console.log("Token refresh already in progress.");
    return false; // Or await a promise that resolves when the current refresh is done
  }
  isRefreshingToken = true;

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    console.log('No refresh token available. Cannot refresh.');
    isRefreshingToken = false;
    return false;
  }

  console.log('Attempting to refresh Spotify access token...');
  try {
    const response = await fetch('/api/spotify/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to refresh token:', data.error, data.error_description);
      // If refresh token is invalid (e.g., revoked), Spotify might return specific errors.
      // In such cases, we should clear all tokens as re-authentication is needed.
      if (response.status === 400 && (data.error === 'invalid_grant' || data.error === 'invalid_request')) {
        console.log('Refresh token is invalid or expired. Clearing all tokens.');
        logoutSpotify(); // This clears all tokens
      }
      isRefreshingToken = false;
      return false;
    }

    storeToken(data.access_token, data.expires_in); // Spotify might also return a new refresh_token
    spotifyApi.setAccessToken(data.access_token);
    console.log('Spotify access token refreshed successfully.');
    isRefreshingToken = false;
    return true;
  } catch (error) {
    console.error('Exception during token refresh request:', error);
    isRefreshingToken = false;
    return false;
  }
}


export const checkAndSetupToken = async (attemptRefresh = true): Promise<boolean> => {
  const processedFromUrl = processTokensFromUrlParams(); 
  if (processedFromUrl) {
    const token = getStoredToken();
    if (token) {
        spotifyApi.setAccessToken(token);
        console.log('Access token set up from URL parameters (via backend redirect).');
        return true;
    }
  }

  const storedToken = getStoredToken();
  const expiresAt = getStoredTokenExpiry();

  if (storedToken && expiresAt && !isTokenExpired(expiresAt)) {
    spotifyApi.setAccessToken(storedToken);
    console.log('Valid access token found in localStorage and set up for API client.');
    return true;
  } else if (storedToken && expiresAt && isTokenExpired(expiresAt)) {
    console.log('Spotify access token from localStorage is expired.');
    if (attemptRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return true; // Token was refreshed and set
      } else {
        // Refresh failed, or no refresh token. Token remains expired.
        // If refreshAccessToken itself didn't clear tokens on fatal error, clear them here.
        if (!getStoredToken()) { // Check if refreshAccessToken cleared them
             spotifyApi.setAccessToken(null); // Ensure API client token is cleared
        } else { // If tokens are still there but refresh failed (e.g. network issue)
            console.log("Token refresh failed, but old tokens might still be present (though expired).")
            // Depending on policy, could clear them here too:
            // clearStoredToken(); 
            // spotifyApi.setAccessToken(null);
        }
        return false; // Indicate that setup failed due to expired token and failed refresh
      }
    } else {
      // Not attempting refresh, token is expired.
      console.log("Token expired, not attempting refresh as per parameter.");
      spotifyApi.setAccessToken(null); // Ensure client doesn't use expired token
      return false;
    }
  } else if (!storedToken) {
    console.log("No Spotify token found in localStorage.");
  }
  
  spotifyApi.setAccessToken(null); // Default to no token if no valid one is found/set up
  return false;
};

export const logoutSpotify = (): void => {
  clearStoredToken();
  spotifyApi.setAccessToken(null);
  console.log('Logged out from Spotify, token cleared.');
   if (typeof window !== 'undefined' && window.location.pathname.startsWith('/settings')) {
     const cleanUrl = window.location.origin + window.location.pathname;
     window.history.replaceState({}, document.title, cleanUrl);
  }
};

export async function callSpotifyApi<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    if (!spotifyApi.getAccessToken()) {
      console.log("No access token in spotifyApi client. Attempting checkAndSetupToken.");
      const tokenIsValid = await checkAndSetupToken(true); // Attempt refresh if needed
      if (!tokenIsValid || !spotifyApi.getAccessToken()) {
         console.error("Spotify access token is not available after re-check and potential refresh. User might need to re-authenticate.");
         // This could trigger a UI change to prompt for re-login
         return null; 
      }
    } else {
      // Token exists in API client, check if it's about to expire and try refreshing proactively
      const expiresAt = getStoredTokenExpiry();
      if (expiresAt && isTokenExpired(expiresAt)) {
        console.log("Access token in API client is expired. Attempting proactive refresh.");
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          console.error("Proactive token refresh failed. API call might fail or use an expired token.");
          // If refresh failed and tokens were cleared, spotifyApi.getAccessToken() would be null
          if (!spotifyApi.getAccessToken()){
             console.error("Tokens cleared after failed refresh. API call will likely fail authentication.");
             return null; // Cannot proceed
          }
        }
      }
    }
    return await apiCall();
  } catch (error: any) {
    let errorData = error;
    // Try to parse if error is a stringified JSON (common from Spotify API errors)
    if (typeof error === 'string') { try { errorData = JSON.parse(error); } catch (e) { /* ignore parsing error */ } }
    
    const status = typeof errorData === 'object' && errorData !== null && ('status' in errorData || 'statusCode' in errorData) 
                   ? (errorData as any).status || (errorData as any).statusCode 
                   : null; // Default to null if status can't be determined

    if (status === 401) { 
      console.error(`Spotify API call failed with 401 (Unauthorized). Token might be invalid or expired. Attempting refresh.`);
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        console.log("Token refreshed successfully after 401. Retrying API call.");
        return await apiCall(); // Retry the original call with the new token
      } else {
        console.error("Token refresh failed after 401. Clearing tokens. User needs to re-authenticate.");
        logoutSpotify(); // Clears tokens and sets API client token to null
        // Notify PlayerContext or similar to update isSpotifyConnected
        // This might involve a custom event or a more direct state update mechanism
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('spotifyAuthError'));
        }
        return null; // Indicate failure
      }
    } else if (status === 403) {
        console.error(`Spotify API call failed with 403 (Forbidden). Insufficient scope or other permission issue.`, errorData);
        // For 403, refreshing token usually doesn't help. User might need to re-authorize with correct scopes.
    } else {
      console.error('Spotify API call error (non-401/403):', errorData);
    }
    return null;
  }
}

// API wrappers
export const getMyProfile = async (): Promise<SpotifyUser | null> => {
  return callSpotifyApi(() => spotifyApi.getMe());
};

export const getCurrentPlaybackState = async (): Promise<SpotifyPlaybackState | null> => {
  return callSpotifyApi<SpotifyPlaybackState>(() => spotifyApi.getMyCurrentPlaybackState());
};

export const getMyDevices = async (): Promise<SpotifyDevice[]> => {
  const response = await callSpotifyApi(() => spotifyApi.getMyDevices());
  return response?.devices || [];
};

export const play = async (options?: SpotifyApi.PlayParameterObject) => {
  return callSpotifyApi(() => spotifyApi.play(options));
};

export const pausePlayback = async (options?: SpotifyApi.PauseParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.pause(options));
};

export const resumePlayback = async (options?: SpotifyApi.PlayParameterObject) => {
  return callSpotifyApi(() => spotifyApi.play(options));
};

export const skipToNextTrack = async (options?: SpotifyApi.SkipToNextParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.skipToNext(options));
};

export const skipToPreviousTrack = async (options?: SpotifyApi.SkipToPreviousParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.skipToPrevious(options));
};

export const setSpotifyVolume = async (volumePercent: number, options?: SpotifyApi.SetVolumeParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.setVolume(volumePercent, options));
};

export const seekToPosition = async (positionMs: number, options?: SpotifyApi.SeekParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.seek(positionMs, options));
};

export const setShuffle = async (state: boolean, options?: SpotifyApi.SetShuffleParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.setShuffle(state, options));
};

export const setRepeat = async (state: 'track' | 'context' | 'off', options?: SpotifyApi.SetRepeatParameterObject) => { 
  return callSpotifyApi(() => spotifyApi.setRepeat(state, options));
};


export { spotifyApi };
