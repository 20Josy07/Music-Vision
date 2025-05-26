"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/song-card';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
}

// Mock song data
const mockSongs: Song[] = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', imageUrl: 'https://placehold.co/300x300.png', },
  { id: '2', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', imageUrl: 'https://placehold.co/300x300.png', },
  { id: '3', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', imageUrl: 'https://placehold.co/300x300.png', },
  { id: '4', title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', imageUrl: 'https://placehold.co/300x300.png', },
  { id: '5', title: 'Yesterday', artist: 'The Beatles', album: 'Help!', imageUrl: 'https://placehold.co/300x300.png', },
  { id: '6', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', imageUrl: 'https://placehold.co/300x300.png', },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search or search on button click
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    // Simulate API call
    setTimeout(() => {
      const filteredSongs = mockSongs.filter(
        song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.album.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredSongs);
      setIsLoading(false);
    }, 1000);
  };
  
  // useEffect to handle initial placeholder state correctly
  const [initialPlaceholder, setInitialPlaceholder] = useState("Search by title, artist, or genre...");
  useEffect(() => {
    // This ensures that if Math.random() was used for placeholder, it's client-side only
    // For now, static placeholder is fine.
  }, []);


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <SearchIcon className="h-8 w-8 text-primary" />
            Discover Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="search"
              placeholder={initialPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-grow text-base"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="text-base px-6">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              <span className="ml-2 sr-only sm:not-sr-only">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
             <Card key={index} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && searchResults.length === 0 && (
        <div className="text-center py-10">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No songs found</h3>
          <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                album={song.album}
                imageUrl={song.imageUrl}
                dataAiHint="music album"
              />
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && !hasSearched && (
         <div className="text-center py-10 text-muted-foreground">
          <Music2 className="mx-auto h-12 w-12 mb-4" />
          <p>Search for your favorite songs, artists, or genres to get started.</p>
        </div>
      )}
    </div>
  );
}
