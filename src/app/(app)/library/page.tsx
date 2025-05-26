
import { redirect } from 'next/navigation';

export default function LibraryPage() {
  // Default to showing playlists or songs under library
  redirect('/library/playlists');
  // Or, render an overview page for the library here
  // return (
  //   <div>
  //     <h1 className="text-2xl font-semibold text-foreground">Library Overview</h1>
  //     <p className="text-muted-foreground">Select a category from the sidebar.</p>
  //   </div>
  // );
}
