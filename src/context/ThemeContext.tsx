import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';
export type WallpaperType = 'islamic' | 'emerald' | 'night' | 'minimal' | 'doodle' | 'custom';

interface ThemeContextType {
  theme: ThemeMode;
  wallpaper: WallpaperType;
  customWallpaperUrl: string;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setWallpaper: (type: WallpaperType, customUrl?: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'maisya_theme';
const WALLPAPER_KEY = 'maisya_chat_wallpaper';
const CUSTOM_WALLPAPER_KEY = 'maisya_custom_wallpaper';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [wallpaper, setWallpaperState] = useState<WallpaperType>(() => {
    const saved = localStorage.getItem(WALLPAPER_KEY);
    const valid: WallpaperType[] = ['islamic', 'emerald', 'night', 'minimal', 'doodle', 'custom'];
    return (valid.includes(saved as WallpaperType)) ? (saved as WallpaperType) : 'islamic';
  });

  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string>(() => {
    return localStorage.getItem(CUSTOM_WALLPAPER_KEY) || '';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);

    // Update meta theme-color for browser tab / mobile header
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#064E3B' : '#047857');
    }

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setWallpaper = (type: WallpaperType, customUrl?: string) => {
    setWallpaperState(type);
    localStorage.setItem(WALLPAPER_KEY, type);
    if (customUrl !== undefined) {
      setCustomWallpaperUrl(customUrl);
      localStorage.setItem(CUSTOM_WALLPAPER_KEY, customUrl);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        wallpaper,
        customWallpaperUrl,
        setTheme,
        toggleTheme,
        setWallpaper
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
