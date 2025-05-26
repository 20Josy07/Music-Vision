"use client";

import type { Color } from "@/types";
import { ColorCard } from "./ColorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaletteDisplayProps {
  palette: Color[];
  onToggleLock: (id: string) => void;
  onRemoveColor: (id: string) => void;
  onCopyColor: (hex: string) => void;
}

export function PaletteDisplay({ palette, onToggleLock, onRemoveColor, onCopyColor }: PaletteDisplayProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Your Palette</CardTitle>
      </CardHeader>
      <CardContent>
        {palette.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Your palette is empty. Add some colors!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {palette.map((color) => (
              <ColorCard
                key={color.id}
                color={color}
                onToggleLock={onToggleLock}
                onRemoveColor={onRemoveColor}
                onCopyColor={onCopyColor}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
