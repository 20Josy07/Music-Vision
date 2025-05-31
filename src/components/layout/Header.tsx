
"use client";

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

function getPathTitle(path: string): string {
  if (path.startsWith('/library')) {
    if (path.includes('/songs')) return 'Songs';
    if (path.includes('/albums')) return 'Albums';
    if (path.includes('/artists')) return 'Artists';
    if (path.includes('/playlists')) return 'Playlists';
    return 'Library';
  }
  if (path.startsWith('/playlists/')) return 'Playlist';
  if (path === '/browse') return 'Browse'; // Keep title for desktop, mobile uses page title
  if (path === '/radio') return 'Radio';
  if (path === '/search') return 'Search Results';
  if (path === '/queue') return 'Playback Queue';
  if (path === '/settings') return 'Settings';
  return 'MusicVision';
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsHook = useSearchParams(); // Renamed to avoid conflict
  const [title, setTitle] = useState('MusicVision');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile(); // Use the hook

  useEffect(() => {
    setTitle(getPathTitle(pathname));
    const queryParam = searchParamsHook.get('q');
    if (pathname === '/search' && queryParam) {
      setSearchTerm(queryParam);
    } else if (pathname !== '/search') {
      // setSearchTerm(''); // Optional: clear search on other pages
    }
  }, [pathname, searchParamsHook]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  // Hide search bar in global header if on browse page on mobile, as browse page has its own
  const showHeaderSearch = !(isMobile && pathname === '/browse');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <SidebarTrigger className="md:hidden flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {!(isMobile && pathname === '/browse') && ( // Hide title on mobile browse page
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
        )}
      </div>

      {showHeaderSearch && (
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
      )}
      <ThemeToggle />
    </header>
  );
}

    