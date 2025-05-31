
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
  const backgroundImageSrc = currentTrack.artworkUrl;


  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between transition-all duration-300 ease-in-out text-primary-foreground overflow-hidden">
      {backgroundImageSrc && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            key={backgroundImageSrc} 
            src={backgroundImageSrc}
            alt="Dynamic background artwork"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="opacity-40 blur-3xl scale-125 saturate-150 contrast-125 animate-hue-cycle"
            data-ai-hint={currentTrack.dataAiHint || 'album art background'}
            priority
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/40"></div>

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
        <div className="flex items-center gap-2">
          
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
      </div>

      <div className={cn(
        "relative z-10 flex flex-col md:flex-row flex-grow w-full max-w-7xl mx-auto items-stretch overflow-hidden px-4 md:px-6 lg:px-8 pb-4 md:pb-6",
      )}>
        <div className={cn(
          "flex-shrink-0 flex flex-col items-center justify-center md:justify-start pt-0 md:pt-4 lg:pt-8 md:pr-4 lg:pr-8 space-y-4 md:space-y-6",
          showLyrics ? "w-full md:w-2/5" : "w-full md:w-1/2 lg:w-2/5 mx-auto"
        )}>
          <div className={cn(
            "w-full aspect-square relative shadow-2xl rounded-lg overflow-hidden",
            showLyrics
              ? "max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
              : "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          )}>
            {currentTrack.artworkUrl && (
              <Image
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 45vw, 512px"
                className="object-contain"
                data-ai-hint={currentTrack.dataAiHint || 'album art'}
              />
            )}
          </div>

          <div className={cn("w-full max-w-md px-2 md:px-0", !showLyrics ? "text-center" : "text-center md:text-left")}>
            <div className={cn("min-w-0 flex-1 mb-2 md:mb-3", !showLyrics ? "text-center" : "text-center md:text-left")}>
              <h2 className={cn("text-xl sm:text-2xl lg:text-3xl truncate text-primary-foreground font-bold")}>{currentTrack.title}</h2>
              <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/60 truncate">{currentTrack.artist}</p>
            </div>

            <div className="waveform-container my-3 md:my-4 h-8 flex items-center justify-center gap-0.5">
              {[...Array(isPlaying ? 15 : 7)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "waveform-bar bg-primary-foreground/60 rounded-full w-1 transition-all duration-300 ease-in-out",
                    isPlaying && "animate-waveform-pulse"
                  )}
                  style={{ 
                    height: isPlaying ? `${Math.random() * 75 + 25}%` : '25%',
                    animationDelay: isPlaying ? `${i * 0.05}s` : undefined,
                    opacity: isPlaying ? (Math.random() * 0.5 + 0.5) : 0.6,
                  }}
                />
              ))}
            </div>
            
            <style jsx global>{`
              @keyframes waveform-pulse {
                0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
                50% { transform: scaleY(1); opacity: 1; }
              }
              .animate-waveform-pulse {
                animation-name: waveform-pulse;
                animation-duration: 0.8s;
                animation-iteration-count: infinite;
                animation-timing-function: ease-in-out;
              }
            `}</style>


            <div className="flex items-center gap-2 w-full mb-2 md:mb-3">
              <span className="text-xs text-primary-foreground w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
              <Slider
                value={[displayProgress]}
                max={1}
                step={0.01}
                onValueChange={handleProgressChange}
                onValueCommit={handleSeekCommit}
                className="w-full [&>span]:h-1 [&>span]:bg-neutral-700 [&>span>span]:bg-primary-foreground"
                thumbClassName="hidden"
                aria-label="Playback progress"
              />
              <span className="text-xs text-primary-foreground w-10 tabular-nums">-{formatTime(Math.max(0, totalDuration - currentTime))}</span>
            </div>

            <div className="flex items-center justify-between my-1 md:my-2">
              <Button variant="ghost" size="icon" onClick={toggleShuffle}
                className={cn(
                  "text-muted-foreground hover:text-primary-foreground/80 h-9 w-9 sm:h-10 sm:w-10",
                  shuffle && "text-primary"
                )}>
                <Shuffle className="h-5 w-5 sm:h-5 sm:w-5 fill-current" />
                <span className="sr-only">Shuffle</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={playPrevious} className="text-muted-foreground hover:text-primary-foreground/80 h-10 w-10 sm:h-12 sm:w-12">
                <SkipBack className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full hover:bg-primary-foreground/10 text-primary-foreground">
                {isPlaying ? <Pause className="h-8 w-8 sm:h-10 sm:w-10 fill-current" /> : <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={playNext} className="text-muted-foreground hover:text-primary-foreground/80 h-10 w-10 sm:h-12 sm:w-12">
                <SkipForward className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
                <span className="sr-only">Next</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={cycleRepeatMode}
                className={cn(
                  "text-muted-foreground hover:text-primary-foreground/80 h-9 w-9 sm:h-10 sm:w-10",
                  (repeatMode !== 'none' && repeatMode !== 'off') && "text-primary"
                )}>
                {(repeatMode === 'one' || repeatMode === 'track') ? <Repeat1 className="h-5 w-5 sm:h-5 sm:w-5 fill-current" /> : <Repeat className="h-5 w-5 sm:h-5 sm:w-5 fill-current" />}
                <span className="sr-only">Repeat</span>
              </Button>
            </div>
          </div>
        </div>

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
