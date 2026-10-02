import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, IntegratedAppManifest } from '../types';
import { THEMES, ThemeColors } from '../theme/colors';
import { HubStorage } from '../storage/hubStorage';
import { AppRegistry } from '../apps/registry';

interface HubContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
  activeAppId: string | null;
  activeApp: IntegratedAppManifest | null;
  launchApp: (appId: string) => Promise<void>;
  exitToHub: () => void;
  favorites: string[];
  toggleFavorite: (appId: string) => Promise<void>;
  isFavorite: (appId: string) => boolean;
  recentAppIds: string[];
  recentApps: IntegratedAppManifest[];
  refreshHub: () => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('sage');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['score-viewer']);
  const [recentAppIds, setRecentAppIds] = useState<string[]>([]);

  useEffect(() => {
    // Initial load
    (async () => {
      const savedTheme = await HubStorage.getTheme();
      setThemeState(savedTheme);

      const savedFavs = await HubStorage.getFavorites();
      if (savedFavs.length > 0) {
        setFavorites(savedFavs);
      } else {
        // Default favorites
        await HubStorage.saveFavorites(['score-viewer']);
      }

      const recents = await HubStorage.getRecentApps();
      setRecentAppIds(recents);
    })();
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await HubStorage.setTheme(mode);
  };

  const launchApp = async (appId: string) => {
    setActiveAppId(appId);
    const updatedRecents = await HubStorage.addRecentApp(appId);
    setRecentAppIds(updatedRecents);
  };

  const exitToHub = () => {
    setActiveAppId(null);
  };

  const toggleFavorite = async (appId: string) => {
    let next: string[];
    if (favorites.includes(appId)) {
      next = favorites.filter((id) => id !== appId);
    } else {
      next = [...favorites, appId];
    }
    setFavorites(next);
    await HubStorage.saveFavorites(next);
  };

  const isFavorite = (appId: string) => favorites.includes(appId);

  const refreshHub = async () => {
    const savedTheme = await HubStorage.getTheme();
    setThemeState(savedTheme);
    const savedFavs = await HubStorage.getFavorites();
    setFavorites(savedFavs);
    const recents = await HubStorage.getRecentApps();
    setRecentAppIds(recents);
  };

  const activeApp = activeAppId ? AppRegistry.getById(activeAppId) || null : null;
  const recentApps = AppRegistry.getRecents(recentAppIds);
  const colors = THEMES[theme];

  return (
    <HubContext.Provider
      value={{
        theme,
        colors,
        setTheme,
        activeAppId,
        activeApp,
        launchApp,
        exitToHub,
        favorites,
        toggleFavorite,
        isFavorite,
        recentAppIds,
        recentApps,
        refreshHub,
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export const useHub = (): HubContextType => {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error('useHub debe usarse dentro de un HubProvider');
  }
  return context;
};
