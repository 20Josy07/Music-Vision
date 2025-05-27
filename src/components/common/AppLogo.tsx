
import { Music } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showName?: boolean; // Added prop to control name visibility
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-xl", showName = true }) => {
  return (
    <div className={cn(`flex items-center gap-2`, className)}>
      <Music className="text-primary flex-shrink-0" size={iconSize} />
      {showName && (
        <span className={cn(
          "font-bold text-foreground truncate group-data-[collapsible=icon]/sidebar:hidden",
          textSize
        )}>
          MusicVision
        </span>
      )}
    </div>
  );
};
