
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/common/AppLogo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-8 text-center">
      <AppLogo iconSize={64} textSize="text-6xl mb-8" />
      <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to MusicVerse</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Discover your next favorite song. Explore a vast universe of music, create playlists, and enjoy a seamless listening experience.
      </p>
      <Link href="/browse" passHref>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Start Listening
        </Button>
      </Link>
      <p className="mt-12 text-sm text-muted-foreground">
        Powered by cutting-edge technology and a love for music.
      </p>
    </div>
  );
}
