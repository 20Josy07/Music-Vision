import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListMusic, Music2 } from 'lucide-react';

interface PlaylistCardProps {
  name: string;
  songCount: number;
  imageUrl?: string;
  description?: string;
  dataAiHint?: string;
}

export function PlaylistCard({ name, songCount, imageUrl, description, dataAiHint = "playlist cover" }: PlaylistCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-square relative bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name || 'Playlist cover'}
              layout="fill"
              objectFit="cover"
              data-ai-hint={dataAiHint}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ListMusic className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg truncate" title={name}>{name || "Untitled Playlist"}</CardTitle>
        <CardDescription className="text-sm">
          {songCount} {songCount === 1 ? 'song' : 'songs'}
        </CardDescription>
        {description && <p className="text-xs text-muted-foreground mt-1 truncate" title={description}>{description}</p>}
      </CardContent>
    </Card>
  );
}
