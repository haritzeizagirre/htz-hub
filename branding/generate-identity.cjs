const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/VSCode/score_viewer/score-tracker-gtr3/node_modules/sharp');

const OUT = path.resolve(__dirname, 'identity');
fs.mkdirSync(OUT, { recursive: true });
const DARK = '#1E2420';

const defs = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9ed6b1"/>
      <stop offset="1" stop-color="#4a7c59"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#242c26"/>
      <stop offset="1" stop-color="#141814"/>
    </linearGradient>
  </defs>`;

const tile = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${defs}
     <rect width="512" height="512" rx="118" fill="url(#bg)"/>
     <rect x="8" y="8" width="496" height="496" rx="112" fill="none" stroke="#a2cfae" stroke-opacity="0.12" stroke-width="2"/>
     ${body}
   </svg>`;

// --- Sistema A: "spark" rotacional (N barras) ---
const spark = (n) => {
  let bars = '';
  for (let i = 0; i < n; i += 1) {
    bars += `<rect x="-17" y="-172" width="34" height="150" rx="17" transform="rotate(${(i * 360) / n})"/>`;
  }
  return tile(`<g fill="url(#g)" transform="translate(256,256)">${bars}</g>`);
};

// --- Sistema B: monograma de barras (H / diagonal) ---
const barH = tile(`
  <g fill="url(#g)">
    <rect x="152" y="112" width="58" height="288" rx="29"/>
    <rect x="302" y="112" width="58" height="288" rx="29"/>
    <rect x="152" y="227" width="208" height="58" rx="29"/>
  </g>`);

const barSlash = tile(`
  <g fill="url(#g)" transform="translate(256,256)">
    <rect x="-19" y="-166" width="38" height="210" rx="19" transform="rotate(32)"/>
    <circle cx="0" cy="86" r="30"/>
  </g>`);

// --- Sistema C: "orbit" (anillo + nodos) ---
const orbit = (nodes) => {
  let dots = '';
  const positions = [
    { x: 256, y: 128 },
    { x: 384, y: 256 },
    { x: 256, y: 384 },
    { x: 128, y: 256 },
  ];
  for (let i = 0; i < nodes; i += 1) {
    dots += `<circle cx="${positions[i].x}" cy="${positions[i].y}" r="34" fill="#9ed6b1"/>`;
  }
  return tile(`
    <circle cx="256" cy="256" r="118" fill="none" stroke="url(#g)" stroke-width="26"/>
    ${dots}`);
};

const concepts = {
  'sysA-hub-4spark': spark(4),
  'sysA-score-3spark': spark(3),
  'sysB-hub-monogram': barH,
  'sysB-score-slash': barSlash,
  'sysC-hub-orbit1': orbit(1),
  'sysC-score-orbit2': orbit(2),
};

(async () => {
  const names = Object.keys(concepts);
  for (const name of names) {
    const png = await sharp(Buffer.from(concepts[name])).png().toBuffer();
    fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  }
  const cell = 512;
  const composites = names.map((name, i) => ({
    input: path.join(OUT, `${name}.png`),
    left: (i % 3) * cell,
    top: Math.floor(i / 3) * cell,
  }));
  await sharp({ create: { width: cell * 3, height: cell * 2, channels: 4, background: '#0b0b0b' } })
    .composite(composites)
    .png()
    .toFile(path.join(OUT, '_contact-sheet.png'));
  console.log('OK:', names.join(', '));
})();
