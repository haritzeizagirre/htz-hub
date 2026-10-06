import { Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { Directory, File, Paths } from 'expo-file-system';
import { CatalogApp } from '../types';

/**
 * Servicio de instalación / lanzamiento de apps externas (solo Android).
 *
 * Flujo de instalación:
 *  1. Pedir permiso de "instalar apps desconocidas" para el Hub (una vez).
 *  2. Descargar el APK a la caché.
 *  3. Abrir el instalador del sistema con un content:// URI.
 *
 * La detección de apps instaladas usa `getApplicationIconAsync`, que además nos
 * devuelve el icono real de la app (data URI) o cadena vacía si no está instalada.
 */

export async function getAppIcon(packageName: string): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const icon = await IntentLauncher.getApplicationIconAsync(packageName);
    return icon && icon.length > 0 ? icon : null;
  } catch {
    return null;
  }
}

export async function isAppInstalled(packageName: string): Promise<boolean> {
  return (await getAppIcon(packageName)) !== null;
}

export function openExternalApp(packageName: string, scheme?: string): void {
  if (Platform.OS === 'android') {
    try {
      IntentLauncher.openApplication(packageName);
      return;
    } catch {
      // cae al deep link
    }
  }
  if (scheme) {
    Linking.openURL(`${scheme}://`).catch(() => {
      /* la app no está instalada o no responde */
    });
  }
}

export async function installExternalApp(app: CatalogApp): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('La instalación de apps solo está disponible en Android.');
  }

  // 1) Permiso para instalar apps desconocidas
  try {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES,
      { data: `package:${Application.applicationId}` },
    );
  } catch {
    // Si el usuario cancela, continuamos e intentamos instalar igualmente.
  }

  // 2) Descarga del APK
  const dir = new Directory(Paths.cache, 'apk');
  if (!dir.exists) dir.create();
  const destination = new File(dir, `${app.id}-${app.latest.version}.apk`);
  if (destination.exists) destination.delete();

  const file = await File.downloadFileAsync(app.latest.apkUrl, destination);

  // 3) Lanzar el instalador del sistema
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: file.contentUri,
    type: 'application/vnd.android.package-archive',
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
  });
}

/** Elimina el APK descargado de la caché tras instalar (opcional). */
export function cleanupDownloadedApk(appId: string, version: string): void {
  try {
    const file = new File(new Directory(Paths.cache, 'apk'), `${appId}-${version}.apk`);
    if (file.exists) file.delete();
  } catch {
    /* sin importancia */
  }
}
