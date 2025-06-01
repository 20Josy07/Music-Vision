
"use client";
import type React from 'react';
import { Input } from '@/components/ui/input';
import { Search, UserCircle, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '../ui/button';

export function MusicHeader() {
  // Basic header structure
  return (
    <header className="h-20 bg-black/10 backdrop-blur-sm flex items-center justify-between px-8 flex-shrink-0 border-b border-gray-800">
      {/* Search (optional, can be global or page-specific) */}
      {/* For now, let's keep it minimal, as search is prominent on browse page */}
      <div className="text-xl font-semibold text-foreground">MusicVision</div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-gray-700/50">
          <UserCircle className="h-6 w-6" />
          <span>Username</span> 
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
