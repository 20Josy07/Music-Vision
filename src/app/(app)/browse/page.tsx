
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Album, Track } from '@/lib/types'; // Renamed AppTrack to Track
import { Play, Pause, Heart, Library as LibraryIcon, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useEffect, useState } from 'react';
import { getMyTopTracks } from '@/services/spotifyService';
import { getPopularJamendoTracks, getNewReleaseJamendoAlbums } from '@/services/jamendoService'; // Import Jamendo services
import type { SpotifyTrackItem } from '@/types/spotify';
import { SpotifyIcon } from '@/components/common/SpotifyIcon';
import { cn } from '@/lib/utils';


interface QuickPickItem {
  id: string;
  title: string;
  artworkUrl: string;
  dataAiHint: string;
  type: 'album' | 'playlist' | 'track';
  tracks?: Track[];
  track?: Track; 
  colorClass?: string;
}

// Quick Picks can remain for now, but might be re-evaluated later
const mockQuickPicks: QuickPickItem[] = [
  { id: 'qp1', title: 'Tus me gusta (Spotify)', artworkUrl: 'https://placehold.co/56x56/7058A3/FFFFFF.png?text=%E2%99%A5', dataAiHint: "liked songs", type: 'playlist', tracks: [], colorClass: 'bg-brand-purple-liked'},
  { id: 'qp2', title: 'Neon Future Remix', artworkUrl: 'https://placehold.co/56x56/C7254E/FFFFFF.png?text=NF', dataAiHint: "synthwave playlist", type: 'album', tracks: [
    { id: 't1', title: 'City Lights', artist: 'Synthwave Dreams', album: 'Neon Future Remix', duration: 180, artworkUrl: 'https://placehold.co/80x80/C7254E/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/synthwave-nostalgia.mp3", source: 'local' },
    { id: 't2', title: 'Retro Drive', artist: 'Synthwave Dreams', album: 'Neon Future Remix', duration: 220, artworkUrl: 'https://placehold.co/80x80/C7254E/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/electronic-background-music.mp3", source: 'local' },
  ], colorClass: 'bg-brand-red'},
];


const mapSpotifyTrackToAppTrack = (spotifyTrack: SpotifyTrackItem): Track => ({
  id: spotifyTrack.id,
  title: spotifyTrack.name,
  artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
  album: spotifyTrack.album.name,
  duration: Math.floor(spotifyTrack.duration_ms / 1000),
  artworkUrl: spotifyTrack.album.images?.[0]?.url || spotifyTrack.album.images?.[1]?.url || `https://placehold.co/300x300/cccccc/969696.png?text=${encodeURIComponent(spotifyTrack.name.substring(0,2))}`,
  audioSrc: spotifyTrack.preview_url || undefined, // Spotify preview URLs are often short
  spotifyUri: spotifyTrack.uri,
  isSpotifyTrack: true,
  source: 'spotify',
  dataAiHint: `${spotifyTrack.name.substring(0,15)} ${spotifyTrack.artists[0]?.name.substring(0,10) || 'song'}`.toLowerCase(),
});


export default function BrowsePage() {
  const { playTrack, playPlaylist, togglePlayPause, currentTrack, isPlaying, queue, isSpotifyConnected } = usePlayer();
  const [greeting, setGreeting] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todo');
  
  // Spotify States
  const [topSpotifyTracks, setTopSpotifyTracks] = useState<Track[]>([]);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);

  // Jamendo States
  const [newReleaseAlbums, setNewReleaseAlbums] = useState<Album[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [isLoadingJamendo, setIsLoadingJamendo] = useState(true);
  const [jamendoError, setJamendoError] = useState<string | null>(null);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    const initSpotify = async () => {
      setIsLoadingSpotify(true);
      if (isSpotifyConnected) {
        try {
          const spotifyTracksData = await getMyTopTracks({ limit: 6 });
          if (spotifyTracksData.length > 0) {
            setTopSpotifyTracks(spotifyTracksData.map(mapSpotifyTrackToAppTrack));
            setSpotifyError(null);
          } else {
            setSpotifyError("No se encontraron tus top tracks de Spotify.");
            setTopSpotifyTracks([]);
          }
        } catch (error) {
          console.error("Error fetching Spotify tracks:", error);
          setSpotifyError("Fallo al cargar tus top tracks. Intenta reconectar Spotify en Ajustes.");
          setTopSpotifyTracks([]);
        }
      } else {
        setSpotifyError("Conecta Spotify en Ajustes para ver tus top tracks.");
        setTopSpotifyTracks([]);
      }
      setIsLoadingSpotify(false);
    };
    
    if (typeof isSpotifyConnected === 'boolean') {
        initSpotify();
    }

    const loadJamendoData = async () => {
      setIsLoadingJamendo(true);
      setJamendoError(null);
      try {
        const [albumsData, tracksData] = await Promise.all([
          getNewReleaseJamendoAlbums(6),
          getPopularJamendoTracks(12) // Fetch more popular tracks
        ]);
        setNewReleaseAlbums(albumsData);
        setPopularTracks(tracksData);
      } catch (error) {
        console.error("Error fetching Jamendo data:", error);
        setJamendoError("No se pudo cargar la música de Jamendo. Inténtalo de nuevo más tarde.");
      }
      setIsLoadingJamendo(false);
    };

    loadJamendoData();

  }, [isSpotifyConnected]); 


 const handlePlayItem = (item: QuickPickItem | Album | Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if ('audioSrc' in item || 'spotifyUri' in item || 'isJamendoTrack' in item) { // Track-like object
        const trackToPlayDirectly = item as Track;
         if (currentTrack?.id === trackToPlayDirectly.id && currentTrack.source === trackToPlayDirectly.source) {
            togglePlayPause();
        } else {
            playTrack(trackToPlayDirectly);
        }
        return;
    }
    
    let tracksToPlay: Track[] | undefined = undefined;
    let trackToPlayFromQuickPick: Track | undefined = undefined;

    if ('type' in item) { // QuickPickItem
      if (item.type === 'track' && item.track) {
        trackToPlayFromQuickPick = item.track;
      } else if (item.tracks && item.tracks.length > 0) {
        tracksToPlay = item.tracks;
      }
    } else if ('tracks' in item && (item as Album).tracks) { // Album
      tracksToPlay = (item as Album).tracks;
    }

    const isPlayingThisSingleQuickPickTrack = trackToPlayFromQuickPick && currentTrack?.id === trackToPlayFromQuickPick.id && currentTrack.source === trackToPlayFromQuickPick.source;
    
    let isPlayingThisAlbumOrPlaylistContext = false;
    if (tracksToPlay && tracksToPlay.length > 0 && currentTrack && queue.length > 0) {
        const currentAlbumSource = tracksToPlay[0].source; // Assume all tracks in album have same source
        if (currentTrack.source === currentAlbumSource && tracksToPlay.some(t => t.id === currentTrack.id)) {
            // Check if current queue matches the album/playlist context
            isPlayingThisAlbumOrPlaylistContext = queue.length === tracksToPlay.length &&
                queue.every(qTrack => tracksToPlay!.some(itemTrack => itemTrack.id === qTrack.id && itemTrack.source === qTrack.source));
        }
    }
    

    if ((isPlayingThisSingleQuickPickTrack && isPlaying) || (isPlayingThisAlbumOrPlaylistContext && isPlaying)) {
      togglePlayPause();
    } else if ((isPlayingThisSingleQuickPickTrack && !isPlaying) || (isPlayingThisAlbumOrPlaylistContext && !isPlaying)) {
      if (trackToPlayFromQuickPick) playTrack(trackToPlayFromQuickPick);
      else if (tracksToPlay && tracksToPlay.length > 0) playPlaylist(tracksToPlay, 0);
      else togglePlayPause(); 
    } else if (trackToPlayFromQuickPick) {
      playTrack(trackToPlayFromQuickPick);
    } else if (tracksToPlay && tracksToPlay.length > 0) {
      playPlaylist(tracksToPlay, 0);
    } else {
      console.log("Item has no tracks to play or action determined:", item.title);
    }
  };


  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-foreground mb-4">{greeting}</h1>
        <div className="flex gap-2 mb-6">
          {['Todo', 'Música', 'Podcasts'].map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "bg-card text-card-foreground font-semibold" : "text-muted-foreground"}
            >
              {filter}
            </Button>
          ))}
        </div>

        {mockQuickPicks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
            {mockQuickPicks.map((item) => {
              let isCurrentlyActiveItem = false;
              if (currentTrack) {
                if (item.type === 'track' && item.track?.id === currentTrack.id && item.track.source === currentTrack.source) {
                  isCurrentlyActiveItem = true;
                } else if (item.tracks && item.tracks.some(t => t.id === currentTrack.id && t.source === currentTrack.source) && queue.some(qTrack => item.tracks!.find(iTrack => iTrack.id === qTrack.id && iTrack.source === qTrack.source))) {
                  const currentContextMatches = queue.length === item.tracks.length && queue.every(qT => item.tracks!.some(iT => iT.id === qT.id && iT.source === qT.source));
                  if (currentContextMatches) {
                      isCurrentlyActiveItem = true;
                  }
                }
              }
              const canPlay = (item.type === 'track' && item.track) || (item.tracks && item.tracks.length > 0);

              return (
                <Card
                  key={item.id}
                  className={cn(
                      "flex items-center p-0 bg-card hover:shadow-lg hover:ring-1 hover:ring-primary/70 transition-all duration-200 group cursor-pointer relative overflow-hidden rounded-md shadow-sm",
                      item.colorClass && !item.artworkUrl.includes('placehold.co') ? item.colorClass : 'bg-card'
                  )}
                  onClick={() => canPlay && handlePlayItem(item)}
                >
                  <Image src={item.artworkUrl} alt={item.title} width={56} height={56} className="aspect-square object-cover rounded-l-md" data-ai-hint={item.dataAiHint} />
                  <CardContent className="p-3 flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-foreground truncate">{item.title}</CardTitle>
                  </CardContent>
                  {canPlay && (
                      <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/70 hover:bg-primary text-primary-foreground rounded-full h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => handlePlayItem(item, e)}
                      aria-label={`Play ${item.title}`}
                      >
                      {(isCurrentlyActiveItem && isPlaying) ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Jamendo Popular Tracks Section */}
      <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
                <Music2 className="w-7 h-7 mr-2 text-accent" /> Pistas Populares (Jamendo)
              </h2>
              {/* <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link> */}
          </div>
          {isLoadingJamendo && <p className="text-muted-foreground">Cargando pistas populares...</p>}
          {jamendoError && !isLoadingJamendo && <p className="text-destructive">{jamendoError}</p>}
          {!isLoadingJamendo && !jamendoError && popularTracks.length === 0 && <p className="text-muted-foreground">No hay pistas populares disponibles.</p>}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {popularTracks.map((track) => {
               const isCurrentlyActiveItem = track.id === currentTrack?.id && track.source === currentTrack?.source;
              return (
              <Card key={`${track.source}-${track.id}`} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => handlePlayItem(track)}>
                  <CardContent className="p-0">
                      <Image
                      src={track.artworkUrl}
                      alt={track.title}
                      width={300}
                      height={300}
                      className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                      data-ai-hint={track.dataAiHint || 'song track'}
                      />
                  </CardContent>
                <div className="p-3">
                  <CardTitle className="text-sm font-semibold truncate text-foreground">{track.title}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-[calc(25%+0.75rem)] right-3 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                    onClick={(e) => handlePlayItem(track, e)}
                    aria-label={`Play ${track.title}`}
                  >
                    {(isCurrentlyActiveItem && isPlaying) ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                  </Button>
              </Card>
              );
            })}
          </div>
      </section>

      {/* Jamendo New Releases Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Novedades (Jamendo)</h2>
            {/* <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link> */}
        </div>
        {isLoadingJamendo && <p className="text-muted-foreground">Cargando novedades...</p>}
        {jamendoError && !isLoadingJamendo && <p className="text-destructive">{jamendoError}</p>}
        {!isLoadingJamendo && !jamendoError && newReleaseAlbums.length === 0 && <p className="text-muted-foreground">No hay novedades disponibles.</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
          {newReleaseAlbums.map((album) => {
             let isCurrentlyActiveItem = false;
             if (currentTrack && album.tracks && album.tracks.length > 0) {
                if (album.tracks.some(track => track.id === currentTrack.id && track.source === currentTrack.source)) {
                    isCurrentlyActiveItem = queue.length === album.tracks.length &&
                                           queue.every(qTrack => album.tracks!.some(itemTrack => itemTrack.id === qTrack.id && itemTrack.source === qTrack.source));
                }
             }
             const canPlay = album.tracks && album.tracks.length > 0;
            return (
            <Card key={`${album.source}-${album.id}`} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => canPlay && handlePlayItem(album)}>
                <CardContent className="p-0">
                    <Image
                    src={album.artworkUrl}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                    data-ai-hint={album.dataAiHint || 'album art'}
                    />
                </CardContent>
              <div className="p-3">
                <CardTitle className="text-sm font-semibold truncate text-foreground">{album.title}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
              </div>
              {canPlay && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-[calc(25%+0.75rem)] right-3 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                    onClick={(e) => handlePlayItem(album, e)}
                    aria-label={`Play ${album.title}`}
                    >
                    {(isCurrentlyActiveItem && isPlaying) ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
              )}
            </Card>
            );
          })}
        </div>
      </section>

      {/* Spotify Top Tracks Section (Kept as is) */}
      {isLoadingSpotify ? (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Tus Top Tracks (Spotify)</h2>
          <p className="text-muted-foreground">Cargando tus tracks de Spotify...</p>
        </section>
      ) : spotifyError && !isSpotifyConnected ? (
         <section>
            <Card className="p-4 bg-card/80 border-border/50">
                <CardTitle className="text-foreground text-lg flex items-center">
                    <SpotifyIcon className="w-6 h-6 mr-2 text-green-500" /> Conectar a Spotify
                </CardTitle>
                <CardContent className="text-muted-foreground pt-2 text-sm">
                    <p>{spotifyError}</p>
                    <Link href="/settings" passHref>
                       <Button variant="link" className="px-0 text-primary hover:text-primary/80">Ir a Ajustes para conectar</Button>
                    </Link>
                </CardContent>
            </Card>
        </section>
      ) : spotifyError ? (
         <section>
            <Card className="p-4 bg-destructive/10 border-destructive/30">
                <CardTitle className="text-destructive text-lg">Error de Spotify</CardTitle>
                <CardContent className="text-destructive/90 pt-2 text-sm">
                    <p>{spotifyError}</p>
                </CardContent>
            </Card>
        </section>
      ) : topSpotifyTracks.length > 0 ? (
        <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
                <SpotifyIcon className="w-7 h-7 mr-2 text-green-500" /> Tus Top Tracks (Spotify)
              </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {topSpotifyTracks.map((track) => {
               const isCurrentlyActiveItem = track.id === currentTrack?.id && track.source === currentTrack?.source;
              return (
              <Card key={`${track.source}-${track.id}`} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => handlePlayItem(track)}>
                  <CardContent className="p-0">
                      <Image
                      src={track.artworkUrl}
                      alt={track.title}
                      width={300}
                      height={300}
                      className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                      data-ai-hint={track.dataAiHint || 'song track'}
                      />
                  </CardContent>
                <div className="p-3">
                  <CardTitle className="text-sm font-semibold truncate text-foreground">{track.title}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-[calc(25%+0.75rem)] right-3 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                    onClick={(e) => handlePlayItem(track, e)}
                    aria-label={`Play ${track.title}`}
                  >
                    {(isCurrentlyActiveItem && isPlaying) ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                  </Button>
              </Card>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Tus Top Tracks (Spotify)</h2>
          <p className="text-muted-foreground">No hay top tracks para mostrar. ¡Escucha más música en Spotify!</p>
        </section>
      )}

       {/* AI Genkit Badge Placeholder - Bottom Right */}
      <div className="fixed bottom-28 right-6 md:bottom-6 md:right-6 z-50">
        <div className="bg-card/70 backdrop-blur-sm text-xs text-muted-foreground px-3 py-1.5 rounded-full shadow-lg border border-border/50 flex items-center gap-1.5">
            <span>Potenciado por</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12.55 2.755a.5.5 0 0 0-.9 0l-2 4A.5.5 0 0 0 10 7.5h4a.5.5 0 0 0 .35-.855l-2-4Z"/><path d="M17 11h-2a1 1 0 0 0-1 1v2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12a1 1 0 0 0-1-1Z"/><path d="m7 11-2.5 2.5a1.5 1.5 0 0 0 0 2.121L7 18"/><path d="M14.5 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>
            <span>Genkit</span>
        </div>
      </div>
    </div>
  );
}
