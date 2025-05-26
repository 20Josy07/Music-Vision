
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/lib/types";
import { Play, Pause, Trash2, ListOrdered, GripVertical } from "lucide-react";
import Image from "next/image";

// Note: Drag and drop for reordering is a complex feature.
// For this scaffold, we'll show the list and allow removal.
// A full drag and drop implementation would use libraries like react-beautiful-dnd or dnd-kit.

export default function QueuePage() {
  const { queue, currentTrack, isPlaying, playTrack, removeFromQueue, clearQueue, reorderQueue, currentQueueIndex } = usePlayer();

  const handlePlayTrackFromQueue = (track: Track, index: number) => {
    playTrack(track, true, index);
  };
  
  // Basic drag handlers (conceptual, no actual reordering UI without a library)
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("draggedItemIndex", index.toString());
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    const draggedItemIndex = parseInt(e.dataTransfer.getData("draggedItemIndex"), 10);
    if (draggedItemIndex !== dropIndex) {
      reorderQueue(draggedItemIndex, dropIndex);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-foreground flex items-center"><ListOrdered className="mr-3 h-8 w-8 text-primary" /> Playback Queue</h1>
        {queue.length > 0 && (
          <Button variant="outline" onClick={clearQueue}><Trash2 className="mr-2 h-4 w-4" /> Clear Queue</Button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Your queue is empty</h3>
          <p className="text-muted-foreground">Add some songs to see them here.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
          <div className="space-y-2 pr-4">
            {queue.map((track, index) => (
              <Card 
                key={`${track.id}-${index}`} // Ensure unique key if tracks can be duplicated
                className={`flex items-center p-3 pr-4 group transition-all duration-150 ease-in-out ${index === currentQueueIndex ? 'bg-muted/60 shadow-md ring-1 ring-primary/50' : 'hover:bg-muted/30'}`}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab group-hover:opacity-100 opacity-50 transition-opacity"/>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-3 h-10 w-10"
                  onClick={() => handlePlayTrackFromQueue(track, index)}
                >
                  {currentTrack?.id === track.id && index === currentQueueIndex && isPlaying ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary" />}
                </Button>
                <Image src={track.artworkUrl} alt={track.title} width={40} height={40} className="rounded aspect-square object-cover" data-ai-hint={track.dataAiHint}/>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium truncate ${index === currentQueueIndex ? 'text-primary' : 'text-foreground'}`}>{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <p className="text-sm text-muted-foreground hidden md:block truncate mx-4 w-1/4">{track.album}</p>
                <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromQueue(track.id)}>
                  <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
