import { IntegratedAppManifest } from '../../types';
import { DemoToolApp } from './DemoToolApp';

export const DemoToolManifest: IntegratedAppManifest = {
  id: 'demo-tool',
  name: 'DevLab & Tools',
  subtitle: 'Suite de pruebas y utilidades',
  description: 'Aplicación móvil de utilidades para desarrolladores con persistencia local, visor de memoria y diagnósticos.',
  version: '1.2.0',
  author: 'Personal',
  icon: 'Terminal',
  accentColor: '#3B82F6',
  category: 'utilidades',
  badge: 'SISTEMA',
  isReady: true,
  rootComponent: DemoToolApp,
};
