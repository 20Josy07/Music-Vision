
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Album } from '@/lib/types';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

const mockUserAlbums: Album[] = [
  { id: 'userAlbum1', title: 'My Favorite Hits', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=MFH', dataAiHint:"music collage", tracks: [
    { id: 't1', title: 'City Lights', artist: 'Synthwave Dreams', album: 'Neon Future', duration: 180, artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=CL', dataAiHint:"neon future" },
    { id: 't2', title: 'Retro Drive', artist: 'Synthwave Dreams', album: 'Neon Future', duration: 220, artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=RD', dataAiHint:"neon future" },
  ]},
  { id: 'userAlbum2', title: 'Road Trip Anthems', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/7058A3/FFFFFF.png?text=RTA', dataAiHint:"road trip", tracks: []},
  { id: 'userAlbum3', title: 'Classical Piano Pieces', artist: 'Various Artists', artworkUrl: 'https://placehold.co/300x300/1A171B/FFFFFF.png?text=CPP', dataAiHint:"piano classical", tracks: []},
];

export default function AlbumsPage() {
  const { playPlaylist } = usePlayer();

  const handlePlayAlbum = (album: Album) => {
    if (album.tracks.length > 0) {
      playPlaylist(album.tracks);
    } else {
      console.log("This album has no tracks to play.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-foreground mb-6">My Albums</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {mockUserAlbums.map((album) => (
          <Card key={album.id} className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
              <Image
                src={album.artworkUrl}
                alt={album.title}
                width={300}
                height={300}
                className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={album.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-md font-semibold truncate text-foreground">{album.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground truncate">{album.artist}</CardDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handlePlayAlbum(album)}
                aria-label={`Play ${album.title}`}
              >
                <Play className="h-5 w-5 fill-current" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

