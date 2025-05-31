
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Album, Track as AppTrack } from '@/lib/types'; // Renamed to avoid conflict
import { Play, Pause, Heart, Library as LibraryIcon } from 'lucide-react'; // Added LibraryIcon
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Keep if needed for other sections
import { useEffect, useState } from 'react';
import { getMyTopTracks } from '@/services/spotifyService';
import type { SpotifyTrackItem } from '@/types/spotify';
import { SpotifyIcon } from '@/components/common/SpotifyIcon';
import { cn } from '@/lib/utils';


interface QuickPickItem {
  id: string;
  title: string;
  artworkUrl: string;
  dataAiHint: string;
  type: 'album' | 'playlist' | 'track';
  tracks?: AppTrack[];
  track?: AppTrack; // For single track quick picks
  colorClass?: string; // For specific brand colors
}

const mockQuickPicks: QuickPickItem[] = [
  { id: 'qp1', title: 'Tus me gusta', artworkUrl: 'https://placehold.co/56x56/7058A3/FFFFFF.png?text=%E2%99%A5', dataAiHint: "liked songs", type: 'playlist', tracks: [
    { id: 's1', title: 'Starry Night (Liked)', artist: 'Cosmic Voyager', album: 'Galactic Dreams', duration: 210, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=SN', dataAiHint:"starry night", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
  ], colorClass: 'bg-brand-purple-liked'},
  { id: 'qp2', title: 'Neon Future', artworkUrl: 'https://placehold.co/56x56/C7254E/FFFFFF.png?text=NF', dataAiHint: "synthwave playlist", type: 'album', tracks: [
    { id: 't1', title: 'City Lights', artist: 'Synthwave Dreams', album: 'Neon Future', duration: 180, artworkUrl: 'https://placehold.co/80x80/C7254E/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/synthwave-nostalgia.mp3" },
    { id: 't2', title: 'Retro Drive', artist: 'Synthwave Dreams', album: 'Neon Future', duration: 220, artworkUrl: 'https://placehold.co/80x80/C7254E/FFFFFF.png?text=NF', dataAiHint:"neon future", audioSrc:"/audio/electronic-background-music.mp3" },
  ], colorClass: 'bg-brand-red'},
  { id: 'qp3', title: 'Radio de Imagínate', artworkUrl: 'https://placehold.co/56x56/3B82F6/FFFFFF.png?text=RI', dataAiHint: "radio station", type: 'playlist', tracks: [ /* Empty for now */ ], colorClass: 'bg-brand-blue' },
  { id: 'qp4', title: 'Acoustic Mornings', artworkUrl: 'https://placehold.co/56x56/1A171B/FFFFFF.png?text=AM', dataAiHint: "acoustic guitar", type: 'album', tracks: [
     { id: 'am1', title: 'Sunrise Strum', artist: 'Willow Creek', album: 'Acoustic Mornings', duration: 190, artworkUrl: 'https://placehold.co/80x80/1A171B/FFFFFF.png?text=AM', dataAiHint:"acoustic sunrise", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
  ], colorClass: 'bg-brand-green' },
  { id: 'qp5', title: 'Made in Medellin', artworkUrl: 'https://placehold.co/56x56/10B981/FFFFFF.png?text=MM', dataAiHint: "latin playlist", type: 'playlist', tracks: [ /* Empty for now */ ], colorClass: 'bg-brand-teal' },
  { id: 'qp6', title: 'Lo-Fi Beats Single', artworkUrl: 'https://placehold.co/56x56/F97316/FFFFFF.png?text=LB', dataAiHint: "lofi beats", type: 'track', track:
    { id: 'lofi1', title: 'Chillhop Dreams', artist: 'Lofi Panda', album: 'Beats to Study To', duration: 150, artworkUrl: 'https://placehold.co/50x50/F97316/FFFFFF.png?text=CD', dataAiHint:"lofi chill", audioSrc:"/audio/synthwave-nostalgia.mp3" },
    colorClass: 'bg-brand-orange'
  },
];

const mockPublicLibraryTracks: AppTrack[] = [
  { id: 'pub1', title: 'Ethereal Echoes (Hi-Fi)', artist: 'Audiophile Dreams', album: 'Lossless Collection Vol. 1', duration: 245, artworkUrl: 'https://placehold.co/300x300/8B5CF6/FFFFFF.png?text=EE', dataAiHint: "abstract soundwave", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3", isSpotifyTrack: false },
  { id: 'pub2', title: 'Crystal Clear Notes (FLAC)', artist: 'Pristine Audio', album: 'Lossless Collection Vol. 1', duration: 190, artworkUrl: 'https://placehold.co/300x300/8B5CF6/FFFFFF.png?text=CN', dataAiHint: "clear crystal", audioSrc:"/audio/electronic-background-music.mp3", isSpotifyTrack: false },
  { id: 'pub3', title: 'Deep Groove Masters', artist: 'Studio Sounds', album: 'Uncompressed Funk', duration: 310, artworkUrl: 'https://placehold.co/300x300/EC4899/FFFFFF.png?text=DG', dataAiHint: "vinyl record", audioSrc:"/audio/synthwave-nostalgia.mp3", isSpotifyTrack: false },
  { id: 'pub4', title: 'Orchestral Suite No. 7 (Live)', artist: 'Grand Philharmonic', album: 'Live Recordings', duration: 420, artworkUrl: 'https://placehold.co/300x300/F59E0B/FFFFFF.png?text=OS', dataAiHint: "orchestra hall", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3", isSpotifyTrack: false },
];


const mockNewReleaseAlbums: Album[] = [
  { id: 'album1', title: 'Viernes Novedades', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/E11D48/FFFFFF.png?text=VN', dataAiHint:"new music friday", tracks: [
    { id: 'vn1', title: 'Fresh Beat', artist: 'DJ New', album: 'Viernes Novedades', duration: 180, artworkUrl: 'https://placehold.co/50x50/E11D48/FFFFFF.png?text=FB', dataAiHint:"electronic beat", audioSrc:"/audio/synthwave-nostalgia.mp3" },
    { id: 'vn2', title: 'Weekend Vibe', artist: 'The Weekenders', album: 'Viernes Novedades', duration: 200, artworkUrl: 'https://placehold.co/50x50/E11D48/FFFFFF.png?text=WV', dataAiHint:"pop song", audioSrc:"/audio/electronic-background-music.mp3" },
  ]},
  { id: 'album2', title: 'Radar de Novedades', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/F97316/FFFFFF.png?text=RN', dataAiHint:"new music radar", tracks: [
    { id: 'rn1', title: 'Discovery Path', artist: 'Explorer', album: 'Radar de Novedades', duration: 210, artworkUrl: 'https://placehold.co/50x50/F97316/FFFFFF.png?text=DP', dataAiHint:"indie discovery", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
  ]},
  { id: 'album3', title: 'HOTNOW!', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/F59E0B/FFFFFF.png?text=HN', dataAiHint:"hot hits", tracks: []}, // Keep some empty to test
  { id: 'album4', title: 'Lo mejor de ahora', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/84CC16/FFFFFF.png?text=LMDN', dataAiHint:"top current", tracks: []},
  { id: 'album5', title: 'Nuevos Horizontes', artist: 'Varios Artistas', artworkUrl: 'https://placehold.co/300x300/6366F1/FFFFFF.png?text=NH', dataAiHint:"new indie", tracks: [] },
  { id: 'album6', title: 'Top Latino', artist: 'Varios Artistas', artworkUrl: 'https://placehold.co/300x300/EC4899/FFFFFF.png?text=TL', dataAiHint:"latin hits", tracks: [] },
];

const mockPopularPlaylists: Album[] = [
  { id: 'popPl1', title: 'Global Top 50', artist: 'Spotify', artworkUrl: 'https://placehold.co/300x300/3B82F6/FFFFFF.png?text=GT50', dataAiHint:"global charts", tracks: [
    { id: 'gt1', title: 'Top Hit Global', artist: 'Global Star', album: 'Global Top 50', duration: 210, artworkUrl: 'https://placehold.co/50x50/3B82F6/FFFFFF.png?text=THG', dataAiHint:"pop hit", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
    { id: 'gt2', title: 'World Anthem', artist: 'United Singers', album: 'Global Top 50', duration: 190, artworkUrl: 'https://placehold.co/50x50/3B82F6/FFFFFF.png?text=WA', dataAiHint:"world music", audioSrc:"/audio/synthwave-nostalgia.mp3" },
  ] },
  { id: 'popPl2', title: 'Chill Hits', artist: 'Apple Music', artworkUrl: 'https://placehold.co/300x300/6D28D9/FFFFFF.png?text=CH', dataAiHint:"chill playlist", tracks: [] },
  { id: 'popPl3', title: 'RapCaviar', artist: 'Spotify', artworkUrl: 'https://placehold.co/300x300/F43F5E/FFFFFF.png?text=RC', dataAiHint:"rap playlist", tracks: [] },
  { id: 'popPl4', title: 'Today\'s Top Hits', artist: 'Spotify', artworkUrl: 'https://placehold.co/300x300/FACC15/FFFFFF.png?text=TTH', dataAiHint:"top hits today", tracks: [] },
];

const mockMadeForYou: Album[] = [
  { id: 'mfy1', title: 'Daily Mix 1', artist: 'Made for You', artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=DM1', dataAiHint:"daily mix", tracks: [
     { id: 'dm1_t1', title: 'Your Vibe', artist: 'Algorithm', album: 'Daily Mix 1', duration: 190, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=YV', dataAiHint:"electronic mood", audioSrc:"/audio/electronic-background-music.mp3" },
     { id: 'dm1_t2', title: 'Personal Tune', artist: 'Algorithm', album: 'Daily Mix 1', duration: 205, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=PT', dataAiHint:"personalized music", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
  ] },
  { id: 'mfy2', title: 'Discover Weekly', artist: 'Made for You', artworkUrl: 'https://placehold.co/300x300/7058A3/FFFFFF.png?text=DW', dataAiHint:"discover weekly", tracks: [] },
  { id: 'mfy3', title: 'Release Radar', artist: 'Made for You', artworkUrl: 'https://placehold.co/300x300/1A171B/FFFFFF.png?text=RR', dataAiHint:"release radar", tracks: [] },
  { id: 'mfy4', title: 'Your Top Songs 2023', artist: 'Made for You', artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=YTS', dataAiHint:"top songs", tracks: [] },
];


const mapSpotifyTrackToAppTrack = (spotifyTrack: SpotifyTrackItem): AppTrack => ({
  id: spotifyTrack.id,
  title: spotifyTrack.name,
  artist: spotifyTrack.artists.map(artist => artist.name).join(', '),
  album: spotifyTrack.album.name,
  duration: Math.floor(spotifyTrack.duration_ms / 1000),
  artworkUrl: spotifyTrack.album.images?.[0]?.url || spotifyTrack.album.images?.[1]?.url || `https://placehold.co/300x300/cccccc/969696.png?text=${encodeURIComponent(spotifyTrack.name.substring(0,2))}`,
  audioSrc: spotifyTrack.preview_url || undefined,
  spotifyUri: spotifyTrack.uri,
  isSpotifyTrack: true,
  dataAiHint: `${spotifyTrack.name.substring(0,15)} ${spotifyTrack.artists[0]?.name.substring(0,10) || 'song'}`.toLowerCase(),
});


export default function BrowsePage() {
  const { playTrack, playPlaylist, togglePlayPause, currentTrack, isPlaying, queue, isSpotifyConnected } = usePlayer();
  const [greeting, setGreeting] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [topSpotifyTracks, setTopSpotifyTracks] = useState<AppTrack[]>([]);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const initSpotify = async () => {
      setIsLoadingSpotify(true);
      // checkAndSetupToken now happens within PlayerProvider,
      // so we rely on isSpotifyConnected from usePlayer context
      if (isSpotifyConnected) {
        try {
          const spotifyTracks = await getMyTopTracks({ limit: 6 });
          if (spotifyTracks.length > 0) {
            setTopSpotifyTracks(spotifyTracks.map(mapSpotifyTrackToAppTrack));
            setSpotifyError(null);
          } else {
            setSpotifyError("No top tracks found, or we couldn't fetch them. Try listening to more music on Spotify!");
            setTopSpotifyTracks([]);
          }
        } catch (error) {
          console.error("Error fetching Spotify tracks in component:", error);
          setSpotifyError("Failed to fetch top tracks. Your Spotify session might have expired. Please try reconnecting via Settings.");
          setTopSpotifyTracks([]);
        }
      } else {
        setSpotifyError("Connect to Spotify in Settings to see your top tracks.");
        setTopSpotifyTracks([]);
      }
      setIsLoadingSpotify(false);
    };

    // Only run initSpotify if isSpotifyConnected status is determined (not undefined)
    if (typeof isSpotifyConnected === 'boolean') {
        initSpotify();
    }
  }, [isSpotifyConnected]); // Re-run if isSpotifyConnected changes


 const handlePlayItem = (item: QuickPickItem | Album | AppTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Case 1: Single AppTrack (e.g., from Spotify top tracks or Public Library)
    if (('audioSrc' in item || 'spotifyUri' in item) && item.id && !('type' in item) && !('tracks' in item)) {
      const singleTrack = item as AppTrack;
      if (currentTrack?.id === singleTrack.id) {
        togglePlayPause();
      } else {
        playTrack(singleTrack);
      }
      return;
    }

    // Case 2: QuickPickItem or Album
    let tracksToPlay: AppTrack[] | undefined = undefined;
    let trackToPlay: AppTrack | undefined = undefined;

    if ('type' in item) { // QuickPickItem
      if (item.type === 'track' && item.track) {
        trackToPlay = item.track;
      } else if (item.tracks && item.tracks.length > 0) {
        tracksToPlay = item.tracks;
      }
    } else if ('tracks' in item && (item as Album).tracks) { // Album
      tracksToPlay = (item as Album).tracks;
    }

    const isPlayingThisSingleQuickPickTrack = trackToPlay && currentTrack?.id === trackToPlay.id;
    const isPlayingThisAlbumOrPlaylistContext = tracksToPlay && tracksToPlay.length > 0 &&
      queue.length > 0 && 
      tracksToPlay.some(t => t.id === currentTrack?.id) &&
      queue.every(qTrack => tracksToPlay!.some(itemTrack => itemTrack.id === qTrack.id)) &&
      queue.length === tracksToPlay.length;

    if ((isPlayingThisSingleQuickPickTrack && isPlaying) || (isPlayingThisAlbumOrPlaylistContext && isPlaying)) {
      togglePlayPause();
    } else if ((isPlayingThisSingleQuickPickTrack && !isPlaying) || (isPlayingThisAlbumOrPlaylistContext && !isPlaying)) {
      if (trackToPlay) playTrack(trackToPlay);
      else if (tracksToPlay && tracksToPlay.length > 0) playPlaylist(tracksToPlay, 0);
      else togglePlayPause(); 
    } else if (trackToPlay) {
      playTrack(trackToPlay);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {mockQuickPicks.map((item) => {
            let isCurrentlyActiveItem = false;
            if (currentTrack) {
              if (item.type === 'track' && item.track?.id === currentTrack.id) {
                isCurrentlyActiveItem = true;
              } else if (item.tracks && item.tracks.some(t => t.id === currentTrack.id) && queue.some(qTrack => item.tracks!.find(iTrack => iTrack.id === qTrack.id))) {
                 const currentContextMatches = queue.length === item.tracks.length && queue.every(qT => item.tracks!.some(iT => iT.id === qT.id));
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
                    item.colorClass && !item.artworkUrl.includes('placehold.co') ? item.colorClass : 'bg-card' // Apply brand color if image is not placeholder
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
      </section>

      {isLoadingSpotify ? (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Your Top Spotify Tracks</h2>
          <p className="text-muted-foreground">Loading your Spotify tracks...</p>
        </section>
      ) : spotifyError && !isSpotifyConnected ? (
         <section>
            <Card className="p-4 bg-card/80 border-border/50">
                <CardTitle className="text-foreground text-lg flex items-center">
                    <SpotifyIcon className="w-6 h-6 mr-2 text-green-500" /> Connect to Spotify
                </CardTitle>
                <CardContent className="text-muted-foreground pt-2 text-sm">
                    <p>{spotifyError}</p>
                    <Link href="/settings" passHref>
                       <Button variant="link" className="px-0 text-primary hover:text-primary/80">Go to Settings to connect</Button>
                    </Link>
                </CardContent>
            </Card>
        </section>
      ) : spotifyError ? (
         <section>
            <Card className="p-4 bg-destructive/10 border-destructive/30">
                <CardTitle className="text-destructive text-lg">Spotify Error</CardTitle>
                <CardContent className="text-destructive/90 pt-2 text-sm">
                    <p>{spotifyError}</p>
                </CardContent>
            </Card>
        </section>
      ) : topSpotifyTracks.length > 0 ? (
        <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
                <SpotifyIcon className="w-7 h-7 mr-2 text-green-500" /> Your Top Spotify Tracks
              </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {topSpotifyTracks.map((track) => {
               const isCurrentlyActiveItem = track.id === currentTrack?.id;
              return (
              <Card key={track.id} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => handlePlayItem(track)}>
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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Your Top Spotify Tracks</h2>
          <p className="text-muted-foreground">No top tracks to display. Listen to more music on Spotify!</p>
        </section>
      )}

       <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
              <LibraryIcon className="w-7 h-7 mr-2 text-accent" /> Tu Colección Pública (Hi-Fi)
            </h2>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
          {mockPublicLibraryTracks.map((track) => {
             const isCurrentlyActiveItem = track.id === currentTrack?.id;
            return (
            <Card key={track.id} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => handlePlayItem(track)}>
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

      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Viernes de lanzamientos</h2>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
          {mockNewReleaseAlbums.map((album) => {
             const isCurrentlyActiveItem = album.tracks?.some(track => track.id === currentTrack?.id) && 
                                           queue.some(qTrack => album.tracks?.find(iTrack => iTrack.id === qTrack.id)) &&
                                           queue.length === (album.tracks?.length || 0) && 
                                           album.tracks.every(aTrack => queue.some(qTrack => qTrack.id === aTrack.id));
             const canPlay = album.tracks && album.tracks.length > 0;
            return (
            <Card key={album.id} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => canPlay && handlePlayItem(album)}>
                <CardContent className="p-0">
                    <Image
                    src={album.artworkUrl}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                    data-ai-hint={album.dataAiHint}
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

       <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Popular Playlists</h2>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link>
        </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
          {mockPopularPlaylists.map((playlist) => {
             const isCurrentlyActiveItem = playlist.tracks?.some(track => track.id === currentTrack?.id) && 
                                            queue.some(qTrack => playlist.tracks?.find(iTrack => iTrack.id === qTrack.id)) &&
                                            queue.length === (playlist.tracks?.length || 0) &&
                                            playlist.tracks.every(pTrack => queue.some(qTrack => qTrack.id === pTrack.id));
             const canPlay = playlist.tracks && playlist.tracks.length > 0;
            return(
            <Card key={playlist.id} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => canPlay && handlePlayItem(playlist)}>
              <CardContent className="p-0">
                <Image
                  src={playlist.artworkUrl}
                  alt={playlist.title}
                  width={300}
                  height={300}
                  className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                  data-ai-hint={playlist.dataAiHint}
                />
              </CardContent>
              <div className="p-3">
                <CardTitle className="text-sm font-semibold truncate text-foreground">{playlist.title}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{playlist.artist}</p>
              </div>
              {canPlay && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-[calc(25%+0.75rem)] right-3 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                    onClick={(e) => handlePlayItem(playlist, e)}
                    aria-label={`Play ${playlist.title}`}
                    >
                    {(isCurrentlyActiveItem && isPlaying) ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
              )}
            </Card>
            );
            })}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Made For You</h2>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Mostrar todo</Link>
        </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
          {mockMadeForYou.map((album) => {
            const isCurrentlyActiveItem = album.tracks?.some(track => track.id === currentTrack?.id) && 
                                          queue.some(qTrack => album.tracks?.find(iTrack => iTrack.id === qTrack.id)) &&
                                          queue.length === (album.tracks?.length || 0) &&
                                          album.tracks.every(aTrack => queue.some(qTrack => qTrack.id === aTrack.id));
            const canPlay = album.tracks && album.tracks.length > 0;
            return (
            <Card key={album.id} className="group relative overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg cursor-pointer" onClick={() => canPlay && handlePlayItem(album)}>
              <CardContent className="p-0">
                <Image
                  src={album.artworkUrl}
                  alt={album.title}
                  width={300}
                  height={300}
                  className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                  data-ai-hint={album.dataAiHint}
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

      