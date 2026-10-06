#!/usr/bin/env node
/**
 * publish-app.mjs — Publica una app independiente y actualiza el catálogo del Hub.
 *
 * Qué hace:
 *   1. (Opcional) --bump: sube la versión patch y el versionCode en el app.json de la app,
 *      y hace commit + push en el repo de la app.
 *   2. Construye el APK (prebuild + `gradlew assembleRelease`) salvo con --skip-build.
 *   3. Calcula tamaño y sha256.
 *   4. Crea (o actualiza) un GitHub Release con el APK en el repo de la app.
 *   5. Actualiza `catalog/apps.json` del Hub y hace commit + push.
 *
 * Uso:
 *   node scripts/publish-app.mjs <appId> [opciones]
 *
 * Opciones:
 *   --changelog "texto"   Notas del release y entrada de changelog del catálogo.
 *   --bump                Sube versión patch + versionCode antes de construir.
 *   --skip-build          No construye; usa el APK existente.
 *   --apk <ruta>          Usa un APK concreto (implica no construir).
 *   --dry-run             Hace todo menos crear el Release y tocar el catálogo.
 *
 * Requisitos: `gh` autenticado, Android SDK (ANDROID_HOME o %LOCALAPPDATA%\Android\Sdk),
 * Node 18+ y que los repos locales estén en el workspace (por defecto, hermanos de htz-hub).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HUB_ROOT = path.resolve(__dirname, '..');
const WORKSPACE = path.resolve(HUB_ROOT, '..'); // carpeta que contiene hub-app/ y apps/
const CATALOG_PATH = path.join(HUB_ROOT, 'catalog', 'apps.json');

/** Registro de apps publicables. Añade aquí cada app nueva. */
const APPS = {
  'score-viewer': {
    projectDir: path.join(WORKSPACE, 'apps', 'score-viewer'),
    repo: 'haritzeizagirre/htz-scoreviewer',
    title: 'Score Viewer Pro',
    assetName: (v) => `htz-scoreviewer-v${v}.apk`,
  },
};

const args = process.argv.slice(2);
const appId = args.find((a) => !a.startsWith('--'));
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!appId || !APPS[appId]) {
  console.error('Uso: node scripts/publish-app.mjs <appId> [--changelog "texto"] [--bump] [--skip-build] [--apk ruta] [--dry-run]');
  console.error(`Apps disponibles: ${Object.keys(APPS).join(', ') || '(ninguna)'}`);
  process.exit(1);
}

const app = APPS[appId];
const dryRun = flag('dry-run');

const run = (cmd, cwd, env) => execSync(cmd, { cwd, stdio: 'inherit', env: env || process.env });
const out = (cmd, cwd) =>
  execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const appJsonPath = path.join(app.projectDir, 'app.json');
if (!existsSync(appJsonPath)) {
  console.error(`No existe ${appJsonPath}. ¿Está el repo de la app en el workspace?`);
  process.exit(1);
}
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
const expo = appJson.expo;

// --- 1) Bump opcional -------------------------------------------------------
if (flag('bump')) {
  const [maj, min, pat] = String(expo.version).split('.').map((n) => parseInt(n, 10) || 0);
  expo.version = `${maj}.${min}.${pat + 1}`;
  expo.android.versionCode = (expo.android.versionCode || 1) + 1;
  writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
  console.log(`→ Nueva versión: ${expo.version} (versionCode ${expo.android.versionCode})`);
  if (!dryRun) {
    run('git add app.json', app.projectDir);
    run(`git commit -m "chore: bump to v${expo.version}"`, app.projectDir);
    run('git push', app.projectDir);
  }
}

const version = expo.version;
const versionCode = expo.android.versionCode || 1;
const pkg = expo.android.package;
const scheme = expo.scheme;

// --- 2) Build ---------------------------------------------------------------
let apkPath = value('apk');
if (!apkPath) {
  if (!flag('skip-build')) {
    const androidHome =
      process.env.ANDROID_HOME ||
      process.env.ANDROID_SDK_ROOT ||
      path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
    const env = { ...process.env, ANDROID_HOME: androidHome, ANDROID_SDK_ROOT: androidHome };
    const androidDir = path.join(app.projectDir, 'android');
    const stopDaemons = () => {
      try {
        run('gradlew.bat --stop', androidDir, env);
      } catch {
        /* aún no hay carpeta android o no hay daemon */
      }
    };
    const prebuild = () => run('npx expo prebuild -p android --no-install', app.projectDir, env);

    console.log('→ Prebuild + build (gradle assembleRelease)…');
    stopDaemons();
    try {
      prebuild();
    } catch {
      console.warn('→ Prebuild falló (posible bloqueo de archivos). Parando daemons y reintentando…');
      stopDaemons();
      prebuild();
    }
    run('gradlew.bat assembleRelease --console=plain', androidDir, env);
  }
  apkPath = path.join(app.projectDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
}
if (!existsSync(apkPath)) {
  console.error(`No se encontró el APK: ${apkPath}`);
  process.exit(1);
}

// --- 3) Tamaño + sha256 -----------------------------------------------------
const buffer = readFileSync(apkPath);
const size = buffer.length;
const sha256 = createHash('sha256').update(buffer).digest('hex');
console.log(`→ APK: ${apkPath}`);
console.log(`  ${size} bytes · sha256 ${sha256}`);

// --- 4) GitHub Release ------------------------------------------------------
const tag = `v${version}`;
const asset = app.assetName(version);
const apkUrl = `https://github.com/${app.repo}/releases/download/${tag}/${asset}`;
const changelog = value('changelog');
const notes = changelog || `Release ${version}`;

if (dryRun) {
  console.log('\n[DRY-RUN] Se omiten Release y catálogo. Se haría:');
  console.log(`  Release ${tag} en ${app.repo} con asset ${asset}`);
  console.log(`  apkUrl: ${apkUrl}`);
  process.exit(0);
}

const releaseExists = (() => {
  try {
    out(`gh release view ${tag} --repo ${app.repo}`);
    return true;
  } catch {
    return false;
  }
})();

if (releaseExists) {
  console.log(`→ El release ${tag} ya existe; subiendo asset (--clobber)…`);
  run(`gh release upload ${tag} "${apkPath}#${asset}" --repo ${app.repo} --clobber`);
} else {
  const notesFile = path.join(mkdtempSync(path.join(tmpdir(), 'publish-')), 'notes.md');
  writeFileSync(notesFile, notes);
  run(`gh release create ${tag} "${apkPath}#${asset}" --repo ${app.repo} --title "${app.title} ${tag}" --notes-file "${notesFile}"`);
}

// --- 5) Catálogo ------------------------------------------------------------
const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
const entry = catalog.apps.find((a) => a.id === appId);
if (!entry) {
  console.error(`No hay entrada '${appId}' en ${CATALOG_PATH}`);
  process.exit(1);
}
entry.name = expo.name || entry.name;
entry.android = { package: pkg, scheme };
entry.latest = {
  version,
  versionCode,
  publishedAt: new Date().toISOString(),
  apkUrl,
  size,
  sha256,
  minHubVersion: entry.latest?.minHubVersion || '1.0.0',
  changelog: changelog ? [changelog] : entry.latest?.changelog || [],
};
catalog.updatedAt = new Date().toISOString();
writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

// --- 6) Commit + push del catálogo ------------------------------------------
run('git add catalog/apps.json', HUB_ROOT);
run(`git commit -m "chore(catalog): publish ${appId} v${version}"`, HUB_ROOT);
run('git push', HUB_ROOT);

console.log(`\n✔ Publicado ${appId} v${version}`);
console.log(`  Release: https://github.com/${app.repo}/releases/tag/${tag}`);
console.log(`  APK: ${apkUrl}`);
console.log('  Reinicia el Hub para que detecte la actualización.');
