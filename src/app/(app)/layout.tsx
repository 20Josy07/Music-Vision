
import { AppShell } from '@/components/layout/AppShell';
import { FullScreenPlayer } from '@/components/player/FullScreenPlayer';
import { SidebarProvider } from '@/components/ui/sidebar';
import type React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppShell>
        {children}
      </AppShell>
      <FullScreenPlayer />
    </SidebarProvider>
  );
}
