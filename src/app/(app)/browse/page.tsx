
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Album, Track } from '@/lib/types';
import { Play, Pause, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayer } from '@/contexts/PlayerContext';
import { useEffect, useState, type FormEvent } from 'react';
import { getMyTopTracks } from '@/services/spotifyService';
import type { SpotifyTrackItem } from '@/types/spotify';
import { SpotifyIcon } from '@/components/common/SpotifyIcon';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';


interface QuickPickItem {
  id: string;
  title: string;
  artist?: string;
  artworkUrl: string;
  dataAiHint: string;
  type: 'album' | 'playlist' | 'track';
  tracks?: Track[];
  track?: Track;
}

const mockPopularItems: QuickPickItem[] = [
  { id: 'pop1', title: "That's What I Like", artist: "Bruno Mars", artworkUrl: 'https://placehold.co/150x150/C7254E/FFFFFF.png?text=BM', dataAiHint: "bruno mars pop", type: 'track', track: { id: 'local_bm', title: "That's What I Like", artist: 'Bruno Mars', album: '24K Magic', duration: 210, artworkUrl: 'https://placehold.co/150x150/C7254E/FFFFFF.png?text=BM', dataAiHint: 'bruno mars', audioSrc:'/audio/synthwave-nostalgia.mp3', source: 'local'} },
  { id: 'pop2', title: "Paris In The Rain", artist: "Lauv", artworkUrl: 'https://placehold.co/150x150/7058A3/FFFFFF.png?text=LV', dataAiHint: "lauv pop", type: 'track', track: { id: 'local_lauv', title: "Paris In The Rain", artist: 'Lauv', album: 'I met you when I was 18.', duration: 180, artworkUrl: 'https://placehold.co/150x150/7058A3/FFFFFF.png?text=LV', dataAiHint: 'lauv paris', audioSrc:'/audio/electronic-background-music.mp3', source: 'local'} },
  { id: 'pop3', title: "Diamond", artist: "Rihanna", artworkUrl: 'https://placehold.co/150x150/10B981/FFFFFF.png?text=RI', dataAiHint: "rihanna pop", type: 'track', track: { id: 'local_ri', title: "Diamond", artist: 'Rihanna', album: 'Unapologetic', duration: 225, artworkUrl: 'https://placehold.co/150x150/10B981/FFFFFF.png?text=RI', dataAiHint: 'rihanna diamond', audioSrc:'/audio/inspiring-emotional-uplifting-piano.mp3', source: 'local'} },
  { id: 'pop4', title: "Neon Future Remix", artist: "Synthwave Dreams", artworkUrl: 'https://placehold.co/150x150/F2711C/FFFFFF.png?text=NF', dataAiHint: "synthwave playlist", type: 'album', tracks: [
    { id: 't1', title: 'City Lights', artist: 'Synthwave Dreams', album: 'Neon Future Remix', duration: 180, artworkUrl: 'https://placehold.co/80x80/F2711C/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/synthwave-nostalgia.mp3", source: 'local' },
    { id: 't2', title: 'Retro Drive', artist: 'Synthwave Dreams', album: 'Neon Future Remix', duration: 220, artworkUrl: 'https://placehold.co/80x80/F2711C/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/electronic-background-music.mp3", source: 'local' },
  ]},
];

const mapSpotifyTrackToAppTrack = (spotifyTrack: SpotifyTrackItem): Track => ({
  id: spotifyTrack.id,
  title: spotifyTrack.name,
  artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
  album: spotifyTrack.album.name,
  duration: Math.floor(spotifyTrack.duration_ms / 1000),
  artworkUrl: spotifyTrack.album.images?.[0]?.url || spotifyTrack.album.images?.[1]?.url || `https://placehold.co/150x150/cccccc/969696.png?text=${encodeURIComponent(spotifyTrack.name.substring(0,2))}`,
  audioSrc: spotifyTrack.preview_url || undefined,
  spotifyUri: spotifyTrack.uri,
  isSpotifyTrack: true,
  source: 'spotify',
  dataAiHint: `${spotifyTrack.name.substring(0,15)} ${spotifyTrack.artists[0]?.name.substring(0,10) || 'song'}`.toLowerCase(),
});


export default function BrowsePage() {
  const { playTrack, playPlaylist, togglePlayPause, currentTrack, isPlaying, queue, isSpotifyConnected } = usePlayer();
  const [topSpotifyTracks, setTopSpotifyTracks] = useState<Track[]>([]);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
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

  }, [isSpotifyConnected]);

 const handlePlayItem = (item: QuickPickItem | Album | Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if ('audioSrc' in item || 'spotifyUri' in item ) {
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

    if ('type' in item) {
      if (item.type === 'track' && item.track) {
        trackToPlayFromQuickPick = item.track;
      } else if (item.tracks && item.tracks.length > 0) {
        tracksToPlay = item.tracks;
      }
    } else if ('tracks' in item && (item as Album).tracks) {
      tracksToPlay = (item as Album).tracks;
    }

    const isPlayingThisSingleQuickPickTrack = trackToPlayFromQuickPick && currentTrack?.id === trackToPlayFromQuickPick.id && currentTrack.source === trackToPlayFromQuickPick.source;

    let isPlayingThisAlbumOrPlaylistContext = false;
    if (tracksToPlay && tracksToPlay.length > 0 && currentTrack && queue.length > 0) {
        const currentAlbumSource = tracksToPlay[0].source;
        if (currentTrack.source === currentAlbumSource && tracksToPlay.some(t => t.id === currentTrack.id)) {
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

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="relative min-h-full bg-gradient-to-br from-background to-accent/10 text-foreground flex flex-col overflow-hidden">
      {/* Background Effects - adapted for current theme variables */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>

      <div className="relative z-10 space-y-8 p-0 md:p-0"> {/* Removed page padding for sections to control their own */}
        <section className="px-4 md:px-6 pt-4 md:pt-6"> {/* Added padding here */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            Find The Best <br className="md:hidden" />Music For Your <br className="md:hidden" />Daily Music
          </h1>
          <form onSubmit={handleSearchSubmit} className="relative mb-6 md:mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for songs, artists, albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-12 text-base bg-background/70 border-border/50 focus:bg-card focus:border-primary backdrop-blur-sm"
              aria-label="Search music"
            />
          </form>
        </section>

        {/* Popular Section */}
        <section className="px-4 md:px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Popular</h2>
            <Button variant="link" asChild className="text-sm">
              <Link href="/library/songs">View All</Link>
            </Button>
          </div>
          <ScrollArea className="w-full whitespace-nowrap -mx-4 md:-mx-6 px-4 md:px-6"> {/* Offset negative margin for full-bleed scroll */}
            <div className="flex space-x-4 pb-4">
              {mockPopularItems.map((item) => {
                const isActive = (item.type === 'track' && item.track?.id === currentTrack?.id && item.track.source === currentTrack.source) ||
                                 (item.tracks && item.tracks.some(t => t.id === currentTrack?.id && t.source === currentTrack.source));
                const canPlay = (item.type === 'track' && item.track) || (item.tracks && item.tracks.length > 0);
                return(
                <Card
                  key={item.id}
                  className="group relative w-36 min-w-36 sm:w-40 sm:min-w-40 overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm rounded-lg cursor-pointer border-border/30"
                  onClick={() => canPlay && handlePlayItem(item)}
                >
                  <CardContent className="p-0">
                    <Image
                      src={item.artworkUrl}
                      alt={item.title}
                      width={160}
                      height={160}
                      className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                      data-ai-hint={item.dataAiHint}
                    />
                  </CardContent>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold truncate text-foreground">{item.title}</p>
                    {item.artist && <p className="text-xs text-muted-foreground truncate">{item.artist}</p>}
                  </div>
                  {canPlay && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-[calc(25%+0.5rem)] right-2 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                      onClick={(e) => handlePlayItem(item, e)}
                      aria-label={`Play ${item.title}`}
                    >
                      {(isActive && isPlaying) ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    </Button>
                  )}
                </Card>
              )})}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Top Tracks Section - Spotify */}
        <section className="px-4 md:px-6">
          {isLoadingSpotify ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Tus Top Tracks (Spotify)</h2>
              <p className="text-muted-foreground">Cargando tus tracks de Spotify...</p>
            </>
          ) : spotifyError && !isSpotifyConnected ? (
            <Card className="p-4 bg-card/80 border-border/50 backdrop-blur-sm">
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
          ) : spotifyError ? (
            <Card className="p-4 bg-destructive/10 border-destructive/30 backdrop-blur-sm">
                <CardTitle className="text-destructive text-lg">Error de Spotify</CardTitle>
                <CardContent className="text-destructive/90 pt-2 text-sm">
                    <p>{spotifyError}</p>
                </CardContent>
            </Card>
          ) : topSpotifyTracks.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
                    <SpotifyIcon className="w-7 h-7 mr-2 text-green-500" /> Tus Top Tracks (Spotify)
                  </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
                {topSpotifyTracks.map((track) => {
                  const isCurrentlyActiveItem = track.id === currentTrack?.id && track.source === currentTrack?.source;
                  return (
                  <Card key={`${track.source}-${track.id}`} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm rounded-lg cursor-pointer border-border/30" onClick={() => handlePlayItem(track)}>
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
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Tus Top Tracks (Spotify)</h2>
              <p className="text-muted-foreground">No hay top tracks para mostrar. ¡Escucha más música en Spotify!</p>
            </>
          )}
        </section>

        {/* Genkit Badge - Re-styled to fit better */}
        <div className="px-4 md:px-6 pb-4">
            <div className="flex justify-center md:justify-end mt-8">
                 <div className="bg-card/60 backdrop-blur-sm text-xs text-muted-foreground px-3 py-1.5 rounded-full shadow-lg border border-border/50 flex items-center gap-1.5">
                    <span>Potenciado por</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12.55 2.755a.5.5 0 0 0-.9 0l-2 4A.5.5 0 0 0 10 7.5h4a.5.5 0 0 0 .35-.855l-2-4Z"/><path d="M17 11h-2a1 1 0 0 0-1 1v2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12a1 1 0 0 0-1-1Z"/><path d="m7 11-2.5 2.5a1.5 1.5 0 0 0 0 2.121L7 18"/><path d="M14.5 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>
                    <span>Genkit</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
    