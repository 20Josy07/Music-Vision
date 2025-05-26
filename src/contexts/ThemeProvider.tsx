
"use client";

import type { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return null or a loading state on the server or before hydration
    // This helps avoid hydration mismatches with theme-dependent rendering
    return null; 
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
