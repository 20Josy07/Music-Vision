import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Edit3, Music, Heart, Settings } from 'lucide-react';
import Image from 'next/image';

// Mock data - in a real app, this would come from user authentication and database
const userProfile = {
  name: 'Alex Harmonia',
  email: 'alex.harmonia@example.com',
  avatarUrl: 'https://placehold.co/128x128.png',
  joinDate: 'Joined March 2023',
  favoriteSongsCount: 28,
  playlistsCount: 5,
};

const recentActivity = [
  { type: 'liked', item: 'Song Title A', time: '2 hours ago' },
  { type: 'playlist_add', item: 'Song Title B to "Chill Vibes"', time: '5 hours ago' },
  { type: 'listened', item: 'Album X', time: '1 day ago' },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-muted/30 p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary shadow-md">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="profile portrait" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-bold">{userProfile.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{userProfile.email}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">{userProfile.joinDate}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Music className="mr-2 h-6 w-6 text-primary" />
              My Music Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-destructive" />
                    Favorite Songs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userProfile.favoriteSongsCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <UserIcon className="mr-2 h-5 w-5 text-primary" /> {/* Changed from ListMusic */}
                    Playlists Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userProfile.playlistsCount}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-8" />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                    <div>
                      <span className="font-medium">{activity.type.replace('_', ' ')}: </span>
                      <span>{activity.item}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent activity.</p>
            )}
          </section>
          
          <Separator className="my-8" />

          <section>
             <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Settings className="mr-2 h-6 w-6 text-primary" />
                Settings
            </h2>
            <p className="text-muted-foreground">User account settings and preferences will appear here.</p>
            <Button variant="outline" className="mt-4">Manage Settings</Button>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
