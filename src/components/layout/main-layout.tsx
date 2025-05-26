"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2 } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { SiteConfig } from '@/config/site';
import { AppHeader } from './app-header';
import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <SidebarProvider defaultOpen={true} >
      <div className="flex min-h-screen bg-background">
        <ConnectedSidebar pathname={pathname} />
        <SidebarInset className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Sidebar needs to be a client component if it uses useSidebar hook for collapsible state
function ConnectedSidebar({ pathname }: { pathname: string }) {
  const { open, isMobile } = useSidebar(); // Access sidebar state

  return (
    <Sidebar 
      className={cn(
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md",
        // Shadcn sidebar handles its own visibility based on `open` state and screen size
      )}
      collapsible={isMobile ? "offcanvas" : "icon"} // Example of conditional collapsibility
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5">
          <Music2 className="h-8 w-8 text-primary" />
          <span className={cn(
            "text-2xl font-bold text-primary transition-opacity duration-300",
            !open && !isMobile && "opacity-0 w-0 hidden group-data-[collapsible=icon]:hidden", // Hide text when collapsed on desktop
             open && "group-data-[collapsible=icon]:block" // Ensure text shows when expanded
          )}>
            {SiteConfig.name}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {SiteConfig.navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                variant="default"
                size="default"
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right', align: 'center', className: "bg-popover text-popover-foreground"}}
                className="justify-start"
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                     "transition-opacity duration-300",
                     !open && !isMobile && "opacity-0 w-0 hidden group-data-[collapsible=icon]:hidden",
                     open && "group-data-[collapsible=icon]:block"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
