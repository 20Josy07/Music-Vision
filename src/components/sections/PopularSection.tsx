
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Track } from '@/lib/types';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { usePlayer } from '@/contexts/PlayerContext';


interface QuickPickItem {
  id: string;
  title: string;
  artist?: string;
  artworkUrl: string;
  dataAiHint: string;
  type: 'album' | 'playlist' | 'track';
  tracks?: Track[]; // For albums/playlists
  track?: Track; // For single tracks
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


export function PopularSection() {
  const { playTrack, playPlaylist, togglePlayPause, currentTrack, isPlaying, queue } = usePlayer();

  const handlePlayItem = (item: QuickPickItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let trackToPlayDirectly: Track | undefined = undefined;
    if (item.type === 'track' && item.track) {
        trackToPlayDirectly = item.track;
    }
    
    if (trackToPlayDirectly) {
        if (currentTrack?.id === trackToPlayDirectly.id && currentTrack.source === trackToPlayDirectly.source) {
            togglePlayPause();
        } else {
            playTrack(trackToPlayDirectly);
        }
        return;
    }

    const tracksToPlay = item.tracks;
    if (tracksToPlay && tracksToPlay.length > 0) {
        let isPlayingThisAlbumOrPlaylistContext = false;
        if (currentTrack && queue.length > 0) {
            const currentAlbumSource = tracksToPlay[0].source;
            if (currentTrack.source === currentAlbumSource && tracksToPlay.some(t => t.id === currentTrack.id)) {
                isPlayingThisAlbumOrPlaylistContext = queue.length === tracksToPlay.length &&
                    queue.every(qTrack => tracksToPlay!.some(itemTrack => itemTrack.id === qTrack.id && itemTrack.source === qTrack.source));
            }
        }

        if (isPlayingThisAlbumOrPlaylistContext && isPlaying) {
            togglePlayPause();
        } else if (isPlayingThisAlbumOrPlaylistContext && !isPlaying) {
             playPlaylist(tracksToPlay, tracksToPlay.findIndex(t => t.id === currentTrack?.id)); // Resume from current track in context
        } else {
            playPlaylist(tracksToPlay, 0);
        }
    } else {
      console.log("Item has no tracks to play or action determined:", item.title);
    }
  };


  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Popular</h2>
        <Button variant="link" asChild className="text-sm text-muted-foreground hover:text-primary">
          <Link href="/library/songs">View All</Link>
        </Button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex space-x-4 pb-4">
          {mockPopularItems.map((item) => {
            const isActive = (item.type === 'track' && item.track?.id === currentTrack?.id && item.track.source === currentTrack.source) ||
                             (item.tracks && item.tracks.some(t => t.id === currentTrack?.id && t.source === currentTrack.source));
            const canPlay = (item.type === 'track' && item.track) || (item.tracks && item.tracks.length > 0);
            return(
            <Card
              key={item.id}
              className="group relative w-40 min-w-40 sm:w-44 sm:min-w-44 overflow-hidden shadow-lg hover:shadow-blue-500/30 transition-all duration-300 bg-gray-800/60 backdrop-blur-sm rounded-lg cursor-pointer border-gray-700/50"
              onClick={() => canPlay && handlePlayItem(item)}
            >
              <CardContent className="p-0">
                <Image
                  src={item.artworkUrl}
                  alt={item.title}
                  width={180}
                  height={180}
                  className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                  data-ai-hint={item.dataAiHint}
                />
              </CardContent>
              <div className="p-3">
                <p className="text-base font-semibold truncate text-foreground">{item.title}</p>
                {item.artist && <p className="text-sm text-gray-400 truncate">{item.artist}</p>}
              </div>
              {canPlay && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-[calc(25%+0.6rem)] right-2.5 bg-blue-500/90 hover:bg-blue-400 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1/2 group-hover:translate-y-0"
                  onClick={(e) => handlePlayItem(item, e)}
                  aria-label={`Play ${item.title}`}
                >
                  {(isActive && isPlaying) ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
              )}
            </Card>
          )})}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
