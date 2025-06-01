
"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MobileSearchProps {
  isOpen: boolean
  onClose: () => void;
  onSearchSubmit: (query: string) => void; // Added for search submission
}

export function MobileSearch({ isOpen, onClose, onSearchSubmit }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 z-50 transform transition-transform duration-300 ease-in-out sm:hidden",
        isOpen ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 p-3"> {/* Reduced gap and padding slightly */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> {/* Slightly smaller icon */}
            <Input
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 text-white placeholder:text-gray-400 rounded-lg transition-all duration-300 focus:bg-white/15 text-sm" // Adjusted padding, height, rounded, text size
              autoFocus
            />
          </div>
          <Button
            type="button" // Explicitly type as button to not submit form by default
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 h-11 w-11" // Adjusted size
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </form>

      {/* Search Results Preview (Placeholder) */}
      {isOpen && searchQuery && ( // Only show results preview if open and query exists
        <div className="px-3 pb-3"> {/* Reduced padding */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 max-h-60 overflow-y-auto"> {/* Adjusted padding and added max-h + overflow */}
            <p className="text-sm text-gray-400 text-center">Search results for "{searchQuery}"</p>
            <p className="text-xs text-gray-500 text-center mt-1">Feature coming soon...</p>
            {/* Example of how results might look (add later) */}
            {/* 
            <div className="mt-2 space-y-1 text-left">
              <div className="p-2 hover:bg-white/10 rounded-md cursor-pointer text-white text-sm">Result 1</div>
              <div className="p-2 hover:bg-white/10 rounded-md cursor-pointer text-white text-sm">Result 2</div>
            </div>
            */}
          </div>
        </div>
      )}
    </div>
  )
}
