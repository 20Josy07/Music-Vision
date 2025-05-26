

export const isTokenExpired = (expiresAt: number): boolean => {
  const buffer = 5 * 60 * 1000; 
  return Date.now() >= expiresAt - buffer;
};

export const storeToken = (token: string, expiresIn: number, refreshToken?: string): void => {
  localStorage.setItem('spotify_token', token);
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
  if (refreshToken) {
    localStorage.setItem('spotify_refresh_token', refreshToken);
    console.log('Spotify refresh token stored.');
  }
  console.log('Spotify access token stored. Expires in:', expiresIn, 'seconds. Expires at:', new Date(expiresAt).toLocaleString());
};

// Processes tokens if they are found in URL query parameters
// Returns true if tokens were found and processed, false otherwise.
export const processTokensFromUrlParams = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = searchParams.get('access_token');
  const expiresInStr = searchParams.get('expires_in');
  const refreshToken = searchParams.get('refresh_token'); // Optional
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Clear processed/error params from URL to keep it clean
  const paramsToRemove = ['access_token', 'expires_in', 'refresh_token', 'error', 'error_description', 'code', 'state'];
  let urlWasChanged = false;
  paramsToRemove.forEach(param => {
    if (searchParams.has(param)) {
      searchParams.delete(param);
      urlWasChanged = true;
    }
  });

  if (urlWasChanged) {
    const newSearch = searchParams.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    console.log('Auth-related URL query parameters cleared.');
  }
  
  if (error) {
    console.error(`Spotify authentication error in URL query params: ${error}`, errorDescription ? `Description: ${errorDescription}` : '(No error description provided)');
    return false; 
  }
  
  if (accessToken && expiresInStr) {
    const expiresIn = parseInt(expiresInStr, 10);
    if (!isNaN(expiresIn)) {
      storeToken(accessToken, expiresIn, refreshToken || undefined);
      console.log('Access token and expiry successfully processed from URL query parameters.');
      return true;
    } else {
      console.error('Invalid expires_in value in URL query parameters.');
    }
  }
  return false;
};


export const getStoredToken = (): string | null => {
  return localStorage.getItem('spotify_token');
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem('spotify_refresh_token');
};

export const getStoredTokenExpiry = (): number | null => {
  const expiryStr = localStorage.getItem('spotify_token_expires_at');
  return expiryStr ? parseInt(expiryStr, 10) : null;
};

export const clearStoredToken = (): void => {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_token_expires_at');
  localStorage.removeItem('spotify_refresh_token');
  console.log('Spotify tokens (access & refresh) cleared from localStorage.');
};
