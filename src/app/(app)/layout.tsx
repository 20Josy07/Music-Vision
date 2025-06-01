
import type React from 'react';
import { MusicSidebar } from '@/components/layout/MusicSidebar';
import { MusicHeader } from '@/components/layout/MusicHeader';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullScreenPlayer } from '@/components/player/FullScreenPlayer';
// SidebarProvider might be needed if MusicSidebar uses useSidebar hook internally.
// For now, assuming MusicSidebar is self-contained or AppShell is fully replaced.
// import { SidebarProvider } from '@/components/ui/sidebar';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SidebarProvider> // Only if MusicSidebar or MusicHeader need it
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white flex flex-col overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          <MusicSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <MusicHeader />
            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto"> 
              {children}
            </div>
          </main>
        </div>
        
        <MiniPlayer />
        <FullScreenPlayer />
      </div>
    // </SidebarProvider>
  );
}
