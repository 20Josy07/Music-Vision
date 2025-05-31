
"use client";

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

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
  if (path === '/search') return 'Search Results'; // Updated title
  if (path === '/queue') return 'Playback Queue';
  if (path === '/settings') return 'Settings';
  return 'MusicVision'; 
}


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('MusicVision');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTitle(getPathTitle(pathname));
    // Update search term in header input if q param exists (e.g., navigating directly to search results)
    if (pathname === '/search' && searchParams.has('q')) {
      setSearchTerm(searchParams.get('q') || '');
    } else if (pathname !== '/search') {
      // Clear search term if not on search page, debatable, but common
      // setSearchTerm(''); 
    }
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // If search term is empty, maybe navigate to /search without a query
      // or do nothing. For now, let's navigate to /search to show the "type to search" prompt.
      router.push('/search');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <SidebarTrigger className="md:hidden flex-shrink-0" /> {/* Trigger for mobile */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
      </div>
      
      <form onSubmit={handleSearchSubmit} className="relative ml-auto flex-1 sm:flex-initial max-w-xs w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search songs, artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full sm:w-[200px] md:w-[250px] lg:w-[300px] bg-background text-sm"
          aria-label="Search music"
        />
      </form>
      <ThemeToggle />
    </header>
  );
}
