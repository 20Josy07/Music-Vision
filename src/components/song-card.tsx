import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2 } from 'lucide-react';

interface SongCardProps {
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export function SongCard({ title, artist, album, imageUrl, dataAiHint = "music album" }: SongCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-square relative bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title || 'Song artwork'}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dataAiHint}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Music2 className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg truncate" title={title}>{title || "Untitled Song"}</CardTitle>
        <CardDescription className="truncate" title={artist}>{artist || "Unknown Artist"}</CardDescription>
        {album && <p className="text-xs text-muted-foreground truncate mt-1" title={album}>{album}</p>}
      </CardContent>
    </Card>
  );
}
