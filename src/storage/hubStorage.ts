import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubAppStorage, ThemeMode } from '../types';

const HUB_KEYS = {
  THEME: '@hub_theme_mode',
  FAVORITES: '@hub_favorites_list',
  RECENTS: '@hub_recent_apps_list',
  INSTALLED_VERSIONS: '@hub_installed_versions',
};

export const HubStorage = {
  // Hub Theme
  async getTheme(): Promise<ThemeMode> {
    try {
      const val = await AsyncStorage.getItem(HUB_KEYS.THEME);
      if (val === 'dark' || val === 'light' || val === 'oled' || val === 'sage') return val;
      return 'sage';
    } catch {
      return 'sage';
    }
  },

  async setTheme(mode: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(HUB_KEYS.THEME, mode);
    } catch (err) {
      console.warn('Error saving theme:', err);
    }
  },

  // Favorites
  async getFavorites(): Promise<string[]> {
    try {
      const val = await AsyncStorage.getItem(HUB_KEYS.FAVORITES);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  async saveFavorites(favs: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HUB_KEYS.FAVORITES, JSON.stringify(favs));
    } catch (err) {
      console.warn('Error saving favorites:', err);
    }
  },

  // Recent apps
  async getRecentApps(): Promise<string[]> {
    try {
      const val = await AsyncStorage.getItem(HUB_KEYS.RECENTS);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  async addRecentApp(appId: string): Promise<string[]> {
    try {
      const current = await this.getRecentApps();
      const filtered = current.filter((id) => id !== appId);
      const updated = [appId, ...filtered].slice(0, 8); // Keep last 8
      await AsyncStorage.setItem(HUB_KEYS.RECENTS, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  // Installed external apps (version recorded at install time by the Hub)
  async getInstalledVersions(): Promise<Record<string, string>> {
    try {
      const val = await AsyncStorage.getItem(HUB_KEYS.INSTALLED_VERSIONS);
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  },

  async setInstalledVersion(appId: string, version: string): Promise<void> {
    try {
      const current = await this.getInstalledVersions();
      current[appId] = version;
      await AsyncStorage.setItem(HUB_KEYS.INSTALLED_VERSIONS, JSON.stringify(current));
    } catch (err) {
      console.warn('Error guardando versión instalada:', err);
    }
  },

  // Per-app isolated storage provider
  getAppStorage(appId: string): SubAppStorage {
    const prefix = `@app_${appId}_`;
    return {
      async get<T = string>(key: string, defaultValue?: T): Promise<T | null> {
        try {
          const raw = await AsyncStorage.getItem(`${prefix}${key}`);
          if (raw === null) return defaultValue ?? null;
          try {
            return JSON.parse(raw);
          } catch {
            return raw as unknown as T;
          }
        } catch {
          return defaultValue ?? null;
        }
      },
      async set(key: string, value: any): Promise<void> {
        try {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          await AsyncStorage.setItem(`${prefix}${key}`, serialized);
        } catch (err) {
          console.warn(`Error setting key ${key} for app ${appId}:`, err);
        }
      },
      async remove(key: string): Promise<void> {
        try {
          await AsyncStorage.removeItem(`${prefix}${key}`);
        } catch (err) {
          console.warn(`Error removing key ${key} for app ${appId}:`, err);
        }
      },
      async clear(): Promise<void> {
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const appKeys = allKeys.filter((k) => k.startsWith(prefix));
          if (appKeys.length > 0) {
            await AsyncStorage.multiRemove(appKeys);
          }
        } catch (err) {
          console.warn(`Error clearing storage for app ${appId}:`, err);
        }
      },
    };
  },

  // Global backup & restore
  async exportAllData(): Promise<string> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      const dump: Record<string, any> = {};
      pairs.forEach(([k, v]) => {
        if (v !== null) dump[k] = v;
      });
      return JSON.stringify(dump, null, 2);
    } catch {
      return '{}';
    }
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) return false;
      const entries: [string, string][] = Object.entries(parsed).map(([k, v]) => [
        k,
        typeof v === 'string' ? v : JSON.stringify(v),
      ]);
      await AsyncStorage.multiSet(entries);
      return true;
    } catch {
      return false;
    }
  },

  async getStorageStats(): Promise<{ totalKeys: number; appKeyCount: Record<string, number> }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appCounts: Record<string, number> = {};
      keys.forEach((k) => {
        const match = k.match(/^@app_([^_]+)_/);
        if (match) {
          const appId = match[1];
          appCounts[appId] = (appCounts[appId] || 0) + 1;
        }
      });
      return { totalKeys: keys.length, appKeyCount: appCounts };
    } catch {
      return { totalKeys: 0, appKeyCount: {} };
    }
  },
};
