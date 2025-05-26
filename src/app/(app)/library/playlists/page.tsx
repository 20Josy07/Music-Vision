
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Playlist, Track } from "@/lib/types";
import { ListMusic, Play, PlusSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockUserPlaylists: Playlist[] = [
  { id: 'pl1', name: 'Evening Chill', description: 'Relaxing tunes for a calm evening.', artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=EC', dataAiHint:"evening relax", owner: 'User', tracks: [
    { id: 's1', title: 'Starry Night', artist: 'Cosmic Voyager', album: 'Galactic Dreams', duration: 210, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=SN', dataAiHint:"starry night" },
    { id: 's3', title: 'Peaceful Meadow', artist: 'Nature Sounds', album: 'Serene Landscapes', duration: 300, artworkUrl: 'https://placehold.co/50x50/1A171B/FFFFFF.png?text=PM', dataAiHint:"meadow nature" },
  ]},
  { id: 'pl2', name: 'Morning Focus', description: 'Instrumental tracks to boost productivity.', artworkUrl: 'https://placehold.co/300x300/7058A3/FFFFFF.png?text=MF', dataAiHint:"morning focus", owner: 'User', tracks: [] },
  { id: 'pl3', name: 'Workout Power', description: 'High-energy beats for your workout session.', artworkUrl: 'https://placehold.co/300x300/1A171B/FFFFFF.png?text=WP', dataAiHint:"workout gym", owner: 'User', tracks: [] },
];


export default function PlaylistsPage() {
  const { playPlaylist } = usePlayer();

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      playPlaylist(playlist.tracks);
    } else {
      console.log("This playlist is empty.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-foreground">My Playlists</h1>
        <Button variant="outline">
          <PlusSquare className="mr-2 h-4 w-4"/> Create Playlist
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockUserPlaylists.map((playlist) => (
          <Card key={playlist.id} className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Link href={`/playlists/${playlist.id}`} passHref>
              <CardHeader className="p-0 cursor-pointer">
                 <Image
                  src={playlist.artworkUrl || 'https://placehold.co/300x300/CCCCCC/969696.png?text=No+Art'}
                  alt={playlist.name}
                  width={300}
                  height={300}
                  className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={playlist.artworkUrl ? playlist.dataAiHint : "music abstract"}
                />
              </CardHeader>
            </Link>
            <CardContent className="p-4">
              <Link href={`/playlists/${playlist.id}`} passHref>
                <CardTitle className="text-md font-semibold truncate text-foreground cursor-pointer hover:underline">{playlist.name}</CardTitle>
              </Link>
              <CardDescription className="text-sm text-muted-foreground truncate h-10">{playlist.description || 'No description.'}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-4 right-4 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={() => handlePlayPlaylist(playlist)}
                  aria-label={`Play ${playlist.name}`}
                >
                  <Play className="h-5 w-5 fill-current" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
