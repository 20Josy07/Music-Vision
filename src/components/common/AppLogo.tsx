
import { Music } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-xl" }) => {
  return (
    <div className={cn(`flex items-center gap-2`, className)}>
      <Music className="text-primary flex-shrink-0" size={iconSize} />
      <span className={cn(
        "font-bold text-foreground truncate group-data-[collapsible=icon]/sidebar:hidden",
        textSize
      )}>
        MusicVerse
      </span>
    </div>
  );
};
