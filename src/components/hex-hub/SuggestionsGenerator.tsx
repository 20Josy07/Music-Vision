"use client";

import { useState } from "react";
import type { Color } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHarmoniousColors } from "@/ai/flows/harmonious-color-suggestions";
import { SparklesIcon, PlusCircleIcon, Loader2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface SuggestionsGeneratorProps {
  currentPalette: Color[];
  onAddSuggestedColor: (hex: string) => void;
}

export function SuggestionsGenerator({ currentPalette, onAddSuggestedColor }: SuggestionsGeneratorProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const baseColors = currentPalette.map((c) => c.hex);
    if (baseColors.length === 0) {
      toast({
        title: "Cannot Generate Suggestions",
        description: "Please add at least one color to your palette first.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await getHarmoniousColors({ baseColors, numSuggestions: 5 });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions.map(s => s.toUpperCase()));
      } else {
        setError("No suggestions were generated. Try different base colors.");
        toast({
          title: "No Suggestions",
          description: "The AI couldn't find harmonious colors. Try different base colors.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error("Error getting color suggestions:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get suggestions: ${errorMessage}`);
      toast({
        title: "Error Generating Suggestions",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">AI Color Harmony</CardTitle>
        <CardDescription>Discover new colors that complement your current palette.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={handleGetSuggestions}
          disabled={isLoading}
          className="w-full text-base py-3"
        >
          {isLoading ? (
            <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <SparklesIcon className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Generating..." : "Get Harmonious Suggestions"}
        </Button>

        {error && <p className="text-destructive text-center">{error}</p>}

        {suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-center text-foreground/80">Suggested Colors:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {suggestions.map((hex, index) => (
                <Card key={index} className="flex flex-col items-center p-3 shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className="h-16 w-full rounded mb-2 border"
                    style={{ backgroundColor: hex }}
                  />
                  <p className="text-sm font-mono mb-2">{hex}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddSuggestedColor(hex)}
                        aria-label={`Add ${hex} to palette`}
                        className="w-full"
                      >
                        <PlusCircleIcon className="mr-1.5 h-4 w-4" /> Add
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add {hex} to palette</p>
                    </TooltipContent>
                  </Tooltip>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
