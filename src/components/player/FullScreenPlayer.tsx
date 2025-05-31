
"use client";

import Image from 'next/image';
import { X, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, ChevronLeft, MoreVertical, ChevronUp, Music2 } from 'lucide-react'; // Added ChevronLeft, MoreVertical, ChevronUp
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LyricsDisplay } from '@/components/lyrics/LyricsDisplay';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For artist avatar

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
  const [lyricsViewActive, setLyricsViewActive] = useState(false); // To toggle between album art and lyrics view

  useEffect(() => {
    if (!isSeeking) {
      setDisplayProgress(playbackProgress);
    }
  }, [playbackProgress, isSeeking]);

  // Reset to album art view when track changes
  useEffect(() => {
    setLyricsViewActive(false);
  }, [currentTrack?.id]);


  const handleSeekCommit = (value: number[]) => {
    seek(value[0]);
    setIsSeeking(false);
  };

  const handleProgressChange = (value: number[]) => {
    setIsSeeking(true);
    setDisplayProgress(value[0]);
  };

  if (!isFullScreenPlayerVisible || !currentTrack) {
    return null;
  }

  const totalDuration = currentTrack?.duration || 0;
  const currentTime = displayProgress * totalDuration;
  const backgroundImageSrc = currentTrack.artworkUrl;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-between transition-all duration-300 ease-in-out text-primary-foreground overflow-hidden">
      {backgroundImageSrc && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            key={backgroundImageSrc} // Re-trigger animation on change
            src={backgroundImageSrc}
            alt="Dynamic background artwork"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="opacity-30 md:opacity-40 blur-2xl md:blur-3xl saturate-100 md:saturate-150 contrast-100 md:contrast-125 animate-subtle-bg-pan-zoom"
            data-ai-hint={currentTrack.dataAiHint || 'album art background'}
            priority
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/50 md:from-black/20 md:via-black/30 md:to-black/40"></div>

      {/* Header */}
      <div className="relative z-20 w-full flex justify-between items-center p-4 pt-5 md:p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullScreenPlayer}
          className="text-primary-foreground/80 hover:text-primary-foreground"
          aria-label="Close Full Screen Player"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
        <span className="text-sm font-medium text-primary-foreground/90">On Listening</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground/80 hover:text-primary-foreground"
          aria-label="More options"
        >
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col flex-grow w-full max-w-4xl mx-auto items-stretch overflow-hidden px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
        {!lyricsViewActive ? (
          // Album Art View
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg aspect-square relative shadow-2xl rounded-lg overflow-hidden mb-6 mt-auto">
              {currentTrack.artworkUrl && (
                <Image
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, 512px"
                  className="object-cover" // Changed to cover for better fit in square
                  data-ai-hint={currentTrack.dataAiHint || 'album art'}
                />
              )}
            </div>
            <div className="w-full max-w-md px-2 md:px-0 text-center mt-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Avatar className="h-5 w-5">
                    <AvatarImage src={currentTrack.artworkUrl} alt={currentTrack.artist} />
                    <AvatarFallback>{currentTrack.artist?.substring(0,1) || 'A'}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl sm:text-2xl truncate text-primary-foreground font-bold">{currentTrack.title}</h2>
              </div>
              <p className="text-sm sm:text-base text-primary-foreground/70 truncate mb-4">{currentTrack.artist}</p>

              <div className="flex items-center gap-2 w-full mb-3">
                <span className="text-xs text-primary-foreground/80 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                <Slider
                  value={[displayProgress]} max={1} step={0.01}
                  onValueChange={handleProgressChange} onValueCommit={handleSeekCommit}
                  className="w-full [&>span]:h-1.5 [&>span]:bg-neutral-600 [&>span>span]:bg-primary-foreground"
                  thumbClassName="h-3.5 w-3.5 border-primary-foreground bg-primary-foreground"
                  aria-label="Playback progress"
                />
                <span className="text-xs text-primary-foreground/80 w-10 tabular-nums">-{formatTime(Math.max(0, totalDuration - currentTime))}</span>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("text-primary-foreground/70 hover:text-primary-foreground h-10 w-10", shuffle && "text-primary")}>
                  <Shuffle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={playPrevious} className="text-primary-foreground hover:text-primary-foreground/80 h-12 w-12">
                  <SkipBack className="h-7 w-7 fill-current" />
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-16 w-16 rounded-full hover:bg-primary-foreground/10 text-primary-foreground">
                  {isPlaying ? <Pause className="h-9 w-9 fill-current" /> : <Play className="h-9 w-9 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext} className="text-primary-foreground hover:text-primary-foreground/80 h-12 w-12">
                  <SkipForward className="h-7 w-7 fill-current" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cycleRepeatMode} className={cn("text-primary-foreground/70 hover:text-primary-foreground h-10 w-10", (repeatMode !== 'none' && repeatMode !== 'off') && "text-primary")}>
                  {(repeatMode === 'one' || repeatMode === 'track') ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLyricsViewActive(true)} className="mt-auto mb-2 text-xs text-primary-foreground/60 hover:text-primary-foreground">
              <ChevronUp className="mr-1 h-4 w-4" /> Swipe Up for Lyrics (Click)
            </Button>
          </div>
        ) : (
          // Lyrics View
          <div className="flex-1 flex flex-col items-center justify-between text-center h-full overflow-hidden">
            <div className="relative flex-grow w-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary-foreground/20 scrollbar-track-transparent mb-2">
               <LyricsDisplay track={currentTrack} currentTime={currentTime} />
            </div>
            {currentTrack.artworkUrl && (
                <div className="absolute bottom-20 right-4 md:bottom-24 md:right-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setLyricsViewActive(false)}>
                    <Image
                        src={currentTrack.artworkUrl}
                        alt="Album art thumbnail"
                        width={64}
                        height={64}
                        className="rounded-md shadow-lg aspect-square object-cover w-12 h-12 md:w-16 md:h-16"
                        data-ai-hint={currentTrack.dataAiHint || 'album art mini'}
                    />
                     <Music2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-white/70"/>
                </div>
            )}

            <div className="w-full max-w-md px-2 md:px-0 mt-auto">
                <div className="flex items-center gap-2 w-full mb-3">
                    <span className="text-xs text-primary-foreground/80 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <Slider
                    value={[displayProgress]} max={1} step={0.01}
                    onValueChange={handleProgressChange} onValueCommit={handleSeekCommit}
                    className="w-full [&>span]:h-1.5 [&>span]:bg-neutral-600 [&>span>span]:bg-primary-foreground"
                    thumbClassName="h-3.5 w-3.5 border-primary-foreground bg-primary-foreground"
                    aria-label="Playback progress"
                    />
                    <span className="text-xs text-primary-foreground/80 w-10 tabular-nums">-{formatTime(Math.max(0, totalDuration - currentTime))}</span>
                </div>
                <div className="flex items-center justify-around">
                     <Button variant="ghost" size="icon" onClick={playPrevious} className="text-primary-foreground hover:text-primary-foreground/80 h-12 w-12">
                        <SkipBack className="h-7 w-7 fill-current" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-16 w-16 rounded-full hover:bg-primary-foreground/10 text-primary-foreground">
                        {isPlaying ? <Pause className="h-9 w-9 fill-current" /> : <Play className="h-9 w-9 fill-current" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={playNext} className="text-primary-foreground hover:text-primary-foreground/80 h-12 w-12">
                        <SkipForward className="h-7 w-7 fill-current" />
                    </Button>
                </div>
            </div>
            {/* <Button variant="ghost" onClick={() => setLyricsViewActive(false)} className="mt-2 text-xs text-primary-foreground/60 hover:text-primary-foreground">
              Show Album Art
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
}

    