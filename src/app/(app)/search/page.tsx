
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Music, Users, Disc } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import type { Track, Album, Artist } from "@/lib/types";

const mockSearchTracks: Track[] = [
    { id: 'st1', title: 'Found Melodies', artist: 'Searcher', album: 'Discoveries', duration: 180, artworkUrl: 'https://placehold.co/80x80/C7254E/FFFFFF.png?text=FM', dataAiHint:"music notes" },
];
const mockSearchAlbums: Album[] = [
    { id: 'sa1', title: 'Search Results Vol. 1', artist: 'Various Search Artists', artworkUrl: 'https://placehold.co/150x150/7058A3/FFFFFF.png?text=SR1', dataAiHint:"abstract album", tracks: [] },
];
const mockSearchArtists: Artist[] = [
    { id: 'sar1', name: 'The Queriers', artworkUrl: 'https://placehold.co/100x100/1A171B/FFFFFF.png?text=TQ', dataAiHint:"band photo", albums: [] },
];


export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<{ tracks: Track[], albums: Album[], artists: Artist[] } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    // Mock search results
    setResults({
      tracks: mockSearchTracks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.artist.toLowerCase().includes(searchTerm.toLowerCase())),
      albums: mockSearchAlbums.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.artist.toLowerCase().includes(searchTerm.toLowerCase())),
      artists: mockSearchArtists.filter(ar => ar.name.toLowerCase().includes(searchTerm.toLowerCase())),
    });
  };

  return (
    <div className="space-y-8">
      {/* Search input is now in Header, this page shows results */}
      {/* This is a conceptual placeholder. Actual search input is in Header.tsx */}
      {/* <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="search"
          placeholder="Search songs, albums, artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit"><SearchIcon className="mr-2 h-4 w-4" /> Search</Button>
      </form> */}
      
      {!results && (
        <div className="text-center py-10 text-muted-foreground">
          <SearchIcon className="mx-auto h-16 w-16 mb-4" />
          <p>Search for your favorite music.</p>
          <p className="text-sm">Type in the search bar above to begin.</p>
        </div>
      )}

      {results && (
        <>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Music className="mr-3 h-6 w-6 text-primary"/> Tracks</h2>
            {results.tracks.length > 0 ? results.tracks.map(track => (
              <Card key={track.id} className="mb-3 flex items-center p-3 hover:bg-muted/50 transition-colors">
                <Image src={track.artworkUrl} alt={track.title} width={50} height={50} className="rounded mr-4" data-ai-hint={track.dataAiHint}/>
                <div>
                  <p className="font-medium text-foreground">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{track.artist} &bull; {track.album}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto"><Play className="h-5 w-5" /></Button>
              </Card>
            )) : <p className="text-muted-foreground">No tracks found.</p>}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Disc className="mr-3 h-6 w-6 text-primary"/> Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.albums.length > 0 ? results.albums.map(album => (
                <Card key={album.id} className="group">
                  <CardHeader className="p-0 relative">
                    <Image src={album.artworkUrl} alt={album.title} width={200} height={200} className="rounded-t-md aspect-square object-cover" data-ai-hint={album.dataAiHint}/>
                     <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Play className="h-4 w-4 fill-current"/></Button>
                  </CardHeader>
                  <CardContent className="p-3">
                    <CardTitle className="text-sm font-medium truncate">{album.title}</CardTitle>
                    <CardDescription className="text-xs truncate">{album.artist}</CardDescription>
                  </CardContent>
                </Card>
              )) : <p className="text-muted-foreground col-span-full">No albums found.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Users className="mr-3 h-6 w-6 text-primary"/> Artists</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.length > 0 ? results.artists.map(artist => (
                    <Card key={artist.id} className="text-center p-3">
                        <Image src={artist.artworkUrl} alt={artist.name} width={80} height={80} className="rounded-full mx-auto mb-2" data-ai-hint={artist.dataAiHint}/>
                        <p className="font-medium text-sm text-foreground truncate">{artist.name}</p>
                    </Card>
                )) : <p className="text-muted-foreground col-span-full">No artists found.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
