const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/VSCode/score_viewer/score-tracker-gtr3/node_modules/sharp');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const SRC = path.join(ROOT, 'src');

const SAGE_LIGHT = '#9ed6b1';
const SAGE_DARK = '#4a7c59';

const defs = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${SAGE_LIGHT}"/>
      <stop offset="1" stop-color="${SAGE_DARK}"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#242c26"/>
      <stop offset="1" stop-color="#141814"/>
    </linearGradient>
  </defs>`;

/** Anillo + nodos. angle -90 = arriba, 0 = derecha. */
const mark = (angles, { cx, cy, r, stroke, nodeR, monochrome = false }) => {
  const strokeColor = monochrome ? '#FFFFFF' : 'url(#g)';
  const nodeColor = monochrome ? '#FFFFFF' : SAGE_LIGHT;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${stroke}"/>`;
  for (const a of angles) {
    const rad = (a * Math.PI) / 180;
    const x = (cx + r * Math.cos(rad)).toFixed(1);
    const y = (cy + r * Math.sin(rad)).toFixed(1);
    s += `<circle cx="${x}" cy="${y}" r="${nodeR}" fill="${nodeColor}"/>`;
  }
  return s;
};

const svg = (size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}${body}</svg>`;

// Icono completo (tile) — iOS / general / favicon
const fullIcon = (angles, size = 1024) => {
  const k = size / 1024;
  return svg(
    size,
    `<rect width="${size}" height="${size}" rx="${232 * k}" fill="url(#bg)"/>
     <rect x="${10 * k}" y="${10 * k}" width="${1004 * k}" height="${1004 * k}" rx="${222 * k}" fill="none" stroke="#a2cfae" stroke-opacity="0.12" stroke-width="${3 * k}"/>
     ${mark(angles, { cx: size / 2, cy: size / 2, r: 236 * k, stroke: 54 * k, nodeR: 72 * k })}`,
  );
};

// Foreground adaptativo (safe zone ~62%)
const foreground = (angles, monochrome = false) =>
  svg(
    1024,
    mark(angles, { cx: 512, cy: 512, r: 150, stroke: 36, nodeR: 48, monochrome }),
  );

const background = () =>
  svg(1024, `<rect width="1024" height="1024" fill="url(#bg)"/>`);

const APPS = {
  hub: { angles: [-90], label: 'Hub (1 nodo)' },
  score: { angles: [-90, 0], label: 'Score Viewer (2 nodos)' },
};

(async () => {
  fs.mkdirSync(SRC, { recursive: true });
  for (const [key, cfg] of Object.entries(APPS)) {
    const dir = path.join(OUT, key);
    fs.mkdirSync(dir, { recursive: true });
    const files = {
      'icon.png': fullIcon(cfg.angles, 1024),
      'android-icon-foreground.png': foreground(cfg.angles),
      'android-icon-background.png': background(),
      'android-icon-monochrome.png': foreground(cfg.angles, true),
      'favicon.png': fullIcon(cfg.angles, 196),
    };
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), await sharp(Buffer.from(content)).png().toBuffer());
    }
    // Guardar fuentes SVG por si hay que ajustar
    fs.writeFileSync(path.join(SRC, `${key}-icon.svg`), fullIcon(cfg.angles, 1024));
    fs.writeFileSync(path.join(SRC, `${key}-foreground.svg`), foreground(cfg.angles));
    console.log(`${cfg.label}: ${Object.keys(files).join(', ')}`);
  }

  console.log('Iconos generados en', OUT);
})();
