
"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  dataAiHint: string;
}

interface MusicListProps {
  type: "recent" | "playlists" | "albums";
}

export function MusicList({ type }: MusicListProps) {
  const items: MusicItem[] = getMusicItems(type);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/player/${item.id}`} // Assuming this route resolves correctly within the app group
          className="group relative rounded-md overflow-hidden transition-all duration-300 hover:scale-105"
        >
          <div className="aspect-square relative">
            <Image 
              src={item.cover} 
              alt={item.title} 
              fill 
              className="object-cover"
              data-ai-hint={item.dataAiHint}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            <h3 className="font-medium truncate text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{item.artist}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function getMusicItems(type: "recent" | "playlists" | "albums"): MusicItem[] {
  const recentItems: MusicItem[] = [
    { id: "1", title: "After Hours", artist: "The Weeknd", cover: "https://placehold.co/300x300/C7254E/FFFFFF.png?text=AH", dataAiHint: "pop rnb" },
    { id: "2", title: "Future Nostalgia", artist: "Dua Lipa", cover: "https://placehold.co/300x300/7058A3/FFFFFF.png?text=FN", dataAiHint: "pop disco" },
    { id: "3", title: "Un Verano Sin Ti", artist: "Bad Bunny", cover: "https://placehold.co/300x300/1A171B/FFFFFF.png?text=UV", dataAiHint: "latin reggaeton" },
    { id: "4", title: "YHLQMDLG", artist: "Bad Bunny", cover: "https://placehold.co/300x300/F97316/FFFFFF.png?text=YB", dataAiHint: "latin trap" },
    { id: "5", title: "El Último Tour Del Mundo", artist: "Bad Bunny", cover: "https://placehold.co/300x300/3B82F6/FFFFFF.png?text=ET", dataAiHint: "latin rock" },
    { id: "6", title: "Motomami", artist: "Rosalía", cover: "https://placehold.co/300x300/E11D48/FFFFFF.png?text=MM", dataAiHint: "flamenco experimental" },
  ];

  const playlistItems: MusicItem[] = [
    { id: "7", title: "Mis Favoritas", artist: "Tu colección", cover: "https://placehold.co/300x300/10B981/FFFFFF.png?text=MF", dataAiHint: "playlist favorites" },
    { id: "8", title: "Éxitos Latinos", artist: "Playlist", cover: "https://placehold.co/300x300/F2711C/FFFFFF.png?text=EL", dataAiHint: "latin hits" },
    { id: "9", title: "Clásicos del Rock", artist: "Playlist", cover: "https://placehold.co/300x300/C7254E/FFFFFF.png?text=CR", dataAiHint: "rock classics" },
    { id: "10", title: "Para Entrenar", artist: "Playlist", cover: "https://placehold.co/300x300/7058A3/FFFFFF.png?text=PE", dataAiHint: "workout gym" },
    { id: "11", title: "Relax", artist: "Playlist", cover: "https://placehold.co/300x300/1A171B/FFFFFF.png?text=RX", dataAiHint: "relax chill" },
    { id: "12", title: "Fiesta", artist: "Playlist", cover: "https://placehold.co/300x300/F97316/FFFFFF.png?text=FS", dataAiHint: "party playlist" },
  ];

  const albumItems: MusicItem[] = [
    { id: "13", title: "Parachutes", artist: "Coldplay", cover: "https://placehold.co/300x300/3B82F6/FFFFFF.png?text=CP", dataAiHint: "alternative rock" },
    { id: "14", title: "Thriller", artist: "Michael Jackson", cover: "https://placehold.co/300x300/E11D48/FFFFFF.png?text=MJ", dataAiHint: "pop king" },
    { id: "15", title: "Nevermind", artist: "Nirvana", cover: "https://placehold.co/300x300/10B981/FFFFFF.png?text=NV", dataAiHint: "grunge rock" },
    { id: "16", title: "The Dark Side of the Moon", artist: "Pink Floyd", cover: "https://placehold.co/300x300/F2711C/FFFFFF.png?text=PF", dataAiHint: "progressive rock" },
    { id: "17", title: "Back in Black", artist: "AC/DC", cover: "https://placehold.co/300x300/C7254E/FFFFFF.png?text=AC", dataAiHint: "hard rock" },
    { id: "18", title: "Abbey Road", artist: "The Beatles", cover: "https://placehold.co/300x300/7058A3/FFFFFF.png?text=TB", dataAiHint: "classic rock" },
  ];

  switch (type) {
    case "recent":
      return recentItems;
    case "playlists":
      return playlistItems;
    case "albums":
      return albumItems;
    default:
      // Fallback to recent items or an empty array if preferred
      return recentItems; 
  }
}
