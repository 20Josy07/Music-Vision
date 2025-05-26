
"use client";

import Image from 'next/image';
import { X, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, MessageSquare } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LyricsDisplay } from '@/components/lyrics/LyricsDisplay';
import { useEffect, useState } from 'react';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export function FullScreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackProgress,
    shuffle,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    cycleRepeatMode,
    isFullScreenPlayerVisible,
    toggleFullScreenPlayer
  } = usePlayer();

  const [displayProgress, setDisplayProgress] = useState(playbackProgress);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);

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

  const toggleLyricsVisibility = () => {
    setShowLyrics(prev => !prev);
  };


  if (!isFullScreenPlayerVisible || !currentTrack) {
    return null;
  }

  const totalDuration = currentTrack?.duration || 0;
  const currentTime = displayProgress * totalDuration;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between transition-all duration-300 ease-in-out text-primary-foreground overflow-hidden">
      {/* Dynamic Blurred & Vibrant Background from current track artwork */}
      {currentTrack.artworkUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
            src={currentTrack.artworkUrl}
            alt="Blurred background artwork"
            fill 
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="opacity-60 blur-3xl scale-125 saturate-150 contrast-125" // Increased opacity further
            data-ai-hint={currentTrack.dataAiHint || 'album art background'}
            priority
            />
        </div>
      )}
      {/* Darker Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/40"></div> {/* Further Reduced overlay opacity */}

      {/* Header with Close Button & Lyrics Toggle */}
      <div className="relative z-20 w-full flex justify-between items-center p-4 md:p-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullScreenPlayer} 
          className="text-primary-foreground/60 hover:text-primary-foreground"
          aria-label="Close Full Screen Player"
        >
          <X className="h-7 w-7" />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLyricsVisibility}
            className={cn(
                "text-primary-foreground/60 hover:text-primary-foreground",
                showLyrics && "text-primary" 
            )}
            aria-label={showLyrics ? "Hide Lyrics" : "Show Lyrics"}
        >
            <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Main Content Area (Art/Controls + Lyrics) */}
      <div className={cn(
          "relative z-10 flex flex-col md:flex-row flex-grow w-full max-w-7xl mx-auto items-stretch overflow-hidden px-4 md:px-6 lg:px-8 pb-4 md:pb-6",
        )}>
        {/* Art & Controls Column (Left on Desktop/Tablet) */}
        <div className={cn(
            "flex-shrink-0 flex flex-col items-center justify-center md:justify-start pt-0 md:pt-4 lg:pt-8 md:pr-4 lg:pr-8 space-y-4 md:space-y-6",
            showLyrics ? "w-full md:w-2/5" : "w-full md:w-1/2 lg:w-2/5 mx-auto" 
        )}>
          <div className={cn(
              "w-full aspect-square relative shadow-2xl rounded-lg overflow-hidden",
              showLyrics 
                ? "max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl" 
                : "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl" // Adjusted max-widths for artwork
            )}> 
            {currentTrack.artworkUrl && (
                <Image
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.title}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 40vw, 512px" // Adjusted sizes
                    className="object-cover"
                    data-ai-hint={currentTrack.dataAiHint || 'album art'}
                />
            )}
          </div>
          
          <div className="w-full max-w-md text-center md:text-left px-2 md:px-0">
            <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-3 min-w-0">
                <div className="min-w-0 flex-1 text-center md:text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate text-primary-foreground">{currentTrack.title}</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/60 truncate">{currentTrack.artist}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full mb-2 md:mb-3">
              <span className="text-xs text-primary-foreground/60 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
              <Slider
                value={[displayProgress]}
                max={1}
                step={0.01}
                onValueChange={handleProgressChange}
                onValueCommit={handleSeekCommit}
                className="w-full [&>span>span]:bg-primary-foreground [&>span]:bg-primary-foreground/30"
                thumbClassName="bg-primary-foreground border-0 shadow-md h-3 w-3 md:h-3.5 md:w-3.5" 
                aria-label="Playback progress"
              />
              <span className="text-xs text-primary-foreground/60 w-10 tabular-nums">{formatTime(totalDuration)}</span>
            </div>

            <div className="flex items-center justify-between my-1 md:my-2"> 
              <Button variant="ghost" size="icon" onClick={toggleShuffle} 
                className={cn(
                  "text-primary-foreground/60 hover:text-primary-foreground h-9 w-9 sm:h-10 sm:w-10", 
                  shuffle && "text-primary"
                )}>
                <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Shuffle</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={playPrevious} className="text-primary-foreground/60 hover:text-primary-foreground h-10 w-10 sm:h-12 sm:w-12">
                <SkipBack className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> 
                 <span className="sr-only">Previous</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground">
                {isPlaying ? <Pause className="h-6 w-6 sm:h-7 sm:w-7 fill-current" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />}
                 <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={playNext} className="text-primary-foreground/60 hover:text-primary-foreground h-10 w-10 sm:h-12 sm:w-12">
                <SkipForward className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                 <span className="sr-only">Next</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={cycleRepeatMode} 
                className={cn(
                  "text-primary-foreground/60 hover:text-primary-foreground h-9 w-9 sm:h-10 sm:w-10", 
                  (repeatMode !== 'none' && repeatMode !== 'off') && "text-primary"
                )}>
                {(repeatMode === 'one' || repeatMode === 'track') ? <Repeat1 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />}
                 <span className="sr-only">Repeat</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lyrics Column (Right on Desktop/Tablet) */}
        {showLyrics && (
            <div className="w-full md:w-3/5 flex-1 flex flex-col overflow-hidden md:pl-4 lg:pl-8 mt-4 md:mt-0">
                <div className="relative flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-primary-foreground/20 scrollbar-track-transparent">
                    <LyricsDisplay track={currentTrack} currentTime={currentTime} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
