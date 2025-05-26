
"use client";

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, ListMusic, Music2, Search as SearchIcon, Radio, User, PlusSquare, Settings } from 'lucide-react'; // Added Settings icon
import { AppLogo } from '@/components/common/AppLogo';
import { useState } from 'react';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger, 
  useSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { BottomPlayer } from './BottomPlayer';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

const mainNavItems = [
  { href: '/browse', label: 'Browse', icon: Home, tooltip: 'Browse Music' },
  { href: '/radio', label: 'Radio', icon: Radio, tooltip: 'Radio Stations' },
  { href: '/settings', label: 'Settings', icon: Settings, tooltip: 'App Settings' }, // Added Settings item
];

const libraryNavItems = [
  { href: '/library/playlists', label: 'Playlists', icon: ListMusic, tooltip: 'Your Playlists' },
  { href: '/library/songs', label: 'Songs', icon: Music2, tooltip: 'Your Songs' },
  { href: '/library/albums', label: 'Albums', icon: Library, tooltip: 'Your Albums' },
  { href: '/library/artists', label: 'Artists', icon: User, tooltip: 'Your Artists' },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const { isMobile } = useSidebar(); 

  const handleOpenCreatePlaylistModal = () => setIsCreatePlaylistModalOpen(true);
  const handleCloseCreatePlaylistModal = () => setIsCreatePlaylistModalOpen(false);
  const handleCreatePlaylist = (playlistName: string) => {
    if (playlistName) {
      console.log("Creating playlist:", playlistName);
      // Here you would typically call a function to actually create the playlist
      // e.g., addUserPlaylist({ name: playlistName, tracks: [] });
    }
    setIsCreatePlaylistModalOpen(false);
  };

  return (
    <>
      <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r border-sidebar-border group/sidebar">
        <SidebarHeader className="p-4 border-b border-sidebar-border flex justify-between items-center flex-nowrap">
          <AppLogo className="min-w-0" />
          {!isMobile && <SidebarTrigger className="flex-shrink-0" />} 
        </SidebarHeader>
        <SidebarContent className="p-0"> 
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/search" isActive={pathname === '/search'} tooltip="Search Music">
                  <SearchIcon />
                  <span className="group-data-[collapsible=icon]/sidebar:hidden">Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton href={item.href} isActive={pathname === item.href || (item.href !== '/browse' && item.href !== '/settings' && pathname.startsWith(item.href))} tooltip={item.tooltip}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]/sidebar:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <SidebarMenu>
              {libraryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton href={item.href} isActive={pathname.startsWith(item.href)} tooltip={item.tooltip}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]/sidebar:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <div className="flex justify-between items-center px-2 mb-1"> 
              <SidebarGroupLabel className="p-0">Playlists</SidebarGroupLabel>
              <Button variant="ghost" size="icon" onClick={handleOpenCreatePlaylistModal} className="h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]/sidebar:hidden">
                <PlusSquare className="h-4 w-4" />
                <span className="sr-only">Create Playlist</span>
              </Button>
            </div>
            <SidebarMenu>
              {/* Placeholder for actual playlists */}
              <SidebarMenuItem>
                 <span className="px-2 py-1.5 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]/sidebar:hidden">No playlists yet.</span>
                 <span className="px-2 py-1.5 text-xs text-sidebar-foreground/50 hidden group-data-[collapsible=icon]/sidebar:inline">--</span>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset> 
        <div className="flex flex-col h-screen"> 
            <Header />
            <main className="flex-1 overflow-y-auto p-6 pb-[calc(6rem+1.5rem)]"> 
                {children}
            </main>
        </div>
      </SidebarInset>
      
      <BottomPlayer /> 
      
      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={handleCloseCreatePlaylistModal}
        onCreate={handleCreatePlaylist}
      />
    </>
  );
}
