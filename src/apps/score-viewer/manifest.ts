import { IntegratedAppManifest } from '../../types';
import { ScoreViewerApp } from './ScoreViewerApp';

export const ScoreViewerManifest: IntegratedAppManifest = {
  id: 'score-viewer',
  name: 'Score Viewer Pro',
  subtitle: 'Marcadores en vivo & Companion GTR 3',
  description: 'Visualizador de resultados deportivos y esports en tiempo real con panel de control y sincronización para Amazfit GTR 3.',
  version: '2.0.0',
  author: 'Personal',
  icon: 'Trophy',
  accentColor: '#10B981',
  category: 'deportes',
  badge: 'PRINCIPAL',
  isReady: true,
  rootComponent: ScoreViewerApp,
};
