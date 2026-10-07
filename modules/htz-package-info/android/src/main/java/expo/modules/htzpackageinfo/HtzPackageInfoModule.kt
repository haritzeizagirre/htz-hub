package expo.modules.htzpackageinfo

import android.content.pm.PackageManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HtzPackageInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HtzPackageInfo")

    Function("getPackageInfo") { packageName: String ->
      val context = appContext.reactContext ?: return@Function null
      try {
        val info = context.packageManager.getPackageInfo(packageName, 0)
        val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          info.longVersionCode
        } else {
          @Suppress("DEPRECATION")
          info.versionCode.toLong()
        }
        mapOf(
          "packageName" to info.packageName,
          "versionName" to (info.versionName ?: ""),
          "versionCode" to versionCode,
          "firstInstallTime" to info.firstInstallTime,
          "lastUpdateTime" to info.lastUpdateTime
        )
      } catch (e: PackageManager.NameNotFoundException) {
        null
      }
    }
  }
}
