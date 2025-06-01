
"use client";
import type React from 'react';
import { Search, Bell, User } from "lucide-react"; // Sun removed as ThemeToggle will be used
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from '@/components/common/ThemeToggle'; // Import ThemeToggle

export function MusicHeader() {
  // Basic header structure
  return (
    <header className="h-20 border-b border-white/10 bg-black/20 backdrop-blur-2xl flex items-center justify-between px-8 relative overflow-hidden flex-shrink-0">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-emerald-900/10 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
            Browse
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover new music</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative group hidden md:block"> {/* Hide on small screens where browse page has its own search */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
            <Input
              placeholder="Search songs, artists, albums..."
              className="pl-12 pr-4 w-96 h-12 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:bg-white/15 focus:shadow-lg focus:shadow-blue-500/20"
              // Add search state and handlers if this search should be functional
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 relative"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black/20"></div> {/* Added border for better visibility */}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle /> {/* Replaced static Sun icon with functional ThemeToggle */}

          {/* Profile */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40/7058A3/FFFFFF.png?text=JD" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white hidden sm:inline">John Doe</span> {/* Hide name on very small screens */}
          </div>
        </div>
      </div>
    </header>
  );
}
