
"use client";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Music, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl, checkAndSetupToken, logoutSpotify, getMyProfile } from '@/services/spotify';
import type { SpotifyUser } from '@/types/spotify'; // Make sure this path is correct

type MusicSource = "spotify" | "appleMusic" | "tidal" | "local";

export default function SettingsPage() {
  const [selectedSource, setSelectedSource] = useState<MusicSource>("local");
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const [isLoadingSpotifyAuth, setIsLoadingSpotifyAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSpotifyAuth = async () => {
      setIsLoadingSpotifyAuth(true);
      setAuthError(null); // Clear previous errors

      // Check for error query params from backend redirect
      const searchParams = new URLSearchParams(window.location.search);
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setAuthError(`Spotify Auth Error: ${error}. ${errorDescription || ''}`);
        // Clean URL params after displaying error
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      // checkAndSetupToken will process tokens from URL (if backend redirected with them)
      // or from localStorage. It also stores them if processed from URL.
      const authenticated = checkAndSetupToken();
      setIsSpotifyAuthenticated(authenticated);

      if (authenticated) {
        setSelectedSource("spotify");
        try {
          const profile = await getMyProfile();
          if (profile) {
            setSpotifyUser(profile);
          } else {
            // This might happen if token is valid but profile fetch fails (e.g. scope issue)
            setAuthError("Connected to Spotify, but failed to fetch profile.");
            // Potentially logout or clear token if profile is essential
            // logoutSpotify();
            // setIsSpotifyAuthenticated(false);
          }
        } catch (e) {
          console.error("Error fetching profile after auth:", e);
          setAuthError("Error fetching Spotify profile.");
        }
      }
      setIsLoadingSpotifyAuth(false);
    };
    initializeSpotifyAuth();
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleSpotifyLogout = () => {
    logoutSpotify();
    setIsSpotifyAuthenticated(false);
    setSpotifyUser(null);
    setSelectedSource("local"); 
    setAuthError(null); // Clear any auth errors on logout
  };

  const handleSourceChange = (value: MusicSource) => {
    setSelectedSource(value);
    // No automatic login attempt here; user must click "Connect Spotify"
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" /> Theme Settings</CardTitle>
          <CardDescription>Customize the appearance of MusicVerse.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="theme-toggle-label" className="text-base">Appearance</Label>
          <div className="flex items-center gap-2">
            <span id="theme-toggle-label" className="text-sm text-muted-foreground">Switch between light and dark mode.</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Music className="mr-2 h-5 w-5 text-primary" /> Music Source</CardTitle>
          <CardDescription>Connect your preferred music streaming service or use local files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <p>{authError}</p>
            </div>
          )}
          {isLoadingSpotifyAuth ? (
            <p className="text-muted-foreground">Checking Spotify connection...</p>
          ) : (
            <RadioGroup value={selectedSource} onValueChange={handleSourceChange} className="space-y-2">
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spotify" id="spotify" />
                  <Label htmlFor="spotify" className="text-base font-medium">Spotify</Label>
                </div>
                {/* UI for Spotify connection status and actions */}
                <div className="mt-2 ml-6 space-y-2">
                  {isSpotifyAuthenticated ? (
                    <>
                      {spotifyUser && <p className="text-sm text-foreground">Connected as: {spotifyUser.display_name || spotifyUser.email}</p>}
                      <Button onClick={handleSpotifyLogout} variant="outline" size="sm">
                        <LogOut className="mr-2 h-4 w-4"/> Disconnect Spotify
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleSpotifyLogin} variant="primary" size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <LogIn className="mr-2 h-4 w-4"/> Connect Spotify
                    </Button>
                  )}
                </div>
              </div>
              {/* Placeholders for other services */}
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="appleMusic" id="appleMusic" disabled />
                  <Label htmlFor="appleMusic" className="text-base font-medium text-muted-foreground/50">Apple Music (Coming Soon)</Label>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tidal" id="tidal" disabled />
                  <Label htmlFor="tidal" className="text-base font-medium text-muted-foreground/50">Tidal (Coming Soon)</Label>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" checked={selectedSource === "local"} />
                  <Label htmlFor="local" className="text-base font-medium">Local Files (Mocked)</Label>
                </div>
                 {selectedSource === "local" && (
                  <p className="text-sm text-muted-foreground mt-1 ml-6">Using placeholder local music.</p>
                )}
              </div>
            </RadioGroup>
          )}
          <p className="text-xs text-muted-foreground pt-4 border-t">
            Spotify integration uses the Authorization Code Flow. Your data is handled according to Spotify's privacy policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Offline Mode</CardTitle>
          <CardDescription>Manage downloaded music for offline playback. (Conceptual)</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Offline mode features are planned but not yet available.</p>
            <Button disabled className="mt-4">Manage Downloads</Button>
        </CardContent>
      </Card>
    </div>
  );
}
