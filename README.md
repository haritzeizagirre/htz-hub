# 📱 Super-App Hub Móvil (Personal Ecosystem)

Una plataforma móvil todo-en-uno inspirada en el modelo **Super-App (WeChat)** desarrollada con **React Native y Expo SDK 57**.

El Hub actúa como lanzador central y contenedor para alojar tus aplicaciones móviles completas e independientes en tu teléfono.

---

## 🚀 Cómo Iniciar y Probar en tu Teléfono

1. Entra en la carpeta del proyecto:
   ```bash
   cd hub-app
   ```
2. Inicia el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```
3. **Pruébalo en tu móvil al instante:**
   - Descarga la app gratuita **Expo Go** desde Google Play Store (Android) o App Store (iOS).
   - Abre la cámara o el escáner de Expo Go y escanea el código QR que aparecerá en tu terminal.
   - ¡La aplicación se abrirá en tu móvil con recarga en caliente (*Fast Refresh*)!

---

## 🌟 Características del Hub

- **Lanzador Central:**
  - Buscador en tiempo real de aplicaciones y funciones.
  - Filtro por categorías (`Deportes`, `Utilidades`, `Herramientas`, `Laboratorio`).
  - **Bandeja de Recientes (WeChat Style):** Muestra las últimas apps utilizadas en iconos circulares para relanzarlas con un toque.
  - **Favoritos:** Fija tus aplicaciones principales con la estrella dorada para acceso directo.
- **Contenedor de Apps (Sandbox / Runner):**
  - Cada aplicación corre a pantalla completa como una experiencia móvil independiente.
  - **Barra de Cápsula Flotante (`...` y `✕`):**
    - `✕`: Cierra la app y regresa instantáneamente al Hub.
    - `...`: Menú contextual de opciones (favoritos, reiniciar app, etc.).
  - **Almacenamiento Aislado:** Cada app cuenta con su propio namespace de storage local (`storage.get`, `storage.set`, `storage.clear`) sin riesgo de colisión con otras apps.
- **Ajustes Globales del Hub:**
  - Selector de temas: **Modo Oscuro (Slate)**, **Modo OLED (Negro Puro)** y **Modo Claro (Glass)**.
  - Estadísticas de memoria y registros de cada app.
  - Copia de seguridad global (Exportar / Importar todo en JSON).

---

## 📦 Aplicaciones Integradas en Esta Versión

1. **🏆 Score Viewer Pro (v2.0.0):**
   - **En Directo:** Pantalla de marcadores en tiempo real (Fútbol: LaLiga, Champions; Esports: Valorant, LoL, R6) con estados, tiempos y favoritos.
   - **Amazfit GTR 3 Companion:** Panel visual para configurar deportes activos, equipos favoritos (Real Madrid, Barça, KOI, Fnatic, etc.) y claves de API, con **generador de configuración para el reloj** sin necesidad de tocar código.
   - **Mis Equipos:** Administrador interactivo de clubes favoritos.
2. **🧪 DevLab & Tools (v1.2.0):**
   - Suite de utilidades y demostración práctica de sub-apps con contador persistente, notas locales, diagnóstico de sistema y reinicio de datos.

---

## 🛠️ Cómo Añadir una Nueva App Móvil al Hub

Añadir una nueva aplicación completa es tan sencillo como seguir 3 pasos:

1. **Crea la carpeta de tu app:**
   Crea `src/apps/mi-nueva-app/` con su componente principal (`MiApp.tsx`).
2. **Crea el manifiesto (`manifest.ts`):**
   ```typescript
   import { IntegratedAppManifest } from '../../types';
   import { MiApp } from './MiApp';

   export const MiAppManifest: IntegratedAppManifest = {
     id: 'mi-nueva-app',
     name: 'Mi Nueva App',
     subtitle: 'Descripción breve',
     description: 'Detalle de las funciones',
     version: '1.0.0',
     author: 'Personal',
     icon: 'Sparkles', // Nombre de icono Lucide
     accentColor: '#8B5CF6',
     category: 'utilidades',
     isReady: true,
     rootComponent: MiApp,
   };
   ```
3. **Regístrala en `src/apps/registry.ts`:**
   Añade tu manifiesto a la lista `INTEGRATED_APPS`. ¡El Hub la detectará automáticamente con su tarjeta, buscador, filtros y almacenamiento aislado!
