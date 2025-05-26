
"use client";

import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Artist } from '@/lib/types';
import Link from 'next/link';

const mockUserArtists: Artist[] = [
  { id: 'artist1', name: 'Synthwave Dreams', artworkUrl: 'https://placehold.co/150x150/C7254E/FFFFFF.png?text=SD', dataAiHint:"musician portrait", albums: [] },
  { id: 'artist2', name: 'Willow Creek', artworkUrl: 'https://placehold.co/150x150/7058A3/FFFFFF.png?text=WC', dataAiHint:"singer songwriter", albums: [] },
  { id: 'artist3', name: 'Chillhop Cafe', artworkUrl: 'https://placehold.co/150x150/1A171B/FFFFFF.png?text=CC', dataAiHint:"dj producer", albums: [] },
  { id: 'artist4', name: 'Orchestral Wonders', artworkUrl: 'https://placehold.co/150x150/C7254E/FFFFFF.png?text=OW', dataAiHint:"conductor orchestra", albums: [] },
];

export default function ArtistsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-foreground mb-6">My Artists</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {mockUserArtists.map((artist) => (
          <Link key={artist.id} href={`/artist/${artist.id}`} passHref>
            <Card className="group overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 text-center cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center">
                <Image
                  src={artist.artworkUrl}
                  alt={artist.name}
                  width={150}
                  height={150}
                  className="rounded-full aspect-square object-cover mb-4 transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={artist.dataAiHint}
                />
                <CardTitle className="text-md font-semibold truncate text-foreground">{artist.name}</CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
