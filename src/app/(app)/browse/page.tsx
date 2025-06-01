
"use client";

import { PopularSection } from '@/components/sections/PopularSection';
import { TopTracksSection } from '@/components/sections/TopTracksSection';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    // Removed outer div with background effects, as they are now in app/(app)/layout.tsx
    // The padding and spacing for sections are now handled within this page or its child sections
    <div className="space-y-10 px-6 py-6"> {/* Added page padding and inter-section spacing */}
        <section>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
                Find The Best <br className="md:hidden" />Music For Your <br className="md:hidden" />Daily Music
            </h1>
            <form onSubmit={handleSearchSubmit} className="relative mb-6 md:mb-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                type="search"
                placeholder="Search for songs, artists, albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full h-14 text-lg bg-gray-800/70 border-gray-700/80 focus:bg-gray-700 focus:border-blue-500 backdrop-blur-sm rounded-xl placeholder-gray-500"
                aria-label="Search music"
                />
            </form>
        </section>
        <PopularSection />
        <TopTracksSection />
        {/* Genkit Badge - can be re-added if needed, here or in a global footer */}
         <div className="flex justify-center md:justify-end mt-8">
             <div className="bg-gray-800/70 backdrop-blur-sm text-xs text-gray-400 px-3 py-1.5 rounded-full shadow-lg border border-gray-700/50 flex items-center gap-1.5">
                <span>Powered by</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12.55 2.755a.5.5 0 0 0-.9 0l-2 4A.5.5 0 0 0 10 7.5h4a.5.5 0 0 0 .35-.855l-2-4Z"/><path d="M17 11h-2a1 1 0 0 0-1 1v2.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12a1 1 0 0 0-1-1Z"/><path d="m7 11-2.5 2.5a1.5 1.5 0 0 0 0 2.121L7 18"/><path d="M14.5 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>
                <span>Genkit</span>
            </div>
        </div>
    </div>
  );
}
