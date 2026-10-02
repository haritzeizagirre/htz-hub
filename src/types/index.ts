import React from 'react';

export type ThemeMode = 'dark' | 'light' | 'oled' | 'sage';

export type AppCategory = 'todas' | 'deportes' | 'utilidades' | 'herramientas' | 'laboratorio';

export interface SubAppStorage {
  get: <T = string>(key: string, defaultValue?: T) => Promise<T | null>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface SubAppProps {
  appId: string;
  onExitToHub: () => void;
  storage: SubAppStorage;
}

export interface IntegratedAppManifest {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  version: string;
  author: string;
  icon: string; // Key corresponding to Lucide icon
  accentColor: string;
  category: Exclude<AppCategory, 'todas'>;
  badge?: string;
  isReady: boolean;
  rootComponent: React.ComponentType<SubAppProps>;
}

export interface HubState {
  theme: ThemeMode;
  favorites: string[]; // List of app IDs
  recentAppIds: string[]; // Ordered list of recently launched app IDs
  activeAppId: string | null;
}
