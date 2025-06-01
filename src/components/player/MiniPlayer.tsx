
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Maximize2,
  Heart,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export function MiniPlayer() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(18)
  const [duration] = useState(213) // 3:33
  const [isLiked, setIsLiked] = useState(false)

  const currentSong = {
    id: "1",
    title: "Hiekka",
    artist: "Nicky Jam, Beéle",
    cover: "https://placehold.co/64x64.png", // Using placehold.co for consistency
    dataAiHint: "song abstract"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-24 bg-black/30 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-emerald-900/20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"></div>

      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Song Info */}
        <div className="flex items-center gap-4 w-80">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            <Image
              src={currentSong.cover || "https://placehold.co/64x64/cccccc/969696.png?text=Art"}
              alt={currentSong.title}
              fill
              className="object-cover"
              data-ai-hint={currentSong.dataAiHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-white truncate">{currentSong.title}</h4>
            <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`text-gray-400 hover:text-red-400 transition-all duration-300 ${isLiked ? "text-red-500" : ""}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-all duration-300">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 flex-1 max-w-2xl">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-gray-400 w-12 text-right font-mono">{formatTime(currentTime)}</span>
            <div className="flex-1 relative">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                className="cursor-pointer [&>span]:h-1.5 [&>span]:bg-neutral-600 [&>span>span]:bg-gradient-to-r [&>span>span]:from-blue-500 [&>span>span]:via-cyan-500 [&>span>span]:to-emerald-500"
                thumbClassName="h-3 w-3 border-transparent bg-white"
                onValueChange={(value) => setCurrentTime(value[0])}
              />
            </div>
            <span className="text-xs text-gray-400 w-12 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center gap-3 w-80 justify-end">
          <Link href={`/player/${currentSong.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          <div className="w-28">
            <Slider 
              defaultValue={[70]} 
              max={100} 
              step={1} 
              className="cursor-pointer [&>span]:h-1.5 [&>span]:bg-neutral-600 [&>span>span]:bg-white"
              thumbClassName="h-3 w-3 border-transparent bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
