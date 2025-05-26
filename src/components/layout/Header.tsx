
"use client";

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function getPathTitle(path: string): string {
  if (path.startsWith('/library')) {
    if (path.includes('/songs')) return 'Songs';
    if (path.includes('/albums')) return 'Albums';
    if (path.includes('/artists')) return 'Artists';
    if (path.includes('/playlists')) return 'Playlists';
    return 'Library';
  }
  if (path.startsWith('/playlists/')) return 'Playlist'; // Keep this specific
  if (path === '/browse') return 'Browse';
  if (path === '/radio') return 'Radio';
  if (path === '/search') return 'Search';
  if (path === '/queue') return 'Playback Queue';
  if (path === '/settings') return 'Settings';
  return 'MusicVerse'; // Default or for home page if it's different from /browse
}


export function Header() {
  const pathname = usePathname();
  const [title, setTitle] = useState('MusicVerse');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTitle(getPathTitle(pathname));
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual search navigation or result display
    console.log("Searching for:", searchTerm);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <SidebarTrigger className="md:hidden flex-shrink-0" /> {/* Trigger for mobile */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
      </div>
      {pathname === '/search' && (
        <form onSubmit={handleSearch} className="relative ml-auto flex-1 sm:flex-initial max-w-xs w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..." // Shorter placeholder for mobile
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full sm:w-[200px] md:w-[250px] lg:w-[300px] bg-background text-sm"
          />
        </form>
      )}
       {pathname !== '/search' && <div className="flex-1 sm:flex-initial"></div>} {/* Spacer to help balance ThemeToggle */}
      <ThemeToggle />
    </header>
  );
}
