import { IntegratedAppManifest, LauncherApp, CatalogApp, AppCategory } from '../types';
import { DemoToolManifest } from './demo-tool/manifest';

/**
 * Apps integradas en el propio Hub (se renderizan en proceso).
 * Score Viewer ya NO está aquí: es una app externa descargable.
 */
export const INTEGRATED_APPS: IntegratedAppManifest[] = [DemoToolManifest];

const builtinToLauncher = (manifest: IntegratedAppManifest): LauncherApp => ({
  id: manifest.id,
  name: manifest.name,
  subtitle: manifest.subtitle,
  description: manifest.description,
  icon: manifest.icon,
  accentColor: manifest.accentColor,
  category: manifest.category,
  badge: manifest.badge,
  version: manifest.version,
  source: 'builtin',
  rootComponent: manifest.rootComponent,
});

const catalogToLauncher = (app: CatalogApp): LauncherApp => ({
  id: app.id,
  name: app.name,
  subtitle: app.subtitle,
  description: app.description,
  icon: app.icon,
  accentColor: app.accentColor,
  category: app.category,
  badge: app.badge,
  version: app.latest.version,
  source: 'external',
  catalog: app,
});

/** Une apps del catálogo (externas) + apps integradas (internas). */
export const getLauncherApps = (catalog: CatalogApp[] = []): LauncherApp[] => [
  ...catalog.map(catalogToLauncher),
  ...INTEGRATED_APPS.map(builtinToLauncher),
];

export const AppRegistry = {
  getAll(catalog: CatalogApp[] = []): LauncherApp[] {
    return getLauncherApps(catalog);
  },

  getById(id: string, catalog: CatalogApp[] = []): LauncherApp | undefined {
    return getLauncherApps(catalog).find((app) => app.id === id);
  },

  filter(query: string = '', category: AppCategory = 'todas', catalog: CatalogApp[] = []): LauncherApp[] {
    const q = query.toLowerCase().trim();
    return getLauncherApps(catalog).filter((app) => {
      const matchesCategory = category === 'todas' || app.category === category;
      const matchesQuery =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.subtitle.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  },

  getFavorites(favIds: string[], catalog: CatalogApp[] = []): LauncherApp[] {
    return getLauncherApps(catalog).filter((app) => favIds.includes(app.id));
  },

  getRecents(recentIds: string[], catalog: CatalogApp[] = []): LauncherApp[] {
    const appsMap = new Map(getLauncherApps(catalog).map((a) => [a.id, a]));
    return recentIds
      .map((id) => appsMap.get(id))
      .filter((app): app is LauncherApp => !!app);
  },
};
