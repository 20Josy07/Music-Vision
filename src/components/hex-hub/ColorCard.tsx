"use client";

import type { Color } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LockIcon, UnlockIcon, CopyIcon, Trash2Icon, CheckIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ColorCardProps {
  color: Color;
  onToggleLock: (id: string) => void;
  onRemoveColor: (id: string) => void;
  onCopyColor: (hex: string) => void;
}

export function ColorCard({ color, onToggleLock, onRemoveColor, onCopyColor }: ColorCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyColor(color.hex);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div
          className="h-32 w-full border-b"
          style={{ backgroundColor: color.hex }}
          aria-label={`Color swatch for ${color.hex}`}
        />
        <CardContent className="p-4">
          <p className="text-lg font-mono font-semibold tracking-wider text-center">{color.hex.toUpperCase()}</p>
        </CardContent>
        <CardFooter className="p-3 flex justify-around bg-muted/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleLock(color.id)}
                aria-label={color.locked ? "Unlock color" : "Lock color"}
                className="transition-transform hover:scale-110"
              >
                {color.locked ? <LockIcon className="text-primary" /> : <UnlockIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color.locked ? "Unlock" : "Lock"} color</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy hex code"
                className="transition-transform hover:scale-110"
              >
                {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy hex code"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveColor(color.id)}
                disabled={color.locked}
                aria-label="Remove color"
                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2Icon className={color.locked ? "text-muted-foreground" : "text-destructive"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color.locked ? "Unlock to remove" : "Remove color"}</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
