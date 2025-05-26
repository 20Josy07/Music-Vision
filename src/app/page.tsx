"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Music, Wand2 } from 'lucide-react';
import { getNextSongRecommendation, type NextSongRecommendationInput, type NextSongRecommendationOutput } from '@/ai/flows/next-song-recommendation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const recommendationFormSchema = z.object({
  playlist: z.string().min(1, "Please enter some songs for the current playlist."),
  listeningHistory: z.string().min(1, "Please provide some listening history."),
});

type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState<NextSongRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // To avoid hydration errors with Math.random for initial "random" placeholder text
  const [randomPlaylistPlaceholder, setRandomPlaylistPlaceholder] = useState("e.g., Yesterday, Bohemian Rhapsody, Hotel California");
  const [randomHistoryPlaceholder, setRandomHistoryPlaceholder] = useState("e.g., Stairway to Heaven, Imagine, Like a Rolling Stone");

  useEffect(() => {
    const playlists = [
      "e.g., Yesterday, Bohemian Rhapsody, Hotel California",
      "e.g., Shape of You, Blinding Lights, Watermelon Sugar",
      "e.g., Smells Like Teen Spirit, Wonderwall, Creep"
    ];
    const histories = [
      "e.g., Stairway to Heaven, Imagine, Like a Rolling Stone",
      "e.g., Don't Stop Believin', Billie Jean, Sweet Child O' Mine",
      "e.g., Africa, Take On Me, Every Breath You Take"
    ];
    setRandomPlaylistPlaceholder(playlists[Math.floor(Math.random() * playlists.length)]);
    setRandomHistoryPlaceholder(histories[Math.floor(Math.random() * histories.length)]);
  }, []);


  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      playlist: '',
      listeningHistory: '',
    },
  });

  const onSubmit: SubmitHandler<RecommendationFormValues> = async (data) => {
    setIsLoading(true);
    setRecommendation(null);
    
    const playlistArray = data.playlist.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const listeningHistoryArray = data.listeningHistory.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (playlistArray.length === 0 || listeningHistoryArray.length === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please ensure both playlist and listening history have at least one song after processing (e.g. 'Song A, Song B').",
      });
      setIsLoading(false);
      return;
    }

    const input: NextSongRecommendationInput = {
      playlist: playlistArray,
      listeningHistory: listeningHistoryArray,
    };

    try {
      const result = await getNextSongRecommendation(input);
      setRecommendation(result);
    } catch (error) {
      console.error("Error getting song recommendation:", error);
      toast({
        variant: "destructive",
        title: "Recommendation Failed",
        description: "Could not fetch song recommendation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">AI Song Recommender</CardTitle>
          </div>
          <CardDescription>
            Tell us what you&apos;re listening to, and we&apos;ll suggest the next banger!
            Enter songs separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="playlist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Current Playlist</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={randomPlaylistPlaceholder}
                        className="resize-none min-h-[100px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listeningHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Listening History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={randomHistoryPlaceholder}
                        className="resize-none min-h-[100px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Recommendation...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-5 w-5" />
                    Recommend Next Song
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        {recommendation && !isLoading && (
          <CardFooter className="mt-6">
            <Alert variant="default" className="w-full border-primary shadow-md">
              <Wand2 className="h-5 w-5 text-primary" />
              <AlertTitle className="text-xl font-semibold text-primary">Here&apos;s your next song!</AlertTitle>
              <AlertDescription className="mt-2 space-y-2 text-base">
                <p><strong className="font-medium">Song:</strong> {recommendation.recommendedSong}</p>
                <p><strong className="font-medium">Reason:</strong> {recommendation.reason}</p>
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
