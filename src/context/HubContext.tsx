import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ThemeMode, LauncherApp, CatalogApp, AppInstallState } from '../types';
import { THEMES, ThemeColors } from '../theme/colors';
import { HubStorage } from '../storage/hubStorage';
import { AppRegistry } from '../apps/registry';
import { CatalogService } from '../catalog/catalogService';
import { getAppIcon, openExternalApp, installExternalApp } from '../apps/launcherService';
import { getPackageInfo } from '../../modules/htz-package-info/src/HtzPackageInfoModule';
import { HUB_VERSION } from '../config';

interface HubContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
  activeAppId: string | null;
  activeApp: LauncherApp | null;
  launchApp: (appId: string) => Promise<void>;
  exitToHub: () => void;
  favorites: string[];
  toggleFavorite: (appId: string) => Promise<void>;
  isFavorite: (appId: string) => boolean;
  recentAppIds: string[];
  recentApps: LauncherApp[];
  refreshHub: () => Promise<void>;
  // Launcher de apps externas
  catalog: CatalogApp[];
  refreshCatalog: () => Promise<void>;
  appStates: Record<string, AppInstallState>;
  appIcons: Record<string, string>;
  installApp: (app: LauncherApp) => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

/** Compara versiones semánticas tipo "2.1.0". Devuelve >0 si a > b. */
const compareVersions = (a: string, b: string): number => {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('sage');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['score-viewer']);
  const [recentAppIds, setRecentAppIds] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<CatalogApp[]>([]);
  const [installedVersions, setInstalledVersions] = useState<Record<string, string>>({});
  const [installedFlags, setInstalledFlags] = useState<Record<string, boolean>>({});
  const [appIcons, setAppIcons] = useState<Record<string, string>>({});
  const [installing, setInstalling] = useState<Record<string, boolean>>({});

  /** Detecta apps externas instaladas, su versión real y su icono (Android). */
  const detectInstalled = useCallback(async (apps: CatalogApp[]) => {
    const flags: Record<string, boolean> = {};
    const icons: Record<string, string> = {};
    const versions: Record<string, string> = {};
    await Promise.all(
      apps.map(async (app) => {
        // Versión real instalada vía módulo nativo. Si el módulo no está
        // disponible, caemos a la detección por icono (sin versión).
        const info = getPackageInfo(app.android.package);
        const icon = await getAppIcon(app.android.package);
        flags[app.id] = info !== null || icon !== null;
        if (icon) icons[app.id] = icon;
        if (info && info.versionName) versions[app.id] = info.versionName;
      }),
    );
    setInstalledFlags(flags);
    setAppIcons(icons);
    setInstalledVersions((prev) => ({ ...prev, ...versions }));
  }, []);

  const bootstrap = useCallback(async () => {
    const savedTheme = await HubStorage.getTheme();
    setThemeState(savedTheme);

    const savedFavs = await HubStorage.getFavorites();
    if (savedFavs.length > 0) setFavorites(savedFavs);
    else await HubStorage.saveFavorites(['score-viewer']);

    const recents = await HubStorage.getRecentApps();
    setRecentAppIds(recents);

    setInstalledVersions(await HubStorage.getInstalledVersions());

    // 1) Catálogo local (embebido/caché) para render inmediato
    const local = await CatalogService.get();
    setCatalog(local.apps);
    detectInstalled(local.apps);

    // 2) Intento de actualización remota
    const remote = await CatalogService.refresh();
    setCatalog(remote.apps);
    detectInstalled(remote.apps);
  }, [detectInstalled]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await HubStorage.setTheme(mode);
  };

  const refreshCatalog = async () => {
    const remote = await CatalogService.refresh();
    setCatalog(remote.apps);
    detectInstalled(remote.apps);
  };

  const openExternal = async (app: LauncherApp) => {
    if (!app.catalog) return;
    openExternalApp(app.catalog.android.package, app.catalog.android.scheme);
    const updated = await HubStorage.addRecentApp(app.id);
    setRecentAppIds(updated);
  };

  const installApp = async (app: LauncherApp) => {
    if (!app.catalog) return;
    setInstalling((prev) => ({ ...prev, [app.id]: true }));
    try {
      await installExternalApp(app.catalog);
      // Al volver del instalador, re-detectamos el estado real
      const icon = await getAppIcon(app.catalog.android.package);
      const nowInstalled = icon !== null;
      setInstalledFlags((prev) => ({ ...prev, [app.id]: nowInstalled }));
      if (icon) setAppIcons((prev) => ({ ...prev, [app.id]: icon }));
      if (nowInstalled) {
        await HubStorage.setInstalledVersion(app.id, app.catalog.latest.version);
        setInstalledVersions((prev) => ({ ...prev, [app.id]: app.catalog!.latest.version }));
        const updated = await HubStorage.addRecentApp(app.id);
        setRecentAppIds(updated);
      }
    } catch (err) {
      Alert.alert(
        'Error al instalar',
        err instanceof Error ? err.message : 'No se pudo completar la instalación.',
      );
    } finally {
      setInstalling((prev) => ({ ...prev, [app.id]: false }));
    }
  };

  // Estado derivado de cada app externa
  const appStates: Record<string, AppInstallState> = {};
  catalog.forEach((app) => {
    if (installing[app.id]) {
      appStates[app.id] = 'installing';
      return;
    }
    if (app.latest.minHubVersion && compareVersions(app.latest.minHubVersion, HUB_VERSION) > 0) {
      appStates[app.id] = 'incompatible';
      return;
    }
    if (!installedFlags[app.id]) {
      appStates[app.id] = 'not-installed';
      return;
    }
    const recorded = installedVersions[app.id];
    appStates[app.id] =
      recorded && compareVersions(app.latest.version, recorded) > 0
        ? 'update-available'
        : 'installed';
  });

  const launchApp = async (appId: string) => {
    const app = AppRegistry.getById(appId, catalog);
    if (!app) return;

    if (app.source === 'builtin') {
      setActiveAppId(appId);
      const updated = await HubStorage.addRecentApp(appId);
      setRecentAppIds(updated);
      return;
    }

    const state = appStates[appId] ?? 'not-installed';
    if (state === 'installed' || state === 'update-available') {
      await openExternal(app);
    } else if (state === 'not-installed') {
      await installApp(app);
    }
  };

  const exitToHub = () => setActiveAppId(null);

  const toggleFavorite = async (appId: string) => {
    const next = favorites.includes(appId)
      ? favorites.filter((id) => id !== appId)
      : [...favorites, appId];
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
    await refreshCatalog();
  };

  const activeApp = activeAppId ? AppRegistry.getById(activeAppId, catalog) || null : null;
  const recentApps = AppRegistry.getRecents(recentAppIds, catalog);
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
        catalog,
        refreshCatalog,
        appStates,
        appIcons,
        installApp,
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
