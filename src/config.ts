/**
 * Configuración global del Hub.
 */

/** Versión del Hub; se usa para validar `minHubVersion` del catálogo. */
export const HUB_VERSION = '1.0.0';

/**
 * Catálogo remoto publicado desde el repo `htz-hub`.
 * Nota: mientras el repo sea privado, `raw.githubusercontent.com` devolverá 404 y
 * el Hub usará la copia embebida (`catalog/apps.json`). Al hacerlo público, funcionará.
 */
export const CATALOG_URL =
  'https://raw.githubusercontent.com/haritzeizagirre/htz-hub/main/catalog/apps.json';
