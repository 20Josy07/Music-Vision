
"use client";
import type React from 'react';
import Link from 'next/link';
import { Home, Radio, ListMusic, Music2, Library, User, Settings, PlusSquare, Search } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// These items would typically come from a config or context
const mainNavItems = [
  { href: '/browse', label: 'Browse', icon: Home },
  { href: '/radio', label: 'Radio', icon: Radio },
];

const libraryNavItems = [
  { href: '/library/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/library/songs', label: 'Songs', icon: Music2 },
  { href: '/library/albums', label: 'Albums', icon: Library },
  { href: '/library/artists', label: 'Artists', icon: User },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function MusicSidebar() {
  const pathname = usePathname();

  // Basic sidebar structure, actual nav items need to be populated
  // Reusing some styling from the example's inspiration
  return (
    <aside className="w-64 bg-black/30 backdrop-blur-md p-6 space-y-8 hidden md:flex flex-col flex-shrink-0 border-r border-gray-800">
      <AppLogo textSize="text-2xl" />
      
      <nav className="space-y-4 flex-grow">
        <div>
          <Link href="/search" passHref>
            <Button variant="ghost" className={cn("w-full justify-start text-lg mb-4", pathname === '/search' ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700/50")}>
              <Search className="mr-3 h-5 w-5" /> Search
            </Button>
          </Link>
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button variant="ghost" className={cn("w-full justify-start text-lg", pathname === item.href ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700/50")}>
                <item.icon className="mr-3 h-5 w-5" /> {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-3">Library</h2>
          {libraryNavItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button variant="ghost" className={cn("w-full justify-start text-lg", pathname.startsWith(item.href) ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700/50")}>
                <item.icon className="mr-3 h-5 w-5" /> {item.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <div>
             <Button variant="outline" className="w-full justify-start text-lg text-gray-400 hover:text-white border-gray-700 hover:bg-gray-700/50">
                <PlusSquare className="mr-3 h-5 w-5" /> Create Playlist
             </Button>
        </div>
      </nav>

      <div className="mt-auto">
         {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button variant="ghost" className={cn("w-full justify-start text-lg", pathname === item.href ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700/50")}>
                <item.icon className="mr-3 h-5 w-5" /> {item.label}
              </Button>
            </Link>
          ))}
      </div>
    </aside>
  );
}
