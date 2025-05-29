
"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/lib/types";
import { Play, Pause, MoreHorizontal, Filter } from "lucide-react"; // Added Filter icon
import Image from "next/image";

const mockSongs: Track[] = [
  { id: 's1', title: 'Starry Night', artist: 'Cosmic Voyager', album: 'Galactic Dreams', duration: 210, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=SN', dataAiHint:"starry night", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
  { id: 's2', title: 'Urban Flow', artist: 'Metro Beats', album: 'City Rhythms', duration: 190, artworkUrl: 'https://placehold.co/50x50/7058A3/FFFFFF.png?text=UF', dataAiHint:"urban city", audioSrc:"/audio/electronic-background-music.mp3" },
  { id: 's3', title: 'Peaceful Meadow', artist: 'Nature Sounds', album: 'Serene Landscapes', duration: 300, artworkUrl: 'https://placehold.co/50x50/1A171B/FFFFFF.png?text=PM', dataAiHint:"meadow nature", audioSrc:"/audio/synthwave-nostalgia.mp3" },
];

export default function SongsPage() {
  const { playTrack, togglePlayPause, currentTrack, isPlaying } = usePlayer();

  const handlePlaySong = (song: Track) => {
    if (currentTrack?.id === song.id) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-foreground">All Songs</h1>
        <Button variant="outline"> {/* Changed variant for better hierarchy and added icon */}
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="space-y-2">
        {mockSongs.map((song) => (
          <Card key={song.id} className="flex items-center p-3 pr-4 hover:bg-muted/50 transition-colors group">
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 h-10 w-10"
              onClick={() => handlePlaySong(song)}
            >
              {currentTrack?.id === song.id && isPlaying ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary" />}
            </Button>
            <Image src={song.artworkUrl} alt={song.title} width={40} height={40} className="rounded aspect-square object-cover" data-ai-hint={song.dataAiHint}/>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block truncate mx-4 w-1/4">{song.album}</p>
            <p className="text-sm text-muted-foreground w-16 text-right tabular-nums">
              {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
            </p>
            <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
