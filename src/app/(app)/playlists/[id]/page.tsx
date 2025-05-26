
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Playlist, Track } from "@/lib/types";
import { Play, Pause, MoreHorizontal, Edit, Music, ListMusic, PlusSquare, Dot } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data - in a real app, this would be fetched based on ID
const mockPlaylistsData: Playlist[] = [
  {
    id: 'pl1',
    name: 'Evening Chill Session: A Long Unwind',
    description: 'Relaxing tunes for a calm evening. Perfect for unwinding after a long day or setting a peaceful atmosphere. This playlist aims to soothe your mind and help you transition into a restful night. Features a mix of ambient, lo-fi, and acoustic tracks specifically curated to enhance your moments of tranquility and reflection, providing a serene soundscape for your downtime.',
    artworkUrl: 'https://placehold.co/300x300/C7254E/FFFFFF.png?text=EC',
    dataAiHint:"evening relax",
    owner: 'Your Name',
    tracks: [
      { id: 's1', title: 'Starry Night', artist: 'Cosmic Voyager', album: 'Galactic Dreams', duration: 210, artworkUrl: 'https://placehold.co/50x50/C7254E/FFFFFF.png?text=SN', dataAiHint:"starry night", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
      { id: 's3', title: 'Peaceful Meadow', artist: 'Nature Sounds', album: 'Serene Landscapes', duration: 300, artworkUrl: 'https://placehold.co/50x50/1A171B/FFFFFF.png?text=PM', dataAiHint:"meadow nature", audioSrc:"/audio/synthwave-nostalgia.mp3" },
      { id: 's2', title: 'Urban Flow', artist: 'Metro Beats', album: 'City Rhythms', duration: 190, artworkUrl: 'https://placehold.co/50x50/7058A3/FFFFFF.png?text=UF', dataAiHint:"urban city", audioSrc:"/audio/electronic-background-music.mp3" },
      { id: 's4', title: 'Ocean Whisper', artist: 'Deep Blue', album: 'Aqua Tones', duration: 240, artworkUrl: 'https://placehold.co/50x50/3B82F6/FFFFFF.png?text=OW', dataAiHint:"ocean waves", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
      { id: 's5', title: 'Forest Trail', artist: 'Green Path', album: 'Woodland Echoes', duration: 180, artworkUrl: 'https://placehold.co/50x50/10B981/FFFFFF.png?text=FT', dataAiHint:"forest path", audioSrc:"/audio/electronic-background-music.mp3" },
    ]
  },
   {
    id: 'pl2',
    name: 'Morning Focus',
    description: 'Instrumental tracks to boost productivity and help you concentrate during your morning work or study sessions.',
    artworkUrl: 'https://placehold.co/300x300/7058A3/FFFFFF.png?text=MF',
    dataAiHint:"morning focus",
    owner: 'User',
    tracks: [
        { id: 't3', title: 'Sunrise Serenade', artist: 'Willow Creek', album: 'Acoustic Mornings', duration: 200, artworkUrl: 'https://placehold.co/100x100/7058A3/FFFFFF.png?text=SS', dataAiHint:"acoustic guitar", audioSrc:"/audio/inspiring-emotional-uplifting-piano.mp3" },
        { id: 't4', title: 'Focused Mind', artist: 'Brainwave Beats', album: 'Productivity Suite', duration: 260, artworkUrl: 'https://placehold.co/100x100/7058A3/FFFFFF.png?text=FM', dataAiHint:"abstract brainwave", audioSrc:"/audio/synthwave-nostalgia.mp3" },
    ]
  },
  {
    id: 'pl3',
    name: 'Workout Power Hour',
    description: 'High-energy beats to fuel your most intense workout sessions and keep you motivated.',
    artworkUrl: 'https://placehold.co/300x300/1A171B/FFFFFF.png?text=WP',
    dataAiHint:"workout gym",
    owner: 'User',
    tracks: [] // Empty playlist to test empty state
  },
];


export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.id as string;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const { playTrack, playPlaylist, togglePlayPause, currentTrack, isPlaying, queue } = usePlayer(); 

  useEffect(() => {
    const foundPlaylist = mockPlaylistsData.find(p => p.id === playlistId);
    setPlaylist(foundPlaylist || null);
  }, [playlistId]);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <ListMusic className="w-20 h-20 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Playlist no encontrada</h2>
        <p className="text-muted-foreground">O aún se está cargando...</p>
      </div>
    );
  }

  const isCurrentPlaylistActive = playlist.tracks.length > 0 &&
                                 queue.length === playlist.tracks.length &&
                                 playlist.tracks.every((track) => queue.some(qTrack => qTrack.id === track.id)) && 
                                 playlist.tracks.some(track => track.id === currentTrack?.id);

  const handlePlaylistPlayPause = () => {
    if (isCurrentPlaylistActive) {
      togglePlayPause();
    } else if (playlist.tracks.length > 0) {
      playPlaylist(playlist.tracks, 0);
    }
  };

  const handleTrackPlayPause = (track: Track, index: number) => {
    if (currentTrack?.id === track.id && isCurrentPlaylistActive) {
      togglePlayPause();
    } else {
      playPlaylist(playlist.tracks, index);
    }
  };
  
  const totalDurationSeconds = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);
  const totalDurationHours = Math.floor(totalDurationMinutes / 60);
  const remainingMinutes = totalDurationMinutes % 60;

  let durationString = "";
  if (totalDurationHours > 0) {
    durationString += `${totalDurationHours} h `;
  }
  if (remainingMinutes > 0 || totalDurationHours === 0) { // Show minutes if there are any, or if total hours is 0
    durationString += `${remainingMinutes} min`;
  }


  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start pt-4 md:pt-6 px-2 md:px-0">
        <Image
          src={playlist.artworkUrl || 'https://placehold.co/300x300/CCCCCC/969696.png?text=No+Art'}
          alt={`Carátula de ${playlist.name}`}
          width={250} 
          height={250}
          className="rounded-lg shadow-2xl aspect-square object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-56 lg:w-64 md:h-56 lg:h-64 flex-shrink-0"
          data-ai-hint={playlist.artworkUrl ? playlist.dataAiHint : "music abstract"}
          priority
        />
        <div className="flex-1 text-center md:text-left mt-4 md:mt-0 space-y-2 md:space-y-3">
          <p className="text-xs sm:text-sm uppercase text-muted-foreground font-semibold tracking-wider">Playlist</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground break-words leading-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-muted-foreground max-w-prose line-clamp-3">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center justify-center md:justify-start text-xs sm:text-sm text-muted-foreground space-x-1.5">
            {/* Potentially add playlist owner avatar here if available */}
            <span className="font-medium text-foreground">{playlist.owner}</span>
            {playlist.tracks.length > 0 && (
              <>
                <Dot className="w-3 h-3 opacity-50"/>
                <span>{playlist.tracks.length} canciones</span>
                 {durationString && <Dot className="w-3 h-3 opacity-50"/>}
                 {durationString && <span>{durationString}</span>}
              </>
            )}
          </div>
          <div className="pt-2 sm:pt-3 flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 sm:px-7 py-2.5 text-sm sm:text-base" 
              onClick={handlePlaylistPlayPause} 
              disabled={playlist.tracks.length === 0}
            >
              {(isCurrentPlaylistActive && isPlaying) ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {(isCurrentPlaylistActive && isPlaying) ? 'Pausar' : 'Reproducir'}
            </Button>
            <Button variant="outline" size="lg" className="px-5 sm:px-7 py-2.5 text-sm sm:text-base"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
            <Button variant="outline" size="icon" className="h-11 w-11 sm:h-12 sm:w-12"><MoreHorizontal className="h-5 w-5" /></Button>
          </div>
        </div>
      </section>

      {/* Track List Section */}
      <section className="px-1 md:px-0">
        {playlist.tracks.length > 0 ? (
          <div className="space-y-0.5"> {/* Reduced space between tracks */}
            {playlist.tracks.map((track, index) => (
              <Card
                key={track.id}
                className={`flex items-center p-2 sm:p-3 group rounded-md transition-colors duration-150 ease-in-out border-transparent hover:border-border/30 ${currentTrack?.id === track.id && isCurrentPlaylistActive ? 'bg-muted/60 shadow-sm' : 'hover:bg-muted/40'}`}
                onDoubleClick={() => handleTrackPlayPause(track, index)}
              >
                <div className="flex items-center justify-center w-8 h-10 mr-2 sm:mr-3 flex-shrink-0">
                    {(currentTrack?.id === track.id && isCurrentPlaylistActive && isPlaying) ? (
                         <Pause 
                            className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-primary cursor-pointer" 
                            onClick={() => handleTrackPlayPause(track, index)}
                            aria-label={`Pausar ${track.title}`}
                         />
                    ) : (
                        <>
                            <span className={`hidden group-hover:flex items-center justify-center text-muted-foreground group-hover:text-primary`}>
                                <Play 
                                    className="h-4 w-4 sm:h-5 sm:w-5 fill-current cursor-pointer" 
                                    onClick={() => handleTrackPlayPause(track, index)}
                                    aria-label={`Reproducir ${track.title}`}
                                />
                            </span>
                            <span className={`flex group-hover:hidden items-center justify-center text-xs text-muted-foreground tabular-nums ${currentTrack?.id === track.id && isCurrentPlaylistActive ? 'text-primary' : ''}`}>
                                {index + 1}
                            </span>
                        </>
                    )}
                </div>

                <Image 
                  src={track.artworkUrl} 
                  alt={track.title} 
                  width={40} 
                  height={40} 
                  className="rounded aspect-square object-cover flex-shrink-0" 
                  data-ai-hint={track.dataAiHint || 'song artwork'}
                />
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${(currentTrack?.id === track.id && isCurrentPlaylistActive) ? 'text-primary' : 'text-foreground'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <p className="text-sm text-muted-foreground hidden md:block truncate mx-4 w-1/4 min-w-0 hover:underline cursor-pointer">{track.album}</p>
                <p className="text-xs sm:text-sm text-muted-foreground w-12 sm:w-16 text-right tabular-nums flex-shrink-0">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </p>
                <Button variant="ghost" size="icon" className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0" aria-label="Más opciones para la canción">
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 border border-dashed rounded-lg flex flex-col items-center justify-center bg-card/30 mt-4">
            <Music className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Esta playlist está vacía</h3>
            <p className="text-muted-foreground mb-6">¡Añade algunas canciones para empezar!</p>
            <Button variant="outline">
              <PlusSquare className="mr-2 h-4 w-4"/> Añadir Canciones
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}


    