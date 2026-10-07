import { NativeModule, requireOptionalNativeModule } from 'expo';

export interface AndroidPackageInfo {
  packageName: string;
  versionName: string;
  versionCode: number;
  firstInstallTime: number;
  lastUpdateTime: number;
}

declare class HtzPackageInfoModule extends NativeModule<{}> {
  getPackageInfo(packageName: string): AndroidPackageInfo | null;
}

const HtzPackageInfo = requireOptionalNativeModule<HtzPackageInfoModule>('HtzPackageInfo');

/**
 * Devuelve la información del paquete Android instalado (versión incluida),
 * o null si la app no está instalada o el módulo nativo no está disponible.
 */
export function getPackageInfo(packageName: string): AndroidPackageInfo | null {
  if (!HtzPackageInfo) return null;
  try {
    return HtzPackageInfo.getPackageInfo(packageName);
  } catch {
    return null;
  }
}

export default HtzPackageInfo;
