# Publicar una app y actualizar el Hub

Este documento explica cómo publicar una nueva versión de una app independiente y cómo
hacer que el Hub la detecte para actualizarla.

## Requisitos (una vez)

- `gh` (GitHub CLI) autenticado: `gh auth status`.
- Android SDK. El script usa `ANDROID_HOME` o, si no está, `%LOCALAPPDATA%\Android\Sdk`.
- Node 18+.
- Los repos locales en el workspace, en la ruta esperada:
  - Hub: `hub-app/`
  - Apps: `apps/<app-id>/` (hermanos de `hub-app/`)
- La app debe estar registrada en `scripts/publish-app.mjs` (mapa `APPS`).

## Publicar (build local, sin cola de EAS)

Desde `hub-app/`:

```powershell
# 1) Sube versión patch + versionCode, construye, publica Release y actualiza el catálogo
node scripts/publish-app.mjs score-viewer --bump --changelog "Añadido X y corregido Y"

# O con npm
npm run publish:app score-viewer -- --bump --changelog "..."
```

Opciones:

| Opción | Descripción |
| --- | --- |
| `--bump` | Sube la versión patch y el `versionCode` en el `app.json` de la app, y hace commit+push. |
| `--changelog "texto"` | Notas del Release y entrada de changelog del catálogo. |
| `--skip-build` | No construye; reutiliza el APK de `android/app/build/outputs/apk/release/`. |
| `--apk <ruta>` | Usa un APK concreto (implica no construir). |
| `--dry-run` | Calcula todo pero no crea el Release ni toca el catálogo. |

Qué hace el script:

1. (opcional) `--bump`: `version` patch+1 y `android.versionCode`+1 → commit + push en el repo de la app.
2. `npx expo prebuild -p android --no-install` + `gradlew.bat assembleRelease`.
3. Calcula `size` y `sha256`.
4. Crea/actualiza el GitHub Release `v<version>` en el repo de la app con el APK.
5. Actualiza `catalog/apps.json` del Hub y hace commit + push.

## Cómo se entera el Hub

- El Hub descarga `catalog/apps.json` al arrancar (con cache-busting), lo cachea y, si falla,
  usa la copia embebida.
- Compara `latest.version` del catálogo con la versión que **el propio Hub** registró al instalar.
  - Si la app la instaló el Hub y el catálogo trae una versión mayor → muestra **Actualizar**.
  - Si está instalada pero el Hub no registró versión (instalada a mano) → muestra **Abrir**.
  - Si no está instalada → **Descargar**.

> Nota: para que el Hub muestre "Actualizar" hace falta que la instalación previa la haya hecho
> **el propio Hub** (así guarda la versión). Una app instalada manualmente se detecta como
> instalada, pero sin versión registrada.

## Flujo de prueba de actualización

1. Instala el Hub (APK de `hub-app/dist/`).
2. En el Hub, instala Score Viewer (**Descargar**) → el Hub registra la versión, p. ej. `2.0.0`.
3. Publica una versión nueva:
   ```powershell
   node scripts/publish-app.mjs score-viewer --bump --changelog "Prueba de actualización"
   ```
4. Reabre el Hub → Score Viewer debe aparecer como **Actualizar**. Púlsalo y se instalará el APK nuevo.
5. Comprueba que la versión mostrada cambió.

## Cambios solo de JS (sin APK)

Si el cambio no toca código nativo, no hace falta publicar APK: con `expo-updates` en la app
basta `eas update --channel production`. El Hub no necesita cambios. (Pendiente: activar
`expo-updates` en Score Viewer.)

## Notas y limitaciones

- **Firma:** los APK publicados se firman con el keystore de debug (build local). Para
  actualizaciones in-place debe mantenerse **la misma firma** entre versiones. Si más adelante
  se usa EAS, su keystore es distinto y habría que desinstalar/reinstalar una vez.
- **versionCode:** Android exige que aumente en cada APK; `--bump` lo hace por ti.
- **Repos públicos:** el Hub descarga catálogo y APK por HTTPS anónimo, así que el repo que los
  aloja debe ser público (o el Hub necesitaría un token).
- **Rutas:** el script asume la estructura de workspace actual. Si clonas el Hub en otro sitio,
  ajusta las rutas del mapa `APPS`.
