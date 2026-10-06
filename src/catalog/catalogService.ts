import AsyncStorage from '@react-native-async-storage/async-storage';
import embeddedCatalog from '../../catalog/apps.json';
import { AppCatalog, CatalogApp } from '../types';
import { CATALOG_URL } from '../config';

const CACHE_KEY = '@hub_catalog_cache_v1';

const isValidCatalog = (value: unknown): value is AppCatalog => {
  if (!value || typeof value !== 'object') return false;
  const catalog = value as AppCatalog;
  return Array.isArray(catalog.apps);
};

/**
 * Gestiona el catálogo de apps externas.
 *
 * Estrategia:
 *  1. Copia embebida en el binario (`catalog/apps.json`) como respaldo offline.
 *  2. Copia cacheada en AsyncStorage de la última descarga remota.
 *  3. Descarga remota desde `CATALOG_URL` para detectar versiones nuevas.
 */
export const CatalogService = {
  getEmbedded(): AppCatalog {
    return embeddedCatalog as unknown as AppCatalog;
  },

  async getCached(): Promise<AppCatalog | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isValidCatalog(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  /** Devuelve el mejor catálogo disponible sin salir a la red. */
  async get(): Promise<AppCatalog> {
    return (await this.getCached()) ?? this.getEmbedded();
  },

  /** Fuerza una descarga remota; si falla, cae al catálogo local. */
  async refresh(): Promise<AppCatalog> {
    try {
      const response = await fetch(`${CATALOG_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!isValidCatalog(json)) throw new Error('Catálogo inválido');
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(json));
      return json;
    } catch (error) {
      console.warn('No se pudo actualizar el catálogo remoto:', error);
      return this.get();
    }
  },

  getApp(catalog: AppCatalog, appId: string): CatalogApp | undefined {
    return catalog.apps.find((app) => app.id === appId);
  },
};
