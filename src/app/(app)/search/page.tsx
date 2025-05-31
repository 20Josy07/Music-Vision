
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/lib/types";
import { searchJamendoTracks } from "@/services/jamendoService";
import { Loader2, Music, Play, Pause, Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function SearchPage() {
  const { playTrack, togglePlayPause, currentTrack, isPlaying, playPlaylist, queue } = usePlayer();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tracks = await searchJamendoTracks(searchTerm);
      setSearchResults(tracks);
    } catch (e: any) {
      setError("Failed to fetch search results. Please try again.");
      console.error("Search error:", e);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query || '');
  }, [query, performSearch]);

  const handlePlayTrack = (track: Track, index: number) => {
    // If this specific track is already current and playing, toggle pause
    if (currentTrack?.id === track.id && currentTrack.source === track.source) {
      togglePlayPause();
    } else {
      // Play this track as part of the current search results queue
      playPlaylist(searchResults, index);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Searching for &quot;{query}&quot;...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <SearchIcon className="mx-auto h-16 w-16 mb-4" />
        <p>Enter a search term above to find music.</p>
      </div>
    );
  }

  if (searchResults.length === 0 && query) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <SearchIcon className="mx-auto h-16 w-16 mb-4" />
        <p>No results found for &quot;{query}&quot;.</p>
        <p className="text-sm">Try a different search term or check your spelling.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
          <Music className="mr-3 h-6 w-6 text-primary"/> Tracks
        </h2>
        <div className="space-y-2">
          {searchResults.map((track, index) => {
            const isCurrentlyPlayingThisTrack = currentTrack?.id === track.id && currentTrack.source === track.source && isPlaying;
            const isCurrentContextThisTrack = currentTrack?.id === track.id && currentTrack.source === track.source;
            
            return (
              <Card 
                key={`${track.id}-${track.source}`} 
                className="flex items-center p-3 pr-4 hover:bg-muted/50 transition-colors group cursor-pointer"
                onDoubleClick={() => handlePlayTrack(track, index)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-3 h-10 w-10"
                  onClick={() => handlePlayTrack(track, index)}
                  aria-label={isCurrentlyPlayingThisTrack ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {isCurrentlyPlayingThisTrack ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary" />}
                </Button>
                <Image 
                  src={track.artworkUrl || 'https://placehold.co/50x50/cccccc/969696.png?text=??'} 
                  alt={track.title} 
                  width={40} 
                  height={40} 
                  className="rounded aspect-square object-cover" 
                  data-ai-hint={track.dataAiHint || 'song artwork'}
                />
                <div className="ml-4 flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrentContextThisTrack ? 'text-primary' : 'text-foreground'}`}>{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <p className="text-sm text-muted-foreground hidden md:block truncate mx-4 md:w-1/4">{track.album}</p>
                <p className="text-xs sm:text-sm text-muted-foreground w-12 sm:w-16 text-right tabular-nums flex-shrink-0">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </p>
                {/* Add MoreHorizontal button or other actions if needed */}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Placeholder for Album Results */}
      {/* <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Disc className="mr-3 h-6 w-6 text-primary"/> Albums</h2>
        <p className="text-muted-foreground">Album search results will appear here.</p>
      </section> */}

      {/* Placeholder for Artist Results */}
      {/* <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Users className="mr-3 h-6 w-6 text-primary"/> Artists</h2>
        <p className="text-muted-foreground">Artist search results will appear here.</p>
      </section> */}
    </div>
  );
}
