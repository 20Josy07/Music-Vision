import type { NavItem } from '@/types';
import { Sparkles, Search, ListMusic, User } from 'lucide-react';

export const SiteConfig = {
  name: "Harmonia",
  description: "Your personal music sanctuary. Discover, listen, and enjoy.",
  navItems: [
    {
      label: "Recommendations",
      href: "/",
      icon: Sparkles,
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
    },
    {
      label: "Playlists",
      href: "/playlists",
      icon: ListMusic,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ] as NavItem[],
};
