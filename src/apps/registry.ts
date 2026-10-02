import { IntegratedAppManifest, AppCategory } from '../types';
import { ScoreViewerManifest } from './score-viewer/manifest';
import { DemoToolManifest } from './demo-tool/manifest';

export const INTEGRATED_APPS: IntegratedAppManifest[] = [
  ScoreViewerManifest,
  DemoToolManifest,
];

export const AppRegistry = {
  getAll(): IntegratedAppManifest[] {
    return INTEGRATED_APPS;
  },

  getById(id: string): IntegratedAppManifest | undefined {
    return INTEGRATED_APPS.find((app) => app.id === id);
  },

  filter(query: string = '', category: AppCategory = 'todas'): IntegratedAppManifest[] {
    const q = query.toLowerCase().trim();
    return INTEGRATED_APPS.filter((app) => {
      const matchesCategory = category === 'todas' || app.category === category;
      const matchesQuery =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.subtitle.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  },

  getFavorites(favIds: string[]): IntegratedAppManifest[] {
    return INTEGRATED_APPS.filter((app) => favIds.includes(app.id));
  },

  getRecents(recentIds: string[]): IntegratedAppManifest[] {
    const appsMap = new Map(INTEGRATED_APPS.map((a) => [a.id, a]));
    return recentIds
      .map((id) => appsMap.get(id))
      .filter((app): app is IntegratedAppManifest => !!app);
  },
};
