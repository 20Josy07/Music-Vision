
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Radio as RadioIcon } from 'lucide-react'; // Added RadioIcon
import { Button } from '@/components/ui/button';
// import { usePlayer } from '@/contexts/PlayerContext'; // Uncomment if connecting to player

interface MockRadioStation {
  id: string;
  name: string;
  genre: string;
  artworkUrl: string;
  dataAiHint: string;
  description?: string;
}

const mockRadioStations: MockRadioStation[] = [
  { 
    id: 'station1', 
    name: 'Chill Vibes FM', 
    genre: 'Lo-Fi & Chillhop', 
    artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=CV', 
    dataAiHint:"lofi radio",
    description: 'Your 24/7 source for relaxing beats and study music.'
  },
  { 
    id: 'station2', 
    name: 'Retro Rewind', 
    genre: '80s & 90s Hits', 
    artworkUrl: 'https://placehold.co/300x300/7058A3/FFFFFF.png?text=RR', 
    dataAiHint:"retro music",
    description: 'All the classic hits from the 80s and 90s.'
  },
  { 
    id: 'station3', 
    name: 'Indie Spirit', 
    genre: 'Alternative & Indie Rock', 
    artworkUrl: 'https://placehold.co/300x300/1A171B/FFFFFF.png?text=IS', 
    dataAiHint:"indie rock",
    description: 'Discover the best new and classic indie tracks.'
  },
  { 
    id: 'station4', 
    name: 'Electronic Pulse', 
    genre: 'EDM & House', 
    artworkUrl: 'https://placehold.co/300x300/F97316/FFFFFF.png?text=EP', 
    dataAiHint:"electronic dance",
    description: 'The hottest EDM, house, and dance tracks.'
  },
  { 
    id: 'station5', 
    name: 'Classical Focus', 
    genre: 'Classical Music', 
    artworkUrl: 'https://placehold.co/300x300/3B82F6/FFFFFF.png?text=CF', 
    dataAiHint:"classical piano",
    description: 'Timeless classical pieces for concentration and relaxation.'
  },
  { 
    id: 'station6', 
    name: 'Latin Heat Radio', 
    genre: 'Reggaeton & Latin Pop', 
    artworkUrl: 'https://placehold.co/300x300/E11D48/FFFFFF.png?text=LH', 
    dataAiHint:"latin party",
    description: 'Siente el calor con los mejores ritmos latinos.'
  },
];

export default function RadioPage() {
  // const { playTrack } = usePlayer(); // Placeholder for future use

  const handlePlayStation = (station: MockRadioStation) => {
    console.log("Playing station:", station.name);
    // In a real scenario, this would interact with the player context
    // e.g., playTrack({ id: station.id, title: station.name, artist: 'Radio', album: station.genre, duration: 0, artworkUrl: station.artworkUrl, audioSrc: 'STREAM_URL_HERE' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <RadioIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">Radio Stations</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockRadioStations.map((station) => (
          <Card 
            key={station.id} 
            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card rounded-lg"
          >
            <CardHeader className="p-0">
              <Image
                src={station.artworkUrl}
                alt={station.name}
                width={300}
                height={300}
                className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                data-ai-hint={station.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-md font-semibold truncate text-foreground">{station.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground truncate">{station.genre}</CardDescription>
              {/* Optional: Add a short description if available */}
              {/* {station.description && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{station.description}</p>} */}
            </CardContent>
            <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handlePlayStation(station)}
                aria-label={`Play ${station.name}`}
              >
                <Play className="h-5 w-5 fill-current" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
