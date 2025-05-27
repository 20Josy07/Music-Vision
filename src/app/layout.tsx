
import type { Metadata } from 'next';
// Removed Geist fonts to use system default sans-serif as per request.
// import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Toaster } from "@/components/ui/toaster";

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'MusicVision',
  description: 'Your vision of music.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Removed geistSans.variable and geistMono.variable from body className */}
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Defaulting to dark theme
          enableSystem={false} // To enforce dark theme as per screenshot
          disableTransitionOnChange
        >
          <PlayerProvider>
            {children}
            <Toaster />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
