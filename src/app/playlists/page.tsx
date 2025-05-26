"use client"; // For potential future interactivity like opening a modal

import { Button } from '@/components/ui/button';
import { PlaylistCard } from '@/components/playlist-card';
import { PlusCircle, ListMusic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock playlist data
const mockPlaylists = [
  { id: '1', name: 'Chill Vibes', songCount: 25, imageUrl: 'https://placehold.co/300x300.png', description: 'Relax and unwind with these mellow tunes.' },
  { id: '2', name: 'Workout Beats', songCount: 40, imageUrl: 'https://placehold.co/300x300.png', description: 'Get pumped up for your workout session.' },
  { id: '3', name: 'Road Trip Anthems', songCount: 50, imageUrl: 'https://placehold.co/300x300.png', description: 'The perfect soundtrack for your next adventure.' },
  { id: '4', name: 'Focus Flow', songCount: 30, imageUrl: 'https://placehold.co/300x300.png', description: 'Instrumental tracks to help you concentrate.' },
];

export default function PlaylistsPage() {
  // In a real app, you'd fetch user's playlists
  const playlists = mockPlaylists;

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">My Playlists</CardTitle>
          </div>
          <Button className="text-base px-4 py-2">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Playlist
          </Button>
        </CardHeader>
        {playlists.length === 0 && (
          <CardContent>
            <div className="text-center py-10">
              <ListMusic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No playlists yet</h3>
              <p className="text-muted-foreground">Create your first playlist to start organizing your music.</p>
            </div>
          </CardContent>
        )}
      </Card>
      
      {playlists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              name={playlist.name}
              songCount={playlist.songCount}
              imageUrl={playlist.imageUrl}
              description={playlist.description}
              dataAiHint="playlist cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
