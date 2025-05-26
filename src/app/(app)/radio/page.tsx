
import { Radio } from 'lucide-react';

export default function RadioPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Radio className="w-24 h-24 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-semibold text-foreground mb-2">Radio Stations</h1>
      <p className="text-muted-foreground max-w-md">
        Discover curated radio stations based on your favorite genres, artists, or moods.
        This feature is coming soon!
      </p>
    </div>
  );
}
