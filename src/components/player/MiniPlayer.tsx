
"use client";
import type React from 'react';
import Image from 'next/image';
import { Play, Pause, SkipForward, Heart, Maximize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export function MiniPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    playNext, 
    playbackProgress, 
    toggleFullScreenPlayer 
  } = usePlayer();

  if (!currentTrack) {
    return (
      <footer className="h-24 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-foreground border-t border-gray-700 flex items-center justify-center px-6">
        <p className="text-sm text-gray-400">No music selected.</p>
      </footer>
    );
  }
  
  const totalDuration = currentTrack?.duration || 0;
  const currentTime = playbackProgress * totalDuration;

  return (
    <footer className="h-24 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-foreground border-t border-gray-700 flex items-center justify-between px-6 relative">
      {/* Thin Progress Bar at the top */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <Slider
            value={[playbackProgress]}
            max={1}
            step={0.01}
            className="w-full h-1 [&>span]:h-1 [&>span>span]:bg-emerald-500 [&>span]:bg-gray-600"
            thumbClassName="h-1 w-1 hidden"
            aria-label="Playback progress"
        />
      </div>

      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <Image 
            src={currentTrack.artworkUrl || 'https://placehold.co/64x64.png'} 
            alt={currentTrack.title} 
            width={56} height={56} 
            className="rounded-md shadow-md"
            data-ai-hint={currentTrack.dataAiHint || "album art"}
        />
        <div>
          <h3 className="font-semibold text-sm truncate">{currentTrack.title}</h3>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center gap-1 w-1/3">
        <div className="flex items-center gap-3">
            {/* Add Previous button if needed later */}
            <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-10 w-10 text-white hover:text-gray-300">
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="h-8 w-8 text-gray-400 hover:text-white">
            <SkipForward className="h-5 w-5 fill-current" />
            </Button>
        </div>
        <div className="flex items-center gap-2 text-xs w-full max-w-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            {/* Simplified progress or remove if top bar is enough */}
            <div className="flex-grow h-1 bg-gray-600 rounded-full">
                <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${playbackProgress * 100}%` }}></div>
            </div>
            <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Right: Actions & Volume */}
      <div className="flex items-center gap-3 w-1/3 justify-end">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Heart className="h-5 w-5" />
        </Button>
        {/* Volume control can be added here */}
        <Button variant="ghost" size="icon" onClick={toggleFullScreenPlayer} className="text-gray-400 hover:text-white">
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
    </footer>
  );
}
