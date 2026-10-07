import { registerWebModule, NativeModule } from 'expo';

export interface AndroidPackageInfo {
  packageName: string;
  versionName: string;
  versionCode: number;
  firstInstallTime: number;
  lastUpdateTime: number;
}

// HtzPackageInfo no está disponible en web: devolvemos null y el Hub usa su fallback.
class HtzPackageInfoModule extends NativeModule<{}> {
  getPackageInfo(_packageName: string): AndroidPackageInfo | null {
    return null;
  }
}

export function getPackageInfo(_packageName: string): AndroidPackageInfo | null {
  return null;
}

export default registerWebModule(HtzPackageInfoModule, 'HtzPackageInfoModule');
