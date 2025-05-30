
import type React from 'react';
import { cn } from '@/lib/utils';

interface SpotifyIconProps extends React.SVGProps<SVGSVGElement> {
  // You can add specific props here if needed, e.g., size
}

export const SpotifyIcon: React.FC<SpotifyIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0" // Spotify icon is usually just fill
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-spotify", className)} // Keep lucide class for consistency if other icons are styled this way
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.023 13.81a.75.75 0 0 1-1.03.522c-2.024-1.234-4.563-1.515-7.604-.828a.758.758 0 0 1-.858-.611.75.75 0 0 1 .61-.858c3.397-.762 6.278-.42 8.566.99a.75.75 0 0 1 .316 1.03.75.75 0 0 1-.248.203zm1.13-2.332a.75.75 0 0 1-1.204.606c-2.337-1.435-5.725-1.82-8.387-.996a.75.75 0 0 1-.907-.678.75.75 0 0 1 .678-.907c3.046-.907 6.788-.476 9.496 1.17a.75.75 0 0 1 .324.705zM17.73 11.1a.75.75 0 0 1-1.355.495c-2.535-1.617-6.82-1.98-9.644-1.09a.75.75 0 0 1-.81-.973.75.75 0 0 1 .974-.81c3.27-.996 7.975-.565 10.886 1.287a.75.75 0 0 1-.05.991z"/>
    </svg>
  );
};
