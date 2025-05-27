
"use client";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Music, LogIn, LogOut, Upload, Download } from "lucide-react"; // Added Upload, Download
import { useState, useEffect } from "react";
import { getLoginUrl, checkAndSetupToken, logoutSpotify, getMyProfile } from '@/services/spotify';
import type { SpotifyUser } from '@/types/spotify';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SpotifyIcon } from "@/components/common/SpotifyIcon";


type MusicSource = "spotify" | "appleMusic" | "tidal" | "local";

export default function SettingsPage() {
  const [selectedSource, setSelectedSource] = useState<MusicSource>("local");
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const [isLoadingSpotifyAuth, setIsLoadingSpotifyAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);
  const [gaplessPlayback, setGaplessPlayback] = useState(false);
  const [enableAIRecommendations, setEnableAIRecommendations] = useState(false);


  useEffect(() => {
    const initializeSpotifyAuth = async () => {
      setIsLoadingSpotifyAuth(true);
      setAuthError(null); 

      const searchParams = new URLSearchParams(window.location.search);
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setAuthError(`Spotify Auth Error: ${error}. ${errorDescription || ''}`);
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      const authenticated = await checkAndSetupToken(); // Ensures token is valid or refreshed
      setIsSpotifyAuthenticated(authenticated);

      if (authenticated) {
        setSelectedSource("spotify");
        try {
          const profile = await getMyProfile();
          if (profile) {
            setSpotifyUser(profile);
          } else {
            setAuthError("Connected to Spotify, but failed to fetch profile.");
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
    setAuthError(null); 
  };

  const handleSourceChange = (value: MusicSource) => {
    setSelectedSource(value);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" /> Theme Settings</CardTitle>
          <CardDescription>Personaliza la apariencia de MusicVision.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle-label" className="text-base">Apariencia</Label>
                <div className="flex items-center gap-2">
                    <span id="theme-toggle-label" className="text-sm text-muted-foreground">Cambia entre modo claro y oscuro.</span>
                    <ThemeToggle />
                </div>
            </div>
            <Card className="bg-card/50 p-4">
                <CardDescription className="text-center text-xs mb-2">Vista Previa del Tema Actual</CardDescription>
                <div className="h-24 rounded-md border border-border flex items-center justify-center p-4 bg-background">
                    <div className="flex items-center gap-2">
                        <AppLogo iconSize={20} showName={true} textSize="text-sm"/>
                        <Button size="sm" variant="secondary">Ejemplo</Button>
                    </div>
                </div>
            </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Music className="mr-2 h-5 w-5 text-primary" /> Fuente de Música</CardTitle>
          <CardDescription>Conecta tu servicio de streaming preferido o usa archivos locales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
              <p>{authError}</p>
            </div>
          )}
          {isLoadingSpotifyAuth ? (
            <p className="text-muted-foreground">Verificando conexión con Spotify...</p>
          ) : (
            <RadioGroup value={selectedSource} onValueChange={handleSourceChange} className="space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value="spotify" id="spotify" />
                  <Label htmlFor="spotify" className="text-base font-medium flex items-center">
                    <SpotifyIcon className="w-5 h-5 mr-2 text-green-500" /> Spotify
                  </Label>
                </div>
                <div className="ml-7 space-y-2">
                  {isSpotifyAuthenticated ? (
                    <>
                      {spotifyUser && <p className="text-sm text-foreground">Conectado como: {spotifyUser.display_name || spotifyUser.email}</p>}
                      <Button onClick={handleSpotifyLogout} variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4"/> Desconectar Spotify
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleSpotifyLogin} variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white animate-pulse-border-subtle">
                      <LogIn className="mr-2 h-4 w-4"/> Conectar Spotify
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value="appleMusic" id="appleMusic" disabled />
                  <Label htmlFor="appleMusic" className="text-base font-medium text-muted-foreground/70">Apple Music</Label>
                </div>
                <div className="ml-7">
                    <Button variant="outline" size="sm" disabled className="text-xs">Notificarme (Próximamente)</Button>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value="tidal" id="tidal" disabled />
                  <Label htmlFor="tidal" className="text-base font-medium text-muted-foreground/70">Tidal</Label>
                </div>
                 <div className="ml-7">
                    <Button variant="outline" size="sm" disabled className="text-xs">Notificarme (Próximamente)</Button>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value="local" id="local" checked={selectedSource === "local"} />
                  <Label htmlFor="local" className="text-base font-medium">Archivos Locales</Label>
                </div>
                 <div className="ml-7 flex items-center gap-2">
                    {selectedSource === "local" && (
                        <p className="text-sm text-muted-foreground">Usando música local (simulada).</p>
                    )}
                    <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                        <Upload className="mr-2 h-4 w-4" /> Cargar Archivos
                    </Button>
                </div>
              </div>
            </RadioGroup>
          )}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border/50">
            La integración con Spotify usa el Flujo de Código de Autorización. Tus datos se manejan según la política de privacidad de Spotify.
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Modo Offline</CardTitle>
          <CardDescription>Gestiona tu música descargada para reproducción sin conexión.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="offline-mode-toggle" className="text-base">Habilitar Modo Offline</Label>
                 <Switch id="offline-mode-toggle" disabled className="data-[state=checked]:bg-primary"/>
            </div>
            <p className="text-sm text-muted-foreground">Esta función estará disponible próximamente.</p>
            <Button disabled className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                <Download className="mr-2 h-4 w-4" /> Gestionar Descargas
            </Button>
            <div className="mt-2 p-3 border border-dashed rounded-md bg-card/50">
                <p className="text-xs text-muted-foreground mb-1 text-center">Ejemplo de descargas:</p>
                <div className="flex items-center justify-between text-sm p-2 rounded bg-background">
                    <span>Volaré - Danny Ocean</span>
                    <Download className="h-4 w-4 text-primary" />
                </div>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Ajustes de Reproducción</CardTitle>
          <CardDescription>Personaliza tu experiencia auditiva.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="crossfade-slider" className="text-base">Duración de Crossfade: {crossfadeDuration}s</Label>
                <Slider
                    id="crossfade-slider"
                    min={0} max={10} step={1}
                    value={[crossfadeDuration]}
                    onValueChange={(value) => setCrossfadeDuration(value[0])}
                    className="mt-2 [&>span>span]:bg-primary [&>span]:bg-primary/30"
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="gapless-toggle" className="text-base">Reproducción sin Pausas (Gapless)</Label>
                <Switch
                    id="gapless-toggle"
                    checked={gaplessPlayback}
                    onCheckedChange={setGaplessPlayback}
                    className="data-[state=checked]:bg-primary"
                />
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Funciones IA</CardTitle>
          <CardDescription>Mejoras con Inteligencia Artificial.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="ai-recommendations-toggle" className="text-base">Habilitar Recomendaciones IA</Label>
                <Switch
                    id="ai-recommendations-toggle"
                    checked={enableAIRecommendations}
                    onCheckedChange={setEnableAIRecommendations}
                    disabled 
                    className="data-[state=checked]:bg-primary"
                />
            </div>
            <p className="text-sm text-muted-foreground">Esta función estará disponible próximamente.</p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
                <span>Potenciado por</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12.55 2.755a.5.5 0 0 0-.9 0l-2 4A.5.5 0 0 0 10 7.5h4a.5.5 0 0 0 .35-.855l-2-4Z"/><path d="M17 11h-2a1 1 0 0 0-1 1v2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12a1 1 0 0 0-1-1Z"/><path d="m7 11-2.5 2.5a1.5 1.5 0 0 0 0 2.121L7 18"/><path d="M14.5 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>
                <span>Genkit</span>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
