
# 🎵 MusicVerse

MusicVerse is a modern music streaming application designed to provide a seamless and enjoyable listening experience. Explore a universe of music, create playlists, and dive deep into lyrics with AI-powered features.

## ✨ Features

*   **Browse & Discover**: Explore various music categories, new releases, and popular playlists.
*   **Personal Library**: Manage your own collections of playlists, favorite songs, albums, and artists.
*   **Spotify Integration**:
    *   Connect your Spotify account to stream your music.
    *   View your top Spotify tracks directly in the app.
    *   Playback control (play, pause, skip, volume, shuffle, repeat) synchronized with your Spotify devices.
*   **Lyrics Display**:
    *   View synchronized (LRC) or plain lyrics for the currently playing song.
    *   Lyrics fetched from LRCLIB.
*   **Playback Queue**: Manage your upcoming tracks.
*   **Full-Screen Player**: Immersive player experience with dynamic blurred artwork background and lyrics.
*   **Responsive Design**: Enjoy a consistent experience across desktop and mobile devices.
*   **Light & Dark Mode**: Choose your preferred theme.
*   **(Conceptual) AI Features**: Built with Genkit, ready for future AI-powered music discovery and interaction enhancements.

## 🛠️ Tech Stack

*   **Frontend**:
    *   [Next.js](https://nextjs.org/) (App Router, Server Components)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
*   **UI**:
    *   [ShadCN UI](https://ui.shadcn.com/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Lucide React](https://lucide.dev/) (for icons)
*   **State Management**: React Context API
*   **AI**: [Genkit (Firebase)](https://firebase.google.com/docs/genkit)
*   **External APIs**:
    *   [Spotify Web API](https://developer.spotify.com/documentation/web-api)
    *   [LRCLIB API](https://lrclib.net/docs) (for lyrics)

## 🚀 Try it Out!

Experience MusicVerse live:

**[https://music-vision.netlify.app/](https://music-vision.netlify.app/)**

## Getting Started (Development)

This project was bootstrapped in Firebase Studio.

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Spotify API Client ID and Client Secret:
    ```env
    SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
    SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET
    NEXT_PUBLIC_APP_URL=http://localhost:9002 # Or your deployment URL for Spotify redirects
    ```
    *Note: `NEXT_PUBLIC_APP_URL` is crucial for Spotify's OAuth redirect URIs. Make sure it matches the URL you're running the app on during development (e.g., `http://localhost:9002`) and the one configured in your Spotify Developer Dashboard for the backend API redirect (`${NEXT_PUBLIC_APP_URL}/api/spotify/exchange-code`).*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application, typically on port 9002.

5.  **(Optional) Run Genkit development server (for AI flows):**
    If you are working with or testing Genkit AI flows:
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```

Open [http://localhost:9002](http://localhost:9002) (or the port specified in your `dev` script) with your browser to see the result.
You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
