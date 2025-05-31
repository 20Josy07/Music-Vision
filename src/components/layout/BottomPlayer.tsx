
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, Volume1, VolumeX, Maximize2, ListMusic, Mic2, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackProgress,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume: handleSetVolumeContext, // Renamed to avoid conflict
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleFullScreenPlayer
  } = usePlayer();

  const [displayProgress, setDisplayProgress] = useState(playbackProgress);
  const [isSeeking, setIsSeeking] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isSeeking) {
      setDisplayProgress(playbackProgress);
    }
  }, [playbackProgress, isSeeking]);

  const handleSeekCommit = (value: number[]) => {
    seek(value[0]);
    setIsSeeking(false);
  };

  const handleProgressChange = (value: number[]) => {
    setIsSeeking(true);
    setDisplayProgress(value[0]);
  };

  if (!currentTrack) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-center px-4 md:px-6 shadow-md z-50">
            <p className="text-muted-foreground text-sm">No track selected.</p>
        </footer>
    );
  }

  const totalDuration = currentTrack?.duration || 0;
  const currentTime = displayProgress * totalDuration;

  if (isMobile) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border shadow-md z-50 flex flex-col pt-0.5">
        <Slider
            value={[displayProgress]}
            max={1}
            step={0.01}
            onValueChange={handleProgressChange}
            onValueCommit={handleSeekCommit}
            className="w-full h-1.5 [&>span]:h-1 [&>span>span]:bg-primary [&>span]:bg-primary/30"
            thumbClassName="h-1 w-1 hidden" // Make thumb very small or hidden for mobile progress bar
            aria-label="Playback progress"
        />
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {currentTrack.artworkUrl && (
              <Image
                src={currentTrack.artworkUrl}
                alt={currentTrack.album || 'Album art'}
                width={40}
                height={40}
                className="rounded-md aspect-square object-cover"
                data-ai-hint={currentTrack.dataAiHint}
              />
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{currentTrack.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-10 w-10">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="h-10 w-10">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-around border-t border-border/30 py-1.5 bg-background/50">
           <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("h-9 w-9", shuffle && "text-primary")}>
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cycleRepeatMode} className={cn("h-9 w-9", repeatMode !== 'none' && "text-primary")}>
            {repeatMode === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullScreenPlayer} className="h-9 w-9">
            {/* Using Mic2 for "Swipe up for lyrics" or general full screen player access on mobile */}
            <Mic2 className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    );
  }

  // Desktop Player
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-md z-50">
      <div className="flex items-center gap-2 sm:gap-3 w-2/5 md:w-1/3 min-w-0">
        {currentTrack.artworkUrl && (
           <Image
            src={currentTrack.artworkUrl}
            alt={currentTrack.album || 'Album art'}
            width={48}
            height={48}
            className="hidden sm:block rounded-md aspect-square object-cover md:w-14 md:h-14"
            data-ai-hint={currentTrack.dataAiHint}
          />
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">{currentTrack.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2 flex-grow md:w-1/3 mx-1 sm:mx-2">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("h-7 w-7 sm:h-8 sm:w-8", shuffle && "text-primary")}>
            <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={playPrevious} className="h-7 w-7 sm:h-8 sm:w-8">
            <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-10 w-10 sm:h-12 sm:w-12">
            {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} className="h-7 w-7 sm:h-8 sm:w-8">
            <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cycleRepeatMode} className={cn("h-7 w-7 sm:h-8 sm:w-8", repeatMode !== 'none' && "text-primary")}>
            {repeatMode === 'one' ? <Repeat1 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs md:max-w-sm">
          <span className="text-xs text-muted-foreground w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[displayProgress]}
            max={1}
            step={0.01}
            onValueChange={handleProgressChange}
            onValueCommit={handleSeekCommit}
            className="w-full"
            aria-label="Playback progress"
          />
          <span className="text-xs text-muted-foreground w-8 sm:w-10">{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 w-2/5 md:w-1/3 justify-end">
        <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex h-7 w-7 sm:h-8 sm:w-8">
          <Link href="/queue">
            <ListMusic className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Queue</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFullScreenPlayer} className="h-7 w-7 sm:h-8 sm:w-8">
          <Mic2 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Lyrics / Full Screen</span>
        </Button>
        <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-7 w-7 sm:h-8 sm:w-8">
            {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : volume > 0.5 ? <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume1 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={(value) => handleSetVolumeContext(value[0])} // Use renamed context function
            className="w-12 sm:w-16 md:w-20"
            aria-label="Volume"
            />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFullScreenPlayer} className="h-7 w-7 sm:h-8 sm:w-8">
          <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sr-only">Full Screen Player</span>
        </Button>
      </div>
    </footer>
  );
}

    