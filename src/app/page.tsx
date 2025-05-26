"use client";

import { useState, useEffect } from "react";
import type { Color } from "@/types";
import { PaletteDisplay } from "@/components/hex-hub/PaletteDisplay";
import { HexInput } from "@/components/hex-hub/HexInput";
import { SuggestionsGenerator } from "@/components/hex-hub/SuggestionsGenerator";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Palette } from "lucide-react";

export default function HomePage() {
  const [palette, setPalette] = useState<Color[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Initialize with a default palette only on the client after mount
    setPalette([
      { id: crypto.randomUUID(), hex: "#3F51B5", locked: true }, // Primary
      { id: crypto.randomUUID(), hex: "#7952B3", locked: false }, // Accent
      { id: crypto.randomUUID(), hex: "#4CAF50", locked: false },
      { id: crypto.randomUUID(), hex: "#FFC107", locked: false },
    ]);
  }, []);


  const handleAddColor = (hex: string) => {
    const upperHex = hex.toUpperCase();
    if (palette.some(c => c.hex === upperHex)) {
      toast({
        title: "Color Exists",
        description: `${upperHex} is already in your palette.`,
        variant: "default",
      });
      return;
    }
    const newColor: Color = { id: crypto.randomUUID(), hex: upperHex, locked: false };
    setPalette(prev => [...prev, newColor]);
    toast({
      title: "Color Added",
      description: `${upperHex} has been added to your palette.`,
    });
  };

  const handleRemoveColor = (id: string) => {
    const colorToRemove = palette.find(c => c.id === id);
    if (colorToRemove?.locked) {
      toast({
        title: "Cannot Remove Locked Color",
        description: "Please unlock the color before removing it.",
        variant: "destructive",
      });
      return;
    }
    setPalette(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Color Removed",
      description: `${colorToRemove?.hex} has been removed.`,
    });
  };

  const handleToggleLock = (id: string) => {
    setPalette(prev => 
      prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c)
    );
    const color = palette.find(c => c.id === id);
    if (color) {
      toast({
        title: `Color ${color.locked ? "Unlocked" : "Locked"}`,
        description: `${color.hex} is now ${color.locked ? "unlocked" : "locked"}.`,
      });
    }
  };

  const handleCopyColor = async (hex: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(hex);
        toast({
          title: "Copied to Clipboard",
          description: `${hex} copied!`,
        });
      } else {
        throw new Error("Clipboard API not available.");
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Your browser might not support this feature or you are not in a secure context (HTTPS).",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 shadow-md bg-card border-b border-border">
        <div className="container mx-auto flex items-center gap-3">
          <Palette className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-primary tracking-tight">Hex Hub</h1>
        </div>
        <p className="container mx-auto mt-1 text-muted-foreground">
          Your central place to craft, manage, and discover harmonious color palettes.
        </p>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <HexInput onAddColor={handleAddColor} />
          <SuggestionsGenerator currentPalette={palette} onAddSuggestedColor={handleAddColor} />
        </div>
        
        <Separator className="my-8" />

        <PaletteDisplay 
          palette={palette}
          onToggleLock={handleToggleLock}
          onRemoveColor={handleRemoveColor}
          onCopyColor={handleCopyColor}
        />
      </main>

      <footer className="py-6 text-center text-muted-foreground border-t border-border mt-12">
        <p>&copy; {new Date().getFullYear()} Hex Hub. Powered by AI.</p>
      </footer>
    </div>
  );
}

// Basic Loader Icon (can be replaced or enhanced)
function Loader2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
