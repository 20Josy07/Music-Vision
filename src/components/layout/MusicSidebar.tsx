
"use client";
import type React from 'react';
import Link from 'next/link';
import { Music, Search, Radio, Settings, List, Music2, Disc, Users, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation'; // Added for active state
import { AppLogo } from '@/components/common/AppLogo'; // Keeping this for consistency for now, user can remove if truly replaced

// Define item types for clarity
interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function MusicSidebar() {
  const pathname = usePathname();

  const navigationItems: NavItem[] = [
    { icon: Music, label: "Browse", href: "/browse" }, // Matched to existing browse path
    { icon: Radio, label: "Radio", href: "/radio" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const libraryItems: NavItem[] = [
    { icon: List, label: "Playlists", href: "/library/playlists" }, // Matched to existing paths
    { icon: Music2, label: "Songs", href: "/library/songs" },
    { icon: Disc, label: "Albums", href: "/library/albums" },
    { icon: Users, label: "Artists", href: "/library/artists" },
  ];

  return (
    <aside className="w-72 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex-col relative overflow-hidden hidden md:flex">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
              <Music className="w-6 h-6 text-white relative z-10" />
            </div>
            <div>
              {/* Using AppLogo for consistency with the rest of the app's branding for now.
                  The user can decide to keep this or the custom "MusicApp" text.
                  If AppLogo is kept, textSize can be adjusted if needed. */}
              <AppLogo textSize="text-xl" /> 
              {/* <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MusicApp
              </span> */}
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-400">Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.label} href={item.href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl",
                  pathname === item.href &&
                    "bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20 backdrop-blur-sm",
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="px-4 mt-6">
          <Link href="/search" passHref> {/* Make search button a link to search page */}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl",
                 pathname === '/search' && "bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20 backdrop-blur-sm",
                )}
            >
              <Search className="w-5 h-5" />
              Search
            </Button>
          </Link>
        </div>

        {/* Library Section */}
        <div className="mt-8 px-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 px-3 uppercase tracking-wider">Library</h3>
          <nav className="space-y-1">
            {libraryItems.map((item) => (
              <Link key={item.label} href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg",
                    pathname.startsWith(item.href) && "bg-white/10 text-white", // Simpler active state for library items
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Playlists Section - This part might need to be scrollable if list grows */}
        <div className="mt-auto px-4 pb-6 pt-4"> {/* mt-auto to push to bottom, added pb-6 */}
          <div className="flex items-center justify-between mb-4 px-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Playlists</h3>
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              // onClick={() => console.log("Open create playlist modal")} // Placeholder for future modal
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 text-center">Create your first playlist</p>
            <Button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
