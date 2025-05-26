
import type { NextApiRequest, NextApiResponse } from 'next';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { refresh_token: refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'Refresh token not provided or invalid.' });
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify environment variables (CLIENT_ID or CLIENT_SECRET) are not set for token refresh.');
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
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Spotify token refresh error:', tokenData);
      // If refresh fails (e.g. invalid refresh token), Spotify returns specific errors
      return res.status(tokenResponse.status).json({ 
        error: tokenData.error || 'token_refresh_failed', 
        error_description: tokenData.error_description || 'Failed to refresh token with Spotify.' 
      });
    }

    // Spotify may or may not return a new refresh_token. If it does, we should use it.
    // However, for simplicity here, we primarily care about the new access_token and expires_in.
    res.status(200).json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      // new_refresh_token: tokenData.refresh_token, // Client can decide if it wants to update this
    });

  } catch (e: any) {
    console.error('Exception during Spotify token refresh:', e);
    res.status(500).json({ error: 'Internal server error during token refresh.', error_description: e.message || '' });
  }
}
