
"use client";

import type { Track } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Mic2, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchLyrics, type FetchLyricsOutput } from '@/ai/flows/fetch-lyrics-flow'; 
import { Button } from '../ui/button';

interface LyricsDisplayProps {
  track: Track;
  currentTime: number; // in seconds
}

interface LyricLine {
  time: number;
  line: string;
}

function parseLRC(lrcContent: string | null | undefined): LyricLine[] {
  if (!lrcContent) return [];
  const lrcLines = lrcContent.split('\n');
  const lyricsArray: LyricLine[] = [];
  const timeTagRegex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/g;

  for (const line of lrcLines) {
    let textPart = line;
    const timestamps: number[] = [];
    let lastTagEndIndex = -1;
    
    timeTagRegex.lastIndex = 0; 
    let match;
    while ((match = timeTagRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fracSeconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      timestamps.push(minutes * 60 + seconds + fracSeconds / 1000);
      lastTagEndIndex = timeTagRegex.lastIndex;
    }

    if (lastTagEndIndex !== -1) {
      textPart = line.substring(lastTagEndIndex).trim();
    } else {
      textPart = line.trim();
    }
    
    if (textPart === "" || (/^\[(ar|ti|al|by|offset|length|re|ve):/.test(line.trim()) && timestamps.length === 0)) {
      continue;
    }

    if (timestamps.length > 0) {
      for (const time of timestamps) {
        lyricsArray.push({ time, line: textPart });
      }
    } else if (textPart) { 
      const prevTime = lyricsArray.length > 0 ? lyricsArray[lyricsArray.length - 1].time : 0;
      lyricsArray.push({ time: prevTime, line: textPart });
    }
  }

  return lyricsArray.sort((a, b) => a.time - b.time);
}


export function LyricsDisplay({ track, currentTime }: LyricsDisplayProps) {
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const currentLineRef = useRef<HTMLParagraphElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!track || !track.title || !track.artist) { // Basic validation
      setError("Track information is incomplete.");
      return;
    }

    const loadLyrics = async () => {
      setIsLoading(true);
      setError(null);
      setParsedLyrics([]);
      setPlainLyrics(null);
      setIsInstrumental(false);
      setSourceUrl(null);
      setCurrentLineIndex(-1);

      try {
        const result: FetchLyricsOutput = await fetchLyrics({
          trackName: track.title,
          artistName: track.artist,
          albumName: track.album, // Optional, can be undefined
          duration: track.duration, // Optional, can be undefined
        });

        if (result.message && !result.syncedLyrics && !result.plainLyrics && !result.instrumental) {
          setError(result.message);
        } else {
           if (result.instrumental) {
            setIsInstrumental(true);
          } else if (result.syncedLyrics) {
            setParsedLyrics(parseLRC(result.syncedLyrics));
            setPlainLyrics(null); 
          } else if (result.plainLyrics) {
            setPlainLyrics(result.plainLyrics);
            setParsedLyrics([]); 
          } else {
             setError(result.message || "Lyrics not available for this song.");
          }
          if (result.lyricsId && result.sourceName && track.title && track.artist) {
            // Construct URL-friendly components
            const artistComponent = encodeURIComponent(track.artist.toLowerCase().replace(/ /g, '-'));
            const titleComponent = encodeURIComponent(track.title.toLowerCase().replace(/ /g, '-'));
            setSourceUrl(`https://lrclib.net/lyrics/${artistComponent}/${titleComponent}`);
            // Simpler embed: `https://lrclib.net/embed/${result.lyricsId}`
            // More accurate but complex: `https://lrclib.net/lyrics/${result.lyricsId}/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`
            // The one above uses names for the URL path, let's try a more direct ID link if available from API or a generic link.
            // Using the title/artist for URL seems to be how lrclib.net structures some URLs.
            // Let's try `https://lrclib.net/lyrics/${result.lyricsId}` if that's how their URLs are usually structured for direct ID access.
            // After checking lrclib.net, a common pattern is /lyrics/artist-name/track-name
            // Let's stick to a simplified version or just the ID link if that's more reliable
            // For now: `https://lrclib.net/lyrics/${result.lyricsId}` - this is a guess, their API docs are brief.
            // Fallback: `https://lrclib.net/search?q=${encodeURIComponent(track.artist + " " + track.title)}`
            // Let's use a general search URL with the track ID to be safe if direct linking is tricky.
            // The sourceName from API is just the filename, not a path.
            // The /lyrics/id endpoint does not exist.
            // The most reliable is /lyrics/artist-name/song-name or /search.
            // Let's try to build the artist/song name path.
             const searchFriendlyArtist = track.artist.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
             const searchFriendlyTitle = track.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
             if (result.lyricsId){ // if ID is present, specific link might be possible
                 setSourceUrl(`https://lrclib.net/lyrics/${searchFriendlyArtist}/${searchFriendlyTitle}`);
             } else {
                 setSourceUrl(`https://lrclib.net/search?artist_name=${encodeURIComponent(track.artist)}&track_name=${encodeURIComponent(track.title)}`);
             }
          }
        }
      } catch (e: any) {
        console.error("Full error object from fetchLyrics:", e); // Log the full error
        console.error("Failed to fetch lyrics client-side:", e.message, e.stack);
        setError(`Failed to load lyrics: ${e.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadLyrics();
  }, [track]);

  useEffect(() => {
    if (!parsedLyrics || parsedLyrics.length === 0) {
      setCurrentLineIndex(-1);
      return;
    }

    let activeIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIndex = i;
        break;
      }
    }
    setCurrentLineIndex(activeIndex);

  }, [currentTime, parsedLyrics]);

 useEffect(() => {
    if (currentLineRef.current && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        const lineOffsetTop = currentLineRef.current.offsetTop;
        const lineHeight = currentLineRef.current.offsetHeight;
        const viewportHeight = viewport.clientHeight;
        
        let scrollTo = lineOffsetTop - (viewportHeight / 2) + (lineHeight / 2);
        scrollTo = Math.max(0, Math.min(scrollTo, viewport.scrollHeight - viewportHeight));

        viewport.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }
    }
  }, [currentLineIndex]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-primary-foreground/70">
        <Loader2 className="w-16 h-16 mb-4 animate-spin" />
        <p className="text-lg">Loading lyrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-primary-foreground/70">
        <AlertCircle className="w-16 h-16 mb-4 text-destructive" />
        <p className="text-lg">Error loading lyrics</p>
        <p className="text-sm text-primary-foreground/50 max-w-md px-4">{error}</p>
      </div>
    );
  }
  
  if (isInstrumental) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center text-primary-foreground/70">
        <Mic2 className="w-16 h-16 mb-4" />
        <p className="text-lg">This track is instrumental.</p>
        {sourceUrl && (
            <Button variant="link" asChild className="mt-4 text-primary-foreground/50 hover:text-primary-foreground">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                View on LRCLIB <ExternalLink className="ml-1 h-4 w-4"/>
                </a>
            </Button>
        )}
      </div>
    );
  }

  if (parsedLyrics.length > 0) {
    return (
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="py-10 md:py-16 lg:py-20 px-4 text-center"> 
          {parsedLyrics.map((line, index) => (
            <p
              key={`${line.time}-${index}-${Math.random()}`} // More unique key
              ref={index === currentLineIndex ? currentLineRef : null}
              className={cn(
                "text-xl md:text-2xl lg:text-3xl font-medium my-3 md:my-4 leading-relaxed transition-all duration-300 ease-in-out",
                index === currentLineIndex
                  ? "text-primary-foreground scale-100 opacity-100 font-semibold"
                  : "text-primary-foreground/60 opacity-70 scale-95" 
              )}
            >
              {line.line || <>&nbsp;</>} 
            </p>
          ))}
          {sourceUrl && (
            <div className="mt-8 text-center">
                <Button variant="link" asChild className="text-xs text-primary-foreground/50 hover:text-primary-foreground">
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    Lyrics from LRCLIB <ExternalLink className="ml-1 h-3 w-3"/>
                    </a>
                </Button>
            </div>
           )}
        </div>
      </ScrollArea>
    );
  }

  if (plainLyrics) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="py-10 md:py-16 lg:py-20 px-4 text-left"> 
          {plainLyrics.split('\n').map((line, index) => (
            <p key={index} className="text-lg md:text-xl my-1 text-primary-foreground/80">
              {line || <>&nbsp;</>}
            </p>
          ))}
           {sourceUrl && (
            <div className="mt-8 text-left">
                 <Button variant="link" asChild className="text-xs text-primary-foreground/50 hover:text-primary-foreground">
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    Lyrics from LRCLIB <ExternalLink className="ml-1 h-3 w-3"/>
                    </a>
                </Button>
            </div>
           )}
        </div>
      </ScrollArea>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center h-full text-center text-primary-foreground/70">
        <Mic2 className="w-16 h-16 mb-4" />
        <p className="text-lg">Lyrics not available for this song.</p>
         {sourceUrl && ( // Also show link here if a search URL was constructed but no lyrics found
            <Button variant="link" asChild className="mt-4 text-primary-foreground/50 hover:text-primary-foreground">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                Search on LRCLIB <ExternalLink className="ml-1 h-4 w-4"/>
                </a>
            </Button>
        )}
      </div>
    );
}
