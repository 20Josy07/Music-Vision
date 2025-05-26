
import type { NextApiRequest, NextApiResponse } from 'next';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL; // Used for redirect_uri consistency

// This is the Redirect URI that was registered in Spotify Developer Dashboard
// and also sent in the initial authorization request.
// It must point to this backend API route.
const REDIRECT_URI = `${APP_URL}/api/spotify/exchange-code`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code, error, state } = req.query;

  if (error) {
    console.error('Spotify callback error:', error);
    // Redirect to an error page or back to settings with an error query param
    return res.redirect(`/settings?error=${encodeURIComponent(error as string)}`);
  }

  if (!code || typeof code !== 'string') {
    console.error('Spotify callback: No authorization code provided.');
    return res.redirect('/settings?error=no_code_provided');
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify environment variables (CLIENT_ID or CLIENT_SECRET) are not set.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI, // Must match the redirect_uri used in the authorization request
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Spotify token exchange error:', tokenData);
      return res.redirect(`/settings?error=${encodeURIComponent(tokenData.error || 'token_exchange_failed')}&error_description=${encodeURIComponent(tokenData.error_description || '')}`);
    }

    const { access_token, expires_in, refresh_token } = tokenData;

    // Redirect user back to the settings page with tokens in query parameters
    // The client-side will pick these up, store them, and update the UI.
    const queryParams = new URLSearchParams({
      access_token,
      expires_in: expires_in.toString(),
    });
    if (refresh_token) {
      queryParams.append('refresh_token', refresh_token);
    }
    // TODO: Consider passing 'state' back if it was used and needs verification

    console.log('Spotify token exchange successful. Redirecting to /settings with tokens.');
    res.redirect(`/settings?${queryParams.toString()}`);

  } catch (e: any) {
    console.error('Exception during Spotify token exchange:', e);
    res.redirect(`/settings?error=internal_server_error&error_description=${encodeURIComponent(e.message || '')}`);
  }
}
