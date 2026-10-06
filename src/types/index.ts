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

/** App integrada en el propio Hub (se renderiza en proceso). Ej: DevLab. */
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

// ---------------------------------------------------------------------------
// Catálogo de apps externas (contrato Hub <-> apps)
// ---------------------------------------------------------------------------

export interface CatalogAppRelease {
  version: string;
  versionCode: number;
  publishedAt: string;
  apkUrl: string;
  size?: number;
  sha256?: string;
  minHubVersion?: string;
  changelog?: string[];
}

export interface CatalogApp {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string; // Icono Lucide de respaldo si no se puede leer el real
  accentColor: string;
  category: Exclude<AppCategory, 'todas'>;
  badge?: string;
  latest: CatalogAppRelease;
  android: {
    package: string;
    scheme: string;
  };
}

export interface AppCatalog {
  schemaVersion: number;
  updatedAt: string;
  apps: CatalogApp[];
}

// ---------------------------------------------------------------------------
// Launcher: unifica apps internas y externas para la UI
// ---------------------------------------------------------------------------

export type AppInstallState =
  | 'not-installed'
  | 'installed'
  | 'update-available'
  | 'installing'
  | 'incompatible';

export interface LauncherApp {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  category: Exclude<AppCategory, 'todas'>;
  badge?: string;
  source: 'builtin' | 'external';
  version?: string;
  /** Solo apps internas: componente a renderizar en el Hub. */
  rootComponent?: React.ComponentType<SubAppProps>;
  /** Solo apps externas: entrada del catálogo. */
  catalog?: CatalogApp;
}

export interface HubState {
  theme: ThemeMode;
  favorites: string[]; // List of app IDs
  recentAppIds: string[]; // Ordered list of recently launched app IDs
  activeAppId: string | null;
}
