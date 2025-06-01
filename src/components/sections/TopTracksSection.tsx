
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Track } from '@/lib/types';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useEffect, useState } from 'react';
import { getMyTopTracks } from '@/services/spotifyService';
import type { SpotifyTrackItem } from '@/types/spotify';
import { SpotifyIcon } from '@/components/common/SpotifyIcon';

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

export function TopTracksSection() {
  const { playTrack, togglePlayPause, currentTrack, isPlaying, isSpotifyConnected } = usePlayer();
  const [topSpotifyTracks, setTopSpotifyTracks] = useState<Track[]>([]);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(true);

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
            setSpotifyError("No top tracks found from Spotify.");
            setTopSpotifyTracks([]);
          }
        } catch (error) {
          console.error("Error fetching Spotify tracks:", error);
          setSpotifyError("Failed to load your top tracks. Try reconnecting Spotify in Settings.");
          setTopSpotifyTracks([]);
        }
      } else {
        setSpotifyError("Connect Spotify in Settings to see your top tracks.");
        setTopSpotifyTracks([]);
      }
      setIsLoadingSpotify(false);
    };
     if (typeof isSpotifyConnected === 'boolean') { // Ensure isSpotifyConnected has been initialized
        initSpotify();
    }
  }, [isSpotifyConnected]);

  const handlePlayItem = (track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTrack?.id === track.id && currentTrack.source === track.source) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <section>
      {isLoadingSpotify ? (
        <>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Your Top Tracks (Spotify)</h2>
          <p className="text-gray-400">Loading your Spotify tracks...</p>
        </>
      ) : spotifyError && !isSpotifyConnected ? (
        <Card className="p-4 bg-gray-800/60 border-gray-700/50 backdrop-blur-sm">
            <CardTitle className="text-foreground text-lg flex items-center">
                <SpotifyIcon className="w-6 h-6 mr-2 text-green-500" /> Connect to Spotify
            </CardTitle>
            <CardContent className="text-gray-400 pt-2 text-sm">
                <p>{spotifyError}</p>
                <Link href="/settings" passHref>
                   <Button variant="link" className="px-0 text-blue-400 hover:text-blue-300">Go to Settings to connect</Button>
                </Link>
            </CardContent>
        </Card>
      ) : spotifyError ? (
        <Card className="p-4 bg-red-900/30 border-red-700/50 backdrop-blur-sm">
            <CardTitle className="text-red-400 text-lg">Spotify Error</CardTitle>
            <CardContent className="text-red-400/90 pt-2 text-sm">
                <p>{spotifyError}</p>
            </CardContent>
        </Card>
      ) : topSpotifyTracks.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center">
                <SpotifyIcon className="w-7 h-7 mr-2 text-green-500" /> Your Top Tracks
              </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
            {topSpotifyTracks.map((track) => {
              const isCurrentlyActiveItem = track.id === currentTrack?.id && track.source === currentTrack?.source;
              return (
              <Card 
                key={`${track.source}-${track.id}`} 
                className="group relative overflow-hidden shadow-lg hover:shadow-emerald-500/30 transition-shadow duration-300 bg-gray-800/60 backdrop-blur-sm rounded-lg cursor-pointer border-gray-700/50" 
                onClick={() => handlePlayItem(track)}
              >
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
                  <CardTitle className="text-base font-semibold truncate text-foreground">{track.title}</CardTitle>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-[calc(25%+0.75rem)] right-3 bg-emerald-500/90 hover:bg-emerald-400 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Your Top Tracks (Spotify)</h2>
          <p className="text-gray-400">No top tracks to display. Listen to more music on Spotify!</p>
        </>
      )}
    </section>
  );
}
