// ===========================================================
// CHRONIQUE DES EMPIRES — Civ light avec carte hex
// ===========================================================

const CONFIG = {
  STORAGE_KEY: 'chronique:save:v1',
  MAP_W: 12,
  MAP_H: 16,
  HEX_SIZE: 28, // rayon hex
  AP_PER_TURN: 10,
  CITY_RADIUS: 2, // hex autour de la ville exploitées
  VICTORY_GOLD: 5000,
  VICTORY_WONDERS: 3,
};

// ============== CIVILISATIONS ==============
const CIVS = {
  japan: {
    id: 'japan', name: 'Japon', leader: 'Oda Nobunaga',
    desc: 'Bonus de production militaire',
    color: '#c8424a', colorDark: '#7a2025',
    bonus: { militaryProduction: 1.25 },
    cityNames: ['Kyoto', 'Edo', 'Osaka', 'Nara', 'Sapporo', 'Sendai'],
  },
  rome: {
    id: 'rome', name: 'Rome', leader: 'Jules César',
    desc: 'Routes plus rapides, +or par ville',
    color: '#a8332e', colorDark: '#5e1c19',
    bonus: { goldPerCity: 2 },
    cityNames: ['Rome', 'Ostie', 'Pompéi', 'Ravenne', 'Pise', 'Vérone'],
  },
  egypt: {
    id: 'egypt', name: 'Égypte', leader: 'Cléopâtre',
    desc: 'Construction de merveilles +50%',
    color: '#c9974a', colorDark: '#7a5a26',
    bonus: { wonderProduction: 1.5 },
    cityNames: ['Thèbes', 'Memphis', 'Alexandrie', 'Gizeh', 'Karnak', 'Edfou'],
  },
  vikings: {
    id: 'vikings', name: 'Vikings', leader: 'Ragnar',
    desc: 'Unités navales puissantes, raids efficaces',
    color: '#3d6680', colorDark: '#1d3a4a',
    bonus: { navalCombat: 1.3 },
    cityNames: ['Nidaros', 'Uppsala', 'Hedeby', 'Birka', 'Roskilde', 'Jorvik'],
  },
};

// ============== TERRAINS ==============
const TERRAINS = {
  plain:    { name: 'Plaine',   color: '#cbb878', food: 2, prod: 1, gold: 0, moveCost: 1 },
  forest:   { name: 'Forêt',    color: '#6a8a4a', food: 1, prod: 2, gold: 0, moveCost: 2 },
  hill:     { name: 'Colline',  color: '#a89060', food: 1, prod: 2, gold: 0, moveCost: 2, defenseBonus: 0.25 },
  mountain: { name: 'Montagne', color: '#6e6358', food: 0, prod: 0, gold: 0, moveCost: 99, impassable: true },
  desert:   { name: 'Désert',   color: '#d9c285', food: 0, prod: 1, gold: 1, moveCost: 1 },
  water:    { name: 'Mer',      color: '#6e9aa8', food: 1, prod: 0, gold: 1, moveCost: 99, water: true },
};

// ============== UNITÉS ==============
// melee = combat rapproché; ranged = à distance; settler = colon
const UNITS = {
  settler: {
    name: 'Colon', type: 'settler', icon: 'settler',
    move: 2, hp: 1, attack: 0, defense: 0,
    cost: 30, era: 'antiquity', tech: null,
    desc: 'Fonde une nouvelle ville',
  },
  warrior: {
    name: 'Guerrier', type: 'melee', icon: 'warrior',
    move: 2, hp: 100, attack: 8, defense: 6,
    cost: 20, era: 'antiquity', tech: null,
    desc: 'Unité de mêlée de base',
  },
  archer: {
    name: 'Archer', type: 'ranged', icon: 'archer',
    move: 2, hp: 80, attack: 10, defense: 4, range: 2,
    cost: 25, era: 'antiquity', tech: 'archery',
    desc: 'Attaque à distance (2 cases)',
  },
  swordsman: {
    name: 'Épéiste', type: 'melee', icon: 'swordsman',
    move: 2, hp: 120, attack: 14, defense: 10,
    cost: 40, era: 'antiquity', tech: 'iron',
    desc: 'Mêlée puissante',
  },
  knight: {
    name: 'Chevalier', type: 'melee', icon: 'knight',
    move: 4, hp: 130, attack: 18, defense: 12,
    cost: 60, era: 'medieval', tech: 'chivalry',
    desc: 'Cavalerie rapide et puissante',
  },
  crossbow: {
    name: 'Arbalétrier', type: 'ranged', icon: 'crossbow',
    move: 2, hp: 90, attack: 16, defense: 6, range: 2,
    cost: 50, era: 'medieval', tech: 'machinery',
    desc: 'Distance améliorée',
  },
  musketeer: {
    name: 'Mousquetaire', type: 'melee', icon: 'musketeer',
    move: 2, hp: 140, attack: 22, defense: 16,
    cost: 80, era: 'renaissance', tech: 'gunpowder',
    desc: 'Infanterie à poudre',
  },
  cannon: {
    name: 'Canon', type: 'ranged', icon: 'cannon',
    move: 2, hp: 100, attack: 28, defense: 8, range: 3,
    cost: 100, era: 'renaissance', tech: 'metallurgy',
    desc: 'Artillerie longue portée',
  },
  rifleman: {
    name: 'Fusilier', type: 'melee', icon: 'rifleman',
    move: 2, hp: 160, attack: 30, defense: 22,
    cost: 120, era: 'industrial', tech: 'rifling',
    desc: 'Infanterie moderne',
  },
};

// ============== BÂTIMENTS ==============
const BUILDINGS = {
  granary:  { name: 'Grenier',     cost: 40,  effect: '+1 nourriture/tour',     era: 'antiquity', tech: 'pottery',     bonus: { food: 1 } },
  walls:    { name: 'Murs',        cost: 50,  effect: '+50% défense ville',     era: 'antiquity', tech: 'masonry',     bonus: { cityDefense: 0.5 } },
  market:   { name: 'Marché',      cost: 60,  effect: '+25% or',                era: 'antiquity', tech: 'currency',    bonus: { goldMul: 1.25 } },
  library:  { name: 'Bibliothèque',cost: 70,  effect: '+25% science',           era: 'antiquity', tech: 'writing',     bonus: { sciMul: 1.25 } },
  barracks: { name: 'Caserne',     cost: 50,  effect: 'Unités +20% PV',         era: 'antiquity', tech: 'bronze',      bonus: { unitHpMul: 1.2 } },
  workshop: { name: 'Atelier',     cost: 80,  effect: '+30% production',        era: 'medieval',  tech: 'engineering', bonus: { prodMul: 1.3 } },
  bank:     { name: 'Banque',      cost: 100, effect: '+50% or',                era: 'medieval',  tech: 'banking',     bonus: { goldMul: 1.5 } },
  univ:     { name: 'Université',  cost: 120, effect: '+50% science',           era: 'renaissance', tech: 'education', bonus: { sciMul: 1.5 } },
  factory:  { name: 'Manufacture', cost: 150, effect: '+50% production',        era: 'industrial', tech: 'industrialization', bonus: { prodMul: 1.5 } },
};

// ============== MERVEILLES (uniques globalement) ==============
const WONDERS = {
  pyramids:    { name: 'Pyramides',         cost: 200, effect: '+1 prod/ville',      era: 'antiquity',  tech: 'masonry',    bonus: { allCitiesProd: 1 } },
  greatwall:   { name: 'Grande Muraille',   cost: 250, effect: 'Murs gratuits partout', era: 'antiquity', tech: 'masonry',  bonus: { freeWalls: true } },
  oracle:      { name: 'Oracle',            cost: 220, effect: '+50% science',       era: 'antiquity',  tech: 'writing',    bonus: { globalSci: 1.5 } },
  notredame:   { name: 'Notre-Dame',        cost: 300, effect: '+25% prod globale',  era: 'medieval',   tech: 'engineering', bonus: { globalProd: 1.25 } },
  printing:    { name: 'Presse de Gutenberg',cost: 320, effect: '+50% science',     era: 'renaissance', tech: 'printing',   bonus: { globalSci: 1.5 } },
  finalLib:    { name: 'Grande Bibliothèque finale', cost: 500, effect: 'Victoire scientifique', era: 'industrial', tech: 'computing', bonus: { winScience: true } },
};

// ============== ARBRE TECHNOLOGIQUE ==============
const TECHS = {
  // Antiquité
  pottery:    { name: 'Poterie',         cost: 30,  era: 'antiquity', requires: [] },
  bronze:     { name: 'Travail du bronze', cost: 40, era: 'antiquity', requires: [] },
  archery:    { name: 'Tir à l\'arc',     cost: 35, era: 'antiquity', requires: [] },
  masonry:    { name: 'Maçonnerie',       cost: 45, era: 'antiquity', requires: ['pottery'] },
  writing:    { name: 'Écriture',         cost: 50, era: 'antiquity', requires: ['pottery'] },
  currency:   { name: 'Monnaie',          cost: 60, era: 'antiquity', requires: ['bronze'] },
  iron:       { name: 'Travail du fer',   cost: 80, era: 'antiquity', requires: ['bronze'] },
  // Moyen Âge
  engineering:{ name: 'Ingénierie',       cost: 100, era: 'medieval',  requires: ['masonry'] },
  chivalry:   { name: 'Chevalerie',       cost: 120, era: 'medieval',  requires: ['iron'] },
  machinery:  { name: 'Mécanique',        cost: 110, era: 'medieval',  requires: ['iron'] },
  banking:    { name: 'Banque',           cost: 130, era: 'medieval',  requires: ['currency'] },
  education:  { name: 'Éducation',        cost: 150, era: 'medieval',  requires: ['writing'] },
  // Renaissance
  printing:   { name: 'Imprimerie',       cost: 180, era: 'renaissance', requires: ['education'] },
  gunpowder:  { name: 'Poudre à canon',   cost: 200, era: 'renaissance', requires: ['chivalry', 'machinery'] },
  metallurgy: { name: 'Métallurgie',      cost: 220, era: 'renaissance', requires: ['gunpowder'] },
  // Industriel
  industrialization: { name: 'Industrialisation', cost: 280, era: 'industrial', requires: ['metallurgy'] },
  rifling:    { name: 'Rayage des armes', cost: 320, era: 'industrial', requires: ['industrialization'] },
  computing:  { name: 'Informatique',     cost: 400, era: 'industrial', requires: ['rifling'] },
};

const ERAS = ['antiquity', 'medieval', 'renaissance', 'industrial'];
const ERA_NAMES = {
  antiquity: 'Antiquité',
  medieval: 'Moyen Âge',
  renaissance: 'Renaissance',
  industrial: 'Industriel',
};

// ===========================================================
// HEX GRID UTILS (axial coords: q, r)
// ===========================================================
function hexToPixel(q, r) {
  const s = CONFIG.HEX_SIZE;
  // pointy-top
  const x = s * Math.sqrt(3) * (q + r / 2);
  const y = s * 1.5 * r;
  return { x, y };
}
function hexCorners(cx, cy) {
  const s = CONFIG.HEX_SIZE;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    pts.push([cx + s * Math.cos(angle), cy + s * Math.sin(angle)]);
  }
  return pts;
}
function hexPath(cx, cy) {
  const c = hexCorners(cx, cy);
  return 'M' + c.map(p => p.join(',')).join('L') + 'Z';
}
const HEX_DIRS = [
  { q: +1, r: 0 }, { q: +1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: +1 }, { q: 0, r: +1 },
];
function hexNeighbors(q, r) {
  return HEX_DIRS.map(d => ({ q: q + d.q, r: r + d.r }));
}
function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}
function hexInBounds(q, r) {
  if (r < 0 || r >= CONFIG.MAP_H) return false;
  const offset = Math.floor(r / 2);
  if (q < -offset || q >= CONFIG.MAP_W - offset) return false;
  return true;
}
function hexKey(q, r) { return `${q},${r}`; }
function parseHexKey(k) { const [q, r] = k.split(',').map(Number); return { q, r }; }

// BFS pour pathfinding (mouvement)
function findPath(start, goal, tiles, unitsByPos, isWaterUnit) {
  const startKey = hexKey(start.q, start.r);
  const goalKey = hexKey(goal.q, goal.r);
  if (startKey === goalKey) return [start];
  const visited = { [startKey]: { from: null, cost: 0 } };
  const queue = [{ q: start.q, r: start.r, cost: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const cur = queue.shift();
    const curKey = hexKey(cur.q, cur.r);
    if (curKey === goalKey) break;
    for (const n of hexNeighbors(cur.q, cur.r)) {
      if (!hexInBounds(n.q, n.r)) continue;
      const nKey = hexKey(n.q, n.r);
      const tile = tiles[nKey];
      if (!tile) continue;
      const terr = TERRAINS[tile.terrain];
      if (terr.impassable) continue;
      // unités terrestres ne traversent pas l'eau (sauf goal)
      if (terr.water && !isWaterUnit && nKey !== goalKey) continue;
      // case occupée par un ennemi -> bloque sauf si goal
      const occ = unitsByPos[nKey];
      if (occ && nKey !== goalKey) continue;
      const cost = cur.cost + (terr.moveCost || 1);
      if (visited[nKey] === undefined || cost < visited[nKey].cost) {
        visited[nKey] = { from: curKey, cost };
        queue.push({ q: n.q, r: n.r, cost });
      }
    }
  }
  if (!visited[goalKey]) return null;
  // reconstruct
  const path = [];
  let k = goalKey;
  while (k) {
    const { q, r } = parseHexKey(k);
    path.unshift({ q, r });
    k = visited[k].from;
  }
  return path;
}

// ===========================================================
// MAP GENERATION (procédural simple)
// ===========================================================
function generateMap(seed) {
  let rng = mulberry32(seed);
  const tiles = {};
  // initialiser tout en plaine
  for (let r = 0; r < CONFIG.MAP_H; r++) {
    const offset = Math.floor(r / 2);
    for (let q = -offset; q < CONFIG.MAP_W - offset; q++) {
      tiles[hexKey(q, r)] = { q, r, terrain: 'plain' };
    }
  }
  const keys = Object.keys(tiles);
  // Eaux: bordures et quelques lacs
  for (const k of keys) {
    const t = tiles[k];
    const offset = Math.floor(t.r / 2);
    const distEdge = Math.min(
      t.r, CONFIG.MAP_H - 1 - t.r,
      t.q + offset, CONFIG.MAP_W - 1 - (t.q + offset)
    );
    if (distEdge === 0 && rng() < 0.6) tiles[k].terrain = 'water';
  }
  // Ajouter des "blobs" de terrains
  function paintBlob(terrain, count, size) {
    for (let i = 0; i < count; i++) {
      const k = keys[Math.floor(rng() * keys.length)];
      const center = parseHexKey(k);
      for (let r = 0; r < CONFIG.MAP_H; r++) {
        const offset = Math.floor(r / 2);
        for (let q = -offset; q < CONFIG.MAP_W - offset; q++) {
          if (hexDistance({ q, r }, center) <= size && rng() < 0.7) {
            const tk = hexKey(q, r);
            if (tiles[tk] && tiles[tk].terrain === 'plain') {
              tiles[tk].terrain = terrain;
            }
          }
        }
      }
    }
  }
  paintBlob('forest', 4, 2);
  paintBlob('hill', 3, 2);
  paintBlob('mountain', 2, 1);
  paintBlob('desert', 2, 2);
  // Quelques eaux intérieures
  paintBlob('water', 2, 1);

  return tiles;
}

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ===========================================================
// SVG ART : emblèmes des civilisations + unités
// ===========================================================
function emblemSVG(civId, size = 100) {
  const c = CIVS[civId];
  const col = c.color, dark = c.colorDark, paper = '#f4ecd8';
  const inner = {
    japan:   `<circle cx="50" cy="50" r="22" fill="${col}"/>
              <circle cx="50" cy="50" r="22" fill="none" stroke="${dark}" stroke-width="2"/>`,
    rome:    `<path d="M30 35 L70 35 L65 65 L35 65 Z" fill="${col}" stroke="${dark}" stroke-width="2"/>
              <path d="M40 35 L40 65 M50 35 L50 65 M60 35 L60 65" stroke="${dark}" stroke-width="1.5"/>
              <text x="50" y="32" font-family="serif" font-size="12" font-weight="700" fill="${dark}" text-anchor="middle">SPQR</text>`,
    egypt:   `<path d="M50 25 L75 70 L25 70 Z" fill="${col}" stroke="${dark}" stroke-width="2"/>
              <path d="M50 25 L50 70 M30 60 L70 60" stroke="${dark}" stroke-width="1" opacity="0.5"/>
              <circle cx="50" cy="40" r="3" fill="${dark}"/>`,
    vikings: `<path d="M30 60 Q50 25 70 60 Z" fill="${col}" stroke="${dark}" stroke-width="2"/>
              <path d="M28 62 L72 62 L68 70 L32 70 Z" fill="${dark}"/>
              <circle cx="40" cy="55" r="2" fill="${paper}"/>
              <circle cx="60" cy="55" r="2" fill="${paper}"/>`,
  };
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="${paper}" stroke="${dark}" stroke-width="2"/>
    ${inner[civId] || ''}
  </svg>`;
}

// Unités SVG : un petit personnage stylisé sur fond circulaire de la couleur de la civ
function unitSVG(unitKey, civId, hp = 100, hpMax = 100) {
  const civ = CIVS[civId];
  const col = civ.color;
  const dark = civ.colorDark;
  const paper = '#f4ecd8';

  // Symboles d'unités
  const symbols = {
    settler: `<path d="M-3 4 L-3 -2 L0 -5 L3 -2 L3 4 Z" fill="${paper}"/>
              <circle cx="0" cy="-7" r="2" fill="${paper}"/>`,  // colon: petite maison
    warrior: `<rect x="-1" y="-8" width="2" height="14" fill="${paper}"/>
              <path d="M-4 -6 L4 -6 L0 -10 Z" fill="${paper}"/>`,  // épée pointée vers le haut
    archer:  `<path d="M-5 -6 Q-7 0 -5 6" stroke="${paper}" stroke-width="1.5" fill="none"/>
              <line x1="-5" y1="-6" x2="-5" y2="6" stroke="${paper}" stroke-width="1"/>
              <line x1="-3" y1="0" x2="6" y2="0" stroke="${paper}" stroke-width="1.5"/>
              <path d="M5 -2 L8 0 L5 2 Z" fill="${paper}"/>`,  // arc avec flèche
    swordsman:`<rect x="-1.5" y="-8" width="3" height="14" fill="${paper}"/>
               <path d="M-5 -6 L5 -6 L0 -11 Z" fill="${paper}"/>
               <rect x="-3" y="6" width="6" height="2" fill="${paper}"/>`,  // épée plus large
    knight:  `<path d="M-7 4 L-3 -3 Q0 -7 3 -3 L7 4 L5 6 L-5 6 Z" fill="${paper}"/>
              <circle cx="0" cy="-1" r="2" fill="${dark}"/>`,  // cheval stylisé
    crossbow:`<rect x="-7" y="-1" width="14" height="2" fill="${paper}"/>
              <path d="M-7 -3 Q-9 0 -7 3" stroke="${paper}" stroke-width="1.5" fill="none"/>
              <path d="M7 -3 Q9 0 7 3" stroke="${paper}" stroke-width="1.5" fill="none"/>
              <line x1="-3" y1="0" x2="6" y2="0" stroke="${paper}" stroke-width="1"/>`,
    musketeer:`<rect x="-1" y="-9" width="2" height="13" fill="${paper}"/>
               <rect x="-3" y="4" width="6" height="2" fill="${paper}"/>
               <circle cx="0" cy="-9" r="1.5" fill="${paper}"/>`,  // mousquet
    cannon:  `<rect x="-7" y="-1" width="14" height="3" fill="${paper}"/>
              <circle cx="-7" cy="4" r="3" fill="${paper}"/>
              <circle cx="7" cy="4" r="3" fill="${paper}"/>`,
    rifleman:`<rect x="-0.7" y="-10" width="1.4" height="16" fill="${paper}"/>
              <rect x="-3" y="5" width="6" height="2" fill="${paper}"/>
              <line x1="0" y1="-10" x2="3" y2="-13" stroke="${paper}" stroke-width="1.5"/>`,  // baïonnette
  };

  const hpRatio = hp / hpMax;
  const hpColor = hpRatio > 0.6 ? '#5b8a3a' : hpRatio > 0.3 ? '#c8923a' : '#a83828';

  return `<g>
    <circle cx="0" cy="0" r="13" fill="${paper}" stroke="${dark}" stroke-width="0.8"/>
    <circle cx="0" cy="0" r="11" fill="${col}"/>
    <g>${symbols[unitKey] || symbols.warrior}</g>
    ${hp < hpMax ? `<rect x="-10" y="11" width="20" height="2" fill="${dark}" opacity="0.4"/>
                    <rect x="-10" y="11" width="${20 * hpRatio}" height="2" fill="${hpColor}"/>` : ''}
  </g>`;
}

// Icône de ville
function citySVG(civId, size = 100) {
  const civ = CIVS[civId];
  const col = civ.color, dark = civ.colorDark, paper = '#f4ecd8';
  return `<g>
    <circle cx="0" cy="0" r="14" fill="${paper}" stroke="${dark}" stroke-width="1"/>
    <path d="M-9 4 L-9 -3 L-6 -3 L-6 -7 L-2 -7 L-2 -3 L2 -3 L2 -7 L6 -7 L6 -3 L9 -3 L9 4 Z" fill="${col}" stroke="${dark}" stroke-width="0.6"/>
    <rect x="-1" y="-1" width="2" height="3" fill="${dark}"/>
  </g>`;
}

// ===========================================================
// STATE
// ===========================================================
let state = null;
let ui = {
  selectedUnit: null,
  selectedCity: null,
  moveTargets: [], // hex de mouvement possible
  attackTargets: [], // hex d'attaque possible
  panMode: false,
  zoom: 1,
  panX: 0,
  panY: 0,
};

function makeFreshState(playerCivId) {
  // Génère carte
  const seed = Math.floor(Math.random() * 1e9);
  const tiles = generateMap(seed);

  // Place 3 civs (joueur + 2 IA) à des coins éloignés
  const corners = pickStartingPositions(tiles, 3);
  const otherCivIds = Object.keys(CIVS).filter(c => c !== playerCivId);
  shuffle(otherCivIds);
  const aiCivs = otherCivIds.slice(0, 2);

  const civsInGame = {};
  const allCivs = [playerCivId, ...aiCivs];
  allCivs.forEach((civId, i) => {
    civsInGame[civId] = {
      id: civId,
      isPlayer: civId === playerCivId,
      gold: 30, science: 0,
      researching: null,
      knownTechs: [],
      ownedWonders: [],
      defeated: false,
    };
  });

  // Unités initiales : 1 colon + 1 guerrier par civ près de leur start
  const units = {};
  const cities = {};
  let unitIdCounter = 1;

  allCivs.forEach((civId, i) => {
    const start = corners[i];
    const settlerPos = start;
    units['u' + (unitIdCounter++)] = {
      id: 'u' + (unitIdCounter - 1), key: 'settler', civId,
      q: settlerPos.q, r: settlerPos.r,
      hp: 100, movesLeft: 2, fortified: false,
    };
    // Guerrier juste à côté
    const adj = hexNeighbors(start.q, start.r).find(n => {
      if (!hexInBounds(n.q, n.r)) return false;
      const t = tiles[hexKey(n.q, n.r)];
      return t && !TERRAINS[t.terrain].impassable && !TERRAINS[t.terrain].water;
    });
    if (adj) {
      units['u' + (unitIdCounter++)] = {
        id: 'u' + (unitIdCounter - 1), key: 'warrior', civId,
        q: adj.q, r: adj.r,
        hp: 100, movesLeft: 2, fortified: false,
      };
    }
  });

  // Vision initiale
  const visibility = {};
  for (const civId of allCivs) visibility[civId] = { explored: new Set(), visible: new Set() };

  return {
    seed,
    playerCivId,
    civsInGame,
    civsOrder: allCivs,
    tiles,
    units,
    cities,
    visibility: serializeVisibility(visibility),
    turn: 1,
    actionPoints: CONFIG.AP_PER_TURN,
    productionQueue: {}, // cityId -> {key, type}
    nextUnitId: unitIdCounter,
    gameOver: null,
    log: [],
  };
}

function serializeVisibility(v) {
  const out = {};
  for (const k in v) {
    out[k] = { explored: Array.from(v[k].explored), visible: Array.from(v[k].visible) };
  }
  return out;
}
function deserializeVisibility(v) {
  const out = {};
  for (const k in v) {
    out[k] = { explored: new Set(v[k].explored), visible: new Set(v[k].visible) };
  }
  return out;
}

function pickStartingPositions(tiles, n) {
  // Cherche n cases terrestres bien réparties
  const land = Object.values(tiles).filter(t => {
    const tr = TERRAINS[t.terrain];
    return !tr.impassable && !tr.water;
  });
  shuffle(land);
  const picks = [];
  for (const t of land) {
    if (picks.every(p => hexDistance(p, t) >= 6)) {
      picks.push(t);
      if (picks.length === n) break;
    }
  }
  // Fallback si pas assez d'espace
  while (picks.length < n) {
    picks.push(land[picks.length]);
  }
  return picks;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===========================================================
// VISIBILITY
// ===========================================================
function recomputeVisibility() {
  const vis = deserializeVisibility(state.visibility);
  for (const civId in state.civsInGame) {
    vis[civId].visible = new Set();
  }
  // unités : voient à 2 cases
  for (const u of Object.values(state.units)) {
    const v = vis[u.civId];
    if (!v) continue;
    for (let dq = -2; dq <= 2; dq++) {
      for (let dr = -2; dr <= 2; dr++) {
        const nq = u.q + dq, nr = u.r + dr;
        if (hexDistance({q:u.q,r:u.r},{q:nq,r:nr}) <= 2 && hexInBounds(nq,nr)) {
          const k = hexKey(nq,nr);
          if (state.tiles[k]) {
            v.visible.add(k);
            v.explored.add(k);
          }
        }
      }
    }
  }
  // villes : 2 cases aussi
  for (const c of Object.values(state.cities)) {
    const v = vis[c.civId];
    if (!v) continue;
    for (let dq = -2; dq <= 2; dq++) {
      for (let dr = -2; dr <= 2; dr++) {
        const nq = c.q + dq, nr = c.r + dr;
        if (hexDistance({q:c.q,r:c.r},{q:nq,r:nr}) <= 2 && hexInBounds(nq,nr)) {
          const k = hexKey(nq,nr);
          if (state.tiles[k]) {
            v.visible.add(k);
            v.explored.add(k);
          }
        }
      }
    }
  }
  state.visibility = serializeVisibility(vis);
}

// ===========================================================
// STORAGE
// ===========================================================
function loadState() {
  try {
    const v = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (v) return JSON.parse(v);
  } catch (e) {}
  return null;
}
function saveState() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.error('save fail', e); }
}
function deleteState() {
  try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch(e){}
}

// ===========================================================
// COMPUTE / ECONOMICS
// ===========================================================
function getUnitsByPos() {
  const m = {};
  for (const u of Object.values(state.units)) {
    m[hexKey(u.q, u.r)] = u;
  }
  return m;
}

function getCityAt(q, r) {
  for (const c of Object.values(state.cities)) {
    if (c.q === q && c.r === r) return c;
  }
  return null;
}

function isPlayerTile(q, r) {
  const c = getCityAt(q, r);
  if (c) return c.civId === state.playerCivId;
  return false;
}

function cityYields(city) {
  // somme des cases dans rayon CITY_RADIUS
  let food = 0, prod = 0, gold = 0;
  for (let dq = -CONFIG.CITY_RADIUS; dq <= CONFIG.CITY_RADIUS; dq++) {
    for (let dr = -CONFIG.CITY_RADIUS; dr <= CONFIG.CITY_RADIUS; dr++) {
      if (hexDistance({q:city.q,r:city.r},{q:city.q+dq,r:city.r+dr}) <= CONFIG.CITY_RADIUS) {
        const t = state.tiles[hexKey(city.q+dq, city.r+dr)];
        if (!t) continue;
        const tr = TERRAINS[t.terrain];
        food += tr.food; prod += tr.prod; gold += tr.gold;
      }
    }
  }
  // + ville elle-même produit toujours un peu
  food += 2; prod += 2; gold += 1;
  // bâtiments
  let goldMul = 1, sciMul = 1, prodMul = 1;
  for (const b of city.buildings) {
    const def = BUILDINGS[b];
    if (!def) continue;
    if (def.bonus.food) food += def.bonus.food;
    if (def.bonus.goldMul) goldMul *= def.bonus.goldMul;
    if (def.bonus.sciMul) sciMul *= def.bonus.sciMul;
    if (def.bonus.prodMul) prodMul *= def.bonus.prodMul;
  }
  // merveilles globales
  const civ = state.civsInGame[city.civId];
  for (const w of civ.ownedWonders) {
    const wd = WONDERS[w];
    if (wd.bonus.allCitiesProd) prod += wd.bonus.allCitiesProd;
    if (wd.bonus.globalProd) prod = Math.round(prod * wd.bonus.globalProd);
    if (wd.bonus.globalSci) sciMul *= wd.bonus.globalSci;
  }
  // bonus civ
  if (city.civId === 'rome') gold += CIVS.rome.bonus.goldPerCity || 0;

  // science = base sur la pop * library mul
  const science = Math.round((1 + city.pop) * sciMul);
  prod = Math.round(prod * prodMul);
  gold = Math.round(gold * goldMul);
  return { food, prod, gold, science };
}

function totalsForPlayer() {
  let gold = 0, sci = 0, prod = 0, pop = 0;
  let cities = 0;
  for (const c of Object.values(state.cities)) {
    if (c.civId !== state.playerCivId) continue;
    cities++; pop += c.pop;
    const y = cityYields(c);
    gold += y.gold; sci += y.science; prod += y.prod;
    // entretien des unités : -1 or par unité
  }
  // entretien
  let upkeep = 0;
  for (const u of Object.values(state.units)) {
    if (u.civId === state.playerCivId) upkeep++;
  }
  gold -= upkeep;
  return { gold, sci, prod, pop, cities };
}

function getCurrentEra(civId) {
  // ère du joueur = ère la plus haute de toutes ses techs connues
  const civ = state.civsInGame[civId];
  let best = 'antiquity';
  for (const t of civ.knownTechs) {
    const e = TECHS[t]?.era;
    if (e && ERAS.indexOf(e) > ERAS.indexOf(best)) best = e;
  }
  return best;
}

function isAvailableUnit(civId, unitKey) {
  const u = UNITS[unitKey];
  if (!u) return false;
  if (!u.tech) return true;
  return state.civsInGame[civId].knownTechs.includes(u.tech);
}
function isAvailableBuilding(civId, bk) {
  const b = BUILDINGS[bk];
  if (!b) return false;
  if (!b.tech) return true;
  return state.civsInGame[civId].knownTechs.includes(b.tech);
}
function isAvailableTech(civId, tk) {
  const t = TECHS[tk];
  if (!t) return false;
  const civ = state.civsInGame[civId];
  if (civ.knownTechs.includes(tk)) return false;
  return t.requires.every(r => civ.knownTechs.includes(r));
}
function isAvailableWonder(wonderId, civId) {
  const w = WONDERS[wonderId];
  if (!w) return false;
  // déjà construite par quelqu'un ?
  for (const c of Object.values(state.civsInGame)) {
    if (c.ownedWonders.includes(wonderId)) return false;
  }
  if (!w.tech) return true;
  return state.civsInGame[civId].knownTechs.includes(w.tech);
}

// ===========================================================
// COMBAT
// ===========================================================
function combatStrength(unit, asAttacker, defenseTile) {
  const u = UNITS[unit.key];
  let s = asAttacker ? u.attack : u.defense;
  // bonus terrain défensif
  if (!asAttacker && defenseTile) {
    const tr = TERRAINS[defenseTile.terrain];
    if (tr.defenseBonus) s = s * (1 + tr.defenseBonus);
  }
  // bonus civ
  const civ = CIVS[unit.civId];
  // hp ratio impacte
  s = s * (0.5 + 0.5 * unit.hp / 100);
  if (unit.fortified && !asAttacker) s *= 1.25;
  return s;
}

function performCombat(attacker, defender) {
  const aTile = state.tiles[hexKey(attacker.q, attacker.r)];
  const dTile = state.tiles[hexKey(defender.q, defender.r)];
  const aS = combatStrength(attacker, true, aTile);
  const dS = combatStrength(defender, false, dTile);
  // dégâts proportionnels
  const ratio = aS / (aS + dS);
  const dmgToDef = Math.round(40 + 30 * ratio);
  const dmgToAtt = Math.round(40 + 30 * (1 - ratio));
  defender.hp -= dmgToDef;
  // si attaquant en mêlée, il subit aussi
  if (UNITS[attacker.key].type !== 'ranged') {
    attacker.hp -= dmgToAtt;
  }
  return { dmgToDef, dmgToAtt, defenderKilled: defender.hp <= 0, attackerKilled: attacker.hp <= 0 };
}

// ===========================================================
// ACTIONS
// ===========================================================
function canMoveUnitTo(unit, targetQ, targetR) {
  if (unit.movesLeft <= 0) return false;
  const target = state.tiles[hexKey(targetQ, targetR)];
  if (!target) return false;
  const tr = TERRAINS[target.terrain];
  if (tr.impassable) return false;
  if (tr.water) return false; // pour V1, pas de bateaux
  return true;
}

function getMoveTargets(unit) {
  // toutes les cases atteignables avec les mouvements restants
  const reach = {};
  reach[hexKey(unit.q, unit.r)] = 0;
  const queue = [{ q: unit.q, r: unit.r, left: unit.movesLeft }];
  const unitsByPos = getUnitsByPos();
  while (queue.length) {
    const cur = queue.shift();
    if (cur.left <= 0) continue;
    for (const n of hexNeighbors(cur.q, cur.r)) {
      if (!hexInBounds(n.q, n.r)) continue;
      const k = hexKey(n.q, n.r);
      const t = state.tiles[k];
      if (!t) continue;
      const tr = TERRAINS[t.terrain];
      if (tr.impassable || tr.water) continue;
      const cost = tr.moveCost || 1;
      if (cur.left < cost) continue;
      const occ = unitsByPos[k];
      if (occ && occ.civId === unit.civId) continue; // pas de stack
      const remaining = cur.left - cost;
      if (reach[k] === undefined || reach[k] < remaining) {
        reach[k] = remaining;
        if (!occ) queue.push({ q: n.q, r: n.r, left: remaining });
      }
    }
  }
  delete reach[hexKey(unit.q, unit.r)];
  return Object.keys(reach);
}

function getAttackTargets(unit) {
  const u = UNITS[unit.key];
  if (u.type === 'settler' || u.attack === 0) return [];
  if (unit.movesLeft <= 0) return [];
  const range = u.range || 1;
  const targets = [];
  for (const otherUnit of Object.values(state.units)) {
    if (otherUnit.civId === unit.civId) continue;
    const d = hexDistance({q:unit.q,r:unit.r}, {q:otherUnit.q,r:otherUnit.r});
    if (d <= range) targets.push(hexKey(otherUnit.q, otherUnit.r));
  }
  // villes ennemies aussi
  for (const c of Object.values(state.cities)) {
    if (c.civId === unit.civId) continue;
    const d = hexDistance({q:unit.q,r:unit.r}, {q:c.q,r:c.r});
    if (d <= range) targets.push(hexKey(c.q, c.r));
  }
  return targets;
}

function moveUnit(unit, targetQ, targetR) {
  const path = findPath({q:unit.q,r:unit.r}, {q:targetQ,r:targetR}, state.tiles, getUnitsByPos(), false);
  if (!path) return false;
  // coût total
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const t = state.tiles[hexKey(path[i].q, path[i].r)];
    cost += TERRAINS[t.terrain].moveCost || 1;
  }
  if (cost > unit.movesLeft) {
    // mouvement partiel jusqu'où on peut
    let moved = 0; let lastValid = 0;
    for (let i = 1; i < path.length; i++) {
      const t = state.tiles[hexKey(path[i].q, path[i].r)];
      const c = TERRAINS[t.terrain].moveCost || 1;
      if (moved + c > unit.movesLeft) break;
      moved += c;
      lastValid = i;
    }
    if (lastValid === 0) return false;
    unit.q = path[lastValid].q; unit.r = path[lastValid].r;
    unit.movesLeft -= moved;
  } else {
    unit.q = targetQ; unit.r = targetR;
    unit.movesLeft -= cost;
  }
  unit.fortified = false;
  return true;
}

function foundCity(settler) {
  // vérifier qu'on est pas trop près d'une autre ville
  for (const c of Object.values(state.cities)) {
    if (hexDistance({q:settler.q,r:settler.r}, {q:c.q,r:c.r}) < 3) {
      return { ok: false, reason: 'Trop près d\'une autre ville' };
    }
  }
  // limite max 5 villes pour le joueur
  const myCities = Object.values(state.cities).filter(c => c.civId === settler.civId).length;
  if (myCities >= 5) {
    return { ok: false, reason: 'Empire trop vaste (max 5 villes)' };
  }
  // créer
  const civ = CIVS[settler.civId];
  const usedNames = Object.values(state.cities)
    .filter(c => c.civId === settler.civId)
    .map(c => c.name);
  const availableNames = civ.cityNames.filter(n => !usedNames.includes(n));
  const name = availableNames[0] || (civ.cityNames[0] + ' ' + (myCities + 1));
  const cityId = 'c' + Date.now() + Math.floor(Math.random() * 1000);
  state.cities[cityId] = {
    id: cityId, name, q: settler.q, r: settler.r,
    civId: settler.civId, pop: 1, food: 0,
    buildings: [], production: null, productionStored: 0,
    hp: 100, hpMax: 100,
  };
  // supprime le colon
  delete state.units[settler.id];
  return { ok: true, cityId };
}

function startResearch(civId, techKey) {
  if (!isAvailableTech(civId, techKey)) return false;
  state.civsInGame[civId].researching = techKey;
  return true;
}

function startProduction(cityId, item) {
  // item: {type:'unit'|'building'|'wonder', key}
  state.cities[cityId].production = item;
  return true;
}

// ===========================================================
// END TURN
// ===========================================================
function endTurn() {
  // 1. produire ressources pour toutes les civs
  for (const civId in state.civsInGame) {
    processCivTurn(civId);
  }

  // 2. l'IA joue
  for (const civId in state.civsInGame) {
    if (civId === state.playerCivId) continue;
    if (state.civsInGame[civId].defeated) continue;
    aiTurn(civId);
  }

  // 3. reset moves
  for (const u of Object.values(state.units)) {
    u.movesLeft = UNITS[u.key].move;
  }

  // 4. avancer turn
  state.turn++;
  state.actionPoints = CONFIG.AP_PER_TURN;

  // 5. vérifier conditions de victoire / défaite
  checkWinConditions();

  recomputeVisibility();
  saveState();
}

function processCivTurn(civId) {
  const civ = state.civsInGame[civId];
  let totalGold = 0, totalSci = 0;
  for (const c of Object.values(state.cities)) {
    if (c.civId !== civId) continue;
    const y = cityYields(c);
    totalGold += y.gold;
    totalSci += y.science;

    // production
    if (c.production) {
      c.productionStored += y.prod;
      const cost = productionCost(c.production, civId);
      if (c.productionStored >= cost) {
        completeProduction(c);
      }
    }
    // food / pop
    c.food += y.food - c.pop * 2;
    if (c.food >= 10 + c.pop * 5) {
      c.food = 0;
      c.pop = Math.min(c.pop + 1, 8);
    }
    if (c.food < 0) {
      c.food = 0;
      if (c.pop > 1 && Math.random() < 0.3) c.pop--;
    }
    // city heal
    if (c.hp < c.hpMax) c.hp = Math.min(c.hpMax, c.hp + 5);
  }
  // entretien unités
  let upkeep = 0;
  for (const u of Object.values(state.units)) {
    if (u.civId === civId) upkeep++;
  }
  totalGold -= upkeep;
  civ.gold = Math.max(0, civ.gold + totalGold);
  // si en faillite, perdre l'unité la plus chère
  if (civ.gold === 0 && totalGold < 0) {
    // disband unité aléatoire
    const myUnits = Object.values(state.units).filter(u => u.civId === civId);
    if (myUnits.length) {
      const victim = myUnits[Math.floor(Math.random() * myUnits.length)];
      delete state.units[victim.id];
      if (civId === state.playerCivId) {
        toast('Faillite : ' + UNITS[victim.key].name + ' dissous');
      }
    }
  }

  // recherche
  if (civ.researching) {
    civ.science += totalSci;
    const t = TECHS[civ.researching];
    if (civ.science >= t.cost) {
      civ.science -= t.cost;
      civ.knownTechs.push(civ.researching);
      const techName = t.name;
      civ.researching = null;
      if (civId === state.playerCivId) {
        showModal({
          tag: 'Découverte',
          title: techName,
          text: 'Votre civilisation maîtrise désormais ' + techName + '. De nouvelles possibilités s\'ouvrent.',
          actions: [{ label: 'Continuer', primary: true }],
        });
      }
    }
  }
  // unité fortifiée gagne hp
  for (const u of Object.values(state.units)) {
    if (u.civId !== civId) continue;
    if (u.fortified && u.hp < 100) u.hp = Math.min(100, u.hp + 10);
  }
}

function productionCost(item, civId) {
  let base = 0;
  if (item.type === 'unit') base = UNITS[item.key].cost;
  else if (item.type === 'building') base = BUILDINGS[item.key].cost;
  else if (item.type === 'wonder') base = WONDERS[item.key].cost;
  // bonus civ
  if (civId === 'egypt' && item.type === 'wonder') base = base / CIVS.egypt.bonus.wonderProduction;
  if (civId === 'japan' && item.type === 'unit' && UNITS[item.key].attack > 0) base = base / CIVS.japan.bonus.militaryProduction;
  return Math.round(base);
}

function completeProduction(city) {
  const item = city.production;
  city.productionStored = 0;
  city.production = null;
  if (item.type === 'unit') {
    // place l'unité sur ou à côté de la ville
    const spawnSpot = findSpawnSpot(city);
    if (!spawnSpot) {
      // skip si pas de place
      return;
    }
    const newUnit = {
      id: 'u' + (state.nextUnitId++),
      key: item.key, civId: city.civId,
      q: spawnSpot.q, r: spawnSpot.r,
      hp: 100, movesLeft: 0, fortified: false,
    };
    state.units[newUnit.id] = newUnit;
    if (city.civId === state.playerCivId) {
      toast(UNITS[item.key].name + ' formé à ' + city.name);
    }
  } else if (item.type === 'building') {
    if (!city.buildings.includes(item.key)) city.buildings.push(item.key);
    if (city.civId === state.playerCivId) toast(BUILDINGS[item.key].name + ' construit à ' + city.name);
  } else if (item.type === 'wonder') {
    if (!state.civsInGame[city.civId].ownedWonders.includes(item.key)) {
      state.civsInGame[city.civId].ownedWonders.push(item.key);
    }
    if (city.civId === state.playerCivId) {
      toast('Merveille ' + WONDERS[item.key].name + ' achevée !');
    }
  }
}

function findSpawnSpot(city) {
  const unitsByPos = getUnitsByPos();
  // sur la ville d'abord ?
  const cityKey = hexKey(city.q, city.r);
  if (!unitsByPos[cityKey]) return { q: city.q, r: city.r };
  for (const n of hexNeighbors(city.q, city.r)) {
    if (!hexInBounds(n.q, n.r)) continue;
    const k = hexKey(n.q, n.r);
    const t = state.tiles[k];
    if (!t) continue;
    const tr = TERRAINS[t.terrain];
    if (tr.impassable || tr.water) continue;
    if (!unitsByPos[k]) return n;
  }
  return null;
}

// ===========================================================
// IA TRÈS BASIQUE
// ===========================================================
function aiTurn(civId) {
  const civ = state.civsInGame[civId];
  // 1. recherche : si rien, choisir une tech disponible aléatoire
  if (!civ.researching) {
    const avail = Object.keys(TECHS).filter(t => isAvailableTech(civId, t));
    if (avail.length) {
      // priorité : militaire si attaqué, sinon économie
      civ.researching = avail[Math.floor(Math.random() * avail.length)];
    }
  }
  // 2. produire dans chaque ville : si rien, militaire ou bâtiment
  for (const c of Object.values(state.cities)) {
    if (c.civId !== civId) continue;
    if (!c.production) {
      // 60% unité, 40% bâtiment
      if (Math.random() < 0.6) {
        const units = Object.keys(UNITS).filter(u => isAvailableUnit(civId, u) && u !== 'settler');
        if (units.length) c.production = { type: 'unit', key: units[Math.floor(Math.random() * units.length)] };
      } else {
        const builds = Object.keys(BUILDINGS).filter(b => isAvailableBuilding(civId, b) && !c.buildings.includes(b));
        if (builds.length) c.production = { type: 'building', key: builds[Math.floor(Math.random() * builds.length)] };
        else {
          const units = Object.keys(UNITS).filter(u => isAvailableUnit(civId, u) && u !== 'settler');
          if (units.length) c.production = { type: 'unit', key: units[Math.floor(Math.random() * units.length)] };
        }
      }
    }
  }
  // 3. unités : déplacement basique
  for (const u of Object.values(state.units)) {
    if (u.civId !== civId) continue;
    if (u.movesLeft <= 0) continue;
    aiMoveUnit(u);
  }
}

function aiMoveUnit(unit) {
  // colon: fonde dès que possible si terrain ok et pas de ville à 3 cases
  if (unit.key === 'settler') {
    const myCities = Object.values(state.cities).filter(c => c.civId === unit.civId);
    if (myCities.length < 3) {
      const here = state.tiles[hexKey(unit.q, unit.r)];
      const tr = TERRAINS[here.terrain];
      const tooClose = myCities.some(c => hexDistance({q:unit.q,r:unit.r},{q:c.q,r:c.r}) < 4);
      if (!tooClose && !tr.water && !tr.impassable) {
        foundCity(unit);
        return;
      }
      // sinon avance d'un random
      const ts = getMoveTargets(unit);
      if (ts.length) {
        const pick = ts[Math.floor(Math.random() * ts.length)];
        const { q, r } = parseHexKey(pick);
        moveUnit(unit, q, r);
      }
    }
    return;
  }
  // militaire : attaque si à portée
  const atks = getAttackTargets(unit);
  if (atks.length) {
    const pickKey = atks[0];
    const { q, r } = parseHexKey(pickKey);
    aiAttack(unit, q, r);
    return;
  }
  // sinon avance vers ennemi le plus proche
  const enemies = Object.values(state.units).filter(u => u.civId !== unit.civId);
  if (enemies.length) {
    enemies.sort((a, b) => hexDistance({q:unit.q,r:unit.r},{q:a.q,r:a.r}) - hexDistance({q:unit.q,r:unit.r},{q:b.q,r:b.r}));
    const target = enemies[0];
    const ts = getMoveTargets(unit);
    if (ts.length) {
      // cherche la case qui rapproche
      let best = null, bestD = 99;
      for (const k of ts) {
        const { q, r } = parseHexKey(k);
        const d = hexDistance({q,r}, {q:target.q,r:target.r});
        if (d < bestD) { bestD = d; best = {q,r}; }
      }
      if (best) moveUnit(unit, best.q, best.r);
    }
  } else {
    // patrol random
    const ts = getMoveTargets(unit);
    if (ts.length && Math.random() < 0.3) {
      const pick = ts[Math.floor(Math.random() * ts.length)];
      const { q, r } = parseHexKey(pick);
      moveUnit(unit, q, r);
    } else {
      unit.fortified = true;
    }
  }
}

function aiAttack(unit, tq, tr) {
  const targetUnit = Object.values(state.units).find(u => u.q === tq && u.r === tr);
  const targetCity = getCityAt(tq, tr);
  if (targetUnit) {
    const r = performCombat(unit, targetUnit);
    if (r.defenderKilled) {
      delete state.units[targetUnit.id];
      // si attaquant en mêlée, prend la case
      if (UNITS[unit.key].type !== 'ranged' && unit.hp > 0) {
        unit.q = tq; unit.r = tr;
      }
    }
    if (r.attackerKilled) delete state.units[unit.id];
  } else if (targetCity) {
    // attaque ville: réduit hp ville
    const dmg = UNITS[unit.key].attack;
    targetCity.hp -= dmg;
    if (targetCity.hp <= 0) {
      // capture / destruction (pour V1, on capture)
      targetCity.civId = unit.civId;
      targetCity.hp = 50;
      if (targetCity.civId === state.playerCivId || unit.civId === state.playerCivId) {
        toast(targetCity.name + ' a changé de mains !');
      }
    }
  }
  unit.movesLeft = 0;
}

function checkWinConditions() {
  // Défaite : plus de villes ni de colon
  for (const civId in state.civsInGame) {
    const civ = state.civsInGame[civId];
    if (civ.defeated) continue;
    const cities = Object.values(state.cities).filter(c => c.civId === civId).length;
    const settlers = Object.values(state.units).filter(u => u.civId === civId && u.key === 'settler').length;
    if (cities === 0 && settlers === 0) {
      civ.defeated = true;
      if (civId === state.playerCivId) {
        state.gameOver = { type: 'defeat', text: 'Votre civilisation s\'est éteinte.' };
      }
    }
  }
  // Victoire domination
  const alive = Object.values(state.civsInGame).filter(c => !c.defeated);
  if (alive.length === 1 && alive[0].id === state.playerCivId) {
    state.gameOver = { type: 'domination', text: 'Vous régnez sans partage sur le monde.' };
    return;
  }
  // Victoire science : merveille finale
  const playerCiv = state.civsInGame[state.playerCivId];
  if (playerCiv.ownedWonders.includes('finalLib')) {
    state.gameOver = { type: 'science', text: 'Votre savoir illumine l\'humanité.' };
    return;
  }
  // Victoire éco
  if (playerCiv.gold >= CONFIG.VICTORY_GOLD && playerCiv.ownedWonders.length >= CONFIG.VICTORY_WONDERS) {
    state.gameOver = { type: 'economy', text: 'Votre empire est le plus prospère que le monde ait connu.' };
  }
}

// ===========================================================
// RENDER MAP
// ===========================================================
const SVG_NS = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, children = []) {
  const e = document.createElementNS(SVG_NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of (Array.isArray(children) ? children : [children])) {
    if (typeof c === 'string') e.innerHTML += c;
    else if (c) e.appendChild(c);
  }
  return e;
}

function renderMap() {
  const svg = document.getElementById('mapSvg');
  svg.innerHTML = '';
  const vis = deserializeVisibility(state.visibility);
  const playerVis = vis[state.playerCivId];

  // bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const k in state.tiles) {
    const t = state.tiles[k];
    const p = hexToPixel(t.q, t.r);
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const padding = CONFIG.HEX_SIZE * 1.2;
  const w = maxX - minX + padding * 2;
  const h = maxY - minY + padding * 2;
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${w} ${h}`);

  // groupes
  const gTerrain = el('g', { id: 'g-terrain' });
  const gOverlay = el('g', { id: 'g-overlay' });
  const gFog = el('g', { id: 'g-fog' });
  const gCities = el('g', { id: 'g-cities' });
  const gUnits = el('g', { id: 'g-units' });
  const gSelection = el('g', { id: 'g-selection' });

  // dessine terrain
  for (const k in state.tiles) {
    const t = state.tiles[k];
    const explored = playerVis.explored.has(k);
    const visible = playerVis.visible.has(k);
    if (!explored) continue; // pas exploré : on dessine du noir global
    const p = hexToPixel(t.q, t.r);
    const path = hexPath(p.x, p.y);
    const color = TERRAINS[t.terrain].color;
    const tile = el('path', {
      d: path,
      fill: color,
      class: 'hex-base',
      'data-q': t.q, 'data-r': t.r,
    });
    if (!visible) tile.style.filter = 'brightness(0.65)';
    gTerrain.appendChild(tile);
    // grille
    gOverlay.appendChild(el('path', { d: path, class: 'hex-overlay' }));
  }

  // fog complet pour les non explorés
  for (const k in state.tiles) {
    if (!playerVis.explored.has(k)) {
      const t = state.tiles[k];
      const p = hexToPixel(t.q, t.r);
      gFog.appendChild(el('path', { d: hexPath(p.x, p.y), class: 'hex-fog' }));
    }
  }

  // villes
  for (const c of Object.values(state.cities)) {
    const k = hexKey(c.q, c.r);
    if (!playerVis.explored.has(k)) continue;
    const p = hexToPixel(c.q, c.r);
    const g = el('g', { transform: `translate(${p.x},${p.y})` });
    g.innerHTML = citySVG(c.civId);
    // nom
    const lbl = el('text', { x: 0, y: CONFIG.HEX_SIZE * 0.6, class: 'city-label' });
    lbl.textContent = `${c.name} ${c.pop}`;
    g.appendChild(lbl);
    // hp si endommagée
    if (c.hp < c.hpMax) {
      const ratio = c.hp / c.hpMax;
      g.appendChild(el('rect', { x: -10, y: -16, width: 20, height: 2, fill: '#2a2218', opacity: 0.4 }));
      g.appendChild(el('rect', { x: -10, y: -16, width: 20 * ratio, height: 2, fill: '#a83828' }));
    }
    g.style.cursor = 'pointer';
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      onCityTapped(c);
    });
    gCities.appendChild(g);
  }

  // unités
  for (const u of Object.values(state.units)) {
    const k = hexKey(u.q, u.r);
    if (!playerVis.visible.has(k) && u.civId !== state.playerCivId) continue;
    const p = hexToPixel(u.q, u.r);
    const g = el('g', { transform: `translate(${p.x},${p.y})` });
    g.innerHTML = unitSVG(u.key, u.civId, u.hp, 100);
    if (u.fortified) {
      g.appendChild(el('circle', { cx: 0, cy: 0, r: 14, fill: 'none', stroke: '#2a2218', 'stroke-width': 0.7, 'stroke-dasharray': '2 2' }));
    }
    if (u.movesLeft > 0 && u.civId === state.playerCivId) {
      // petit point vert
      g.appendChild(el('circle', { cx: 11, cy: -11, r: 2, fill: '#5b8a3a' }));
    }
    g.style.cursor = 'pointer';
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      onUnitTapped(u);
    });
    gUnits.appendChild(g);
  }

  // sélection
  if (ui.selectedUnit) {
    const u = state.units[ui.selectedUnit];
    if (u) {
      const p = hexToPixel(u.q, u.r);
      gSelection.appendChild(el('path', { d: hexPath(p.x, p.y), class: 'hex-selected' }));
    }
  }
  for (const k of ui.moveTargets) {
    const { q, r } = parseHexKey(k);
    const p = hexToPixel(q, r);
    gSelection.appendChild(el('path', { d: hexPath(p.x, p.y), class: 'hex-move-target' }));
  }
  for (const k of ui.attackTargets) {
    const { q, r } = parseHexKey(k);
    const p = hexToPixel(q, r);
    gSelection.appendChild(el('path', { d: hexPath(p.x, p.y), class: 'hex-attack-target' }));
  }

  svg.appendChild(gTerrain);
  svg.appendChild(gOverlay);
  svg.appendChild(gFog);
  svg.appendChild(gCities);
  svg.appendChild(gUnits);
  svg.appendChild(gSelection);

  // tap-on-empty pour gérer les cibles de mouvement
  svg.addEventListener('click', onMapTapped);

  applyMapTransform();
}

function applyMapTransform() {
  const svg = document.getElementById('mapSvg');
  svg.style.transform = `translate(${ui.panX}px, ${ui.panY}px) scale(${ui.zoom})`;
}

function centerMapOn(q, r) {
  const wrap = document.getElementById('mapWrap');
  const p = hexToPixel(q, r);
  const padding = CONFIG.HEX_SIZE * 1.2;
  // calcul
  let minX = Infinity, minY = Infinity;
  for (const k in state.tiles) {
    const t = state.tiles[k];
    const pp = hexToPixel(t.q, t.r);
    minX = Math.min(minX, pp.x); minY = Math.min(minY, pp.y);
  }
  const localX = (p.x - minX + padding);
  const localY = (p.y - minY + padding);
  ui.panX = wrap.clientWidth / 2 - localX * ui.zoom;
  ui.panY = wrap.clientHeight / 2 - localY * ui.zoom;
  applyMapTransform();
}

// ===========================================================
// RENDER HUD
// ===========================================================
function renderHUD() {
  const civ = CIVS[state.playerCivId];
  // recrée le svg propre
  const emblemHost = document.getElementById('hudEmblem');
  emblemHost.innerHTML = emblemSVG(state.playerCivId, 28).replace(/<svg[^>]*>|<\/svg>/g, '');
  emblemHost.setAttribute('viewBox', '0 0 100 100');
  document.getElementById('hudCivName').textContent = civ.name;
  document.getElementById('hudEra').textContent = ERA_NAMES[getCurrentEra(state.playerCivId)];
  document.getElementById('hudTurn').textContent = state.turn;
  const totals = totalsForPlayer();
  const playerCiv = state.civsInGame[state.playerCivId];
  document.getElementById('rGold').textContent = playerCiv.gold;
  document.getElementById('rGoldRate').textContent = (totals.gold >= 0 ? '+' : '') + totals.gold;
  document.getElementById('rGoldRate').className = 'r-rate' + (totals.gold < 0 ? ' bad' : '');
  document.getElementById('rSci').textContent = playerCiv.science;
  document.getElementById('rSciRate').textContent = '+' + totals.sci;
  document.getElementById('rProd').textContent = totals.prod;
  document.getElementById('rProdRate').textContent = '+' + totals.prod;
  document.getElementById('rPop').textContent = totals.pop;
  document.getElementById('rCities').textContent = totals.cities;
}

// ===========================================================
// PANEL: dynamic
// ===========================================================
function showPanel(html) {
  const p = document.getElementById('panel');
  p.innerHTML = html;
  p.classList.remove('hidden');
}
function hidePanel() {
  document.getElementById('panel').classList.add('hidden');
  ui.selectedUnit = null;
  ui.selectedCity = null;
  ui.moveTargets = [];
  ui.attackTargets = [];
  renderMap();
}

function onUnitTapped(unit) {
  if (unit.civId !== state.playerCivId) {
    // si une unité à nous est sélectionnée et peut attaquer → attaque
    if (ui.selectedUnit) {
      const my = state.units[ui.selectedUnit];
      if (my && ui.attackTargets.includes(hexKey(unit.q, unit.r))) {
        playerAttack(my, unit.q, unit.r);
        return;
      }
    }
    showEnemyInfo(unit);
    return;
  }
  // sélectionne
  ui.selectedUnit = unit.id;
  ui.selectedCity = null;
  ui.moveTargets = getMoveTargets(unit);
  ui.attackTargets = getAttackTargets(unit);
  renderMap();
  showUnitPanel(unit);
}

function onCityTapped(city) {
  if (city.civId === state.playerCivId) {
    ui.selectedCity = city.id;
    ui.selectedUnit = null;
    ui.moveTargets = [];
    ui.attackTargets = [];
    renderMap();
    showCityPanel(city);
  } else {
    if (ui.selectedUnit) {
      const my = state.units[ui.selectedUnit];
      if (my && ui.attackTargets.includes(hexKey(city.q, city.r))) {
        playerAttack(my, city.q, city.r);
        return;
      }
    }
    showEnemyCityInfo(city);
  }
}

function onMapTapped(e) {
  // si clic sur path hex ?
  const target = e.target;
  if (target.tagName === 'path' && target.dataset.q !== undefined) {
    const q = +target.dataset.q, r = +target.dataset.r;
    const k = hexKey(q, r);
    if (ui.selectedUnit) {
      const u = state.units[ui.selectedUnit];
      if (!u) return;
      if (ui.moveTargets.includes(k)) {
        moveUnit(u, q, r);
        ui.moveTargets = getMoveTargets(u);
        ui.attackTargets = getAttackTargets(u);
        renderMap();
        renderHUD();
        saveState();
        showUnitPanel(u);
        return;
      }
      if (ui.attackTargets.includes(k)) {
        playerAttack(u, q, r);
        return;
      }
    }
    showTileInfo(q, r);
  }
}

function playerAttack(unit, tq, tr) {
  const targetUnit = Object.values(state.units).find(u => u.q === tq && u.r === tr);
  const targetCity = getCityAt(tq, tr);
  if (targetUnit) {
    const r = performCombat(unit, targetUnit);
    let msg = '';
    if (r.defenderKilled) {
      msg = 'Ennemi vaincu !';
      delete state.units[targetUnit.id];
      if (UNITS[unit.key].type !== 'ranged' && unit.hp > 0) {
        unit.q = tq; unit.r = tr;
      }
    } else {
      msg = `Dégâts infligés : ${r.dmgToDef}`;
    }
    if (r.attackerKilled) {
      msg += ' (notre unité est tombée)';
      delete state.units[unit.id];
      ui.selectedUnit = null;
    } else {
      unit.movesLeft = 0;
    }
    toast(msg);
  } else if (targetCity) {
    const dmg = UNITS[unit.key].attack;
    targetCity.hp -= dmg;
    unit.movesLeft = 0;
    if (targetCity.hp <= 0) {
      targetCity.civId = unit.civId;
      targetCity.hp = 50;
      toast('Ville capturée : ' + targetCity.name);
    } else {
      toast(`Ville frappée (-${dmg} pv)`);
    }
  }
  ui.moveTargets = [];
  ui.attackTargets = [];
  if (state.units[unit.id]) {
    ui.attackTargets = getAttackTargets(state.units[unit.id]);
    ui.moveTargets = state.units[unit.id].movesLeft > 0 ? getMoveTargets(state.units[unit.id]) : [];
    showUnitPanel(state.units[unit.id]);
  } else {
    hidePanel();
  }
  renderMap();
  renderHUD();
  checkWinConditions();
  saveState();
  if (state.gameOver) showGameOver();
}

// ===========================================================
// PANELS (info, unit, city, tech)
// ===========================================================
function showUnitPanel(unit) {
  const u = UNITS[unit.key];
  const civ = CIVS[unit.civId];
  let actions = '';
  if (unit.movesLeft > 0) {
    if (unit.key === 'settler') {
      actions += `<div class="panel-row">
        <div class="pr-info"><div class="pr-name">Fonder une ville</div>
        <div class="pr-detail">Crée une nouvelle cité ici. Le colon est consommé.</div></div>
        <div class="pr-action"><button class="primary" onclick="actionFoundCity()">Fonder</button></div>
      </div>`;
    }
    actions += `<div class="panel-row">
      <div class="pr-info"><div class="pr-name">Tapez une case verte/rouge sur la carte</div>
      <div class="pr-detail">Vert : déplacement · Rouge : attaque</div></div>
    </div>`;
    actions += `<div class="panel-row">
      <div class="pr-info"><div class="pr-name">Fortifier (sauter le tour)</div>
      <div class="pr-detail">L'unité régénère et gagne un bonus défensif.</div></div>
      <div class="pr-action"><button onclick="actionFortify()">Fortifier</button></div>
    </div>`;
  } else {
    actions += `<div class="panel-row"><div class="pr-info"><div class="pr-detail">Plus de mouvement ce tour-ci.</div></div></div>`;
  }
  const html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">${u.name}</div>
        <div class="panel-sub">${civ.name} · PV ${unit.hp}/100 · Mvt ${unit.movesLeft}/${u.move}</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    <div style="font-size:13px; color:var(--ink-soft); margin-bottom:8px;">${u.desc}</div>
    <div style="font-size:12px; color:var(--ink-soft); margin-bottom:8px;">Att ${u.attack} · Déf ${u.defense}${u.range ? ' · Portée ' + u.range : ''}</div>
    ${actions}
  `;
  showPanel(html);
}

function actionFoundCity() {
  if (!ui.selectedUnit) return;
  const u = state.units[ui.selectedUnit];
  if (!u) return;
  const r = foundCity(u);
  if (!r.ok) {
    toast(r.reason);
    return;
  }
  toast('Ville fondée');
  ui.selectedUnit = null;
  ui.moveTargets = []; ui.attackTargets = [];
  recomputeVisibility();
  renderMap();
  renderHUD();
  saveState();
  hidePanel();
}

function actionFortify() {
  if (!ui.selectedUnit) return;
  const u = state.units[ui.selectedUnit];
  if (!u) return;
  u.fortified = true;
  u.movesLeft = 0;
  toast('Unité fortifiée');
  ui.moveTargets = []; ui.attackTargets = [];
  renderMap();
  saveState();
  showUnitPanel(u);
}

function showCityPanel(city) {
  const civ = state.civsInGame[city.civId];
  const y = cityYields(city);
  // Production : current
  let prodHtml = '';
  if (city.production) {
    const cost = productionCost(city.production, city.civId);
    const pct = Math.min(100, Math.round(100 * city.productionStored / cost));
    let nm = '';
    if (city.production.type === 'unit') nm = UNITS[city.production.key].name;
    else if (city.production.type === 'building') nm = BUILDINGS[city.production.key].name;
    else if (city.production.type === 'wonder') nm = '✦ ' + WONDERS[city.production.key].name;
    prodHtml = `<div style="background:var(--paper-2); padding:10px; margin:8px 0; border-left:3px solid var(--rust);">
      <div style="font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink-soft);">En production</div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700;">${nm}</div>
      <div style="height:4px; background:rgba(0,0,0,0.1); margin-top:6px;">
        <div style="height:100%; background:var(--rust); width:${pct}%;"></div>
      </div>
      <div style="font-size:11px; color:var(--ink-soft); margin-top:4px;">
        ${city.productionStored}/${cost} (${Math.ceil((cost - city.productionStored) / Math.max(1, y.prod))} tours)
      </div>
    </div>`;
  }

  // queue building/unit/wonder
  let unitsHtml = '';
  for (const uk in UNITS) {
    if (uk === 'settler' && Object.values(state.cities).filter(c => c.civId === city.civId).length >= 4) continue;
    if (!isAvailableUnit(city.civId, uk)) continue;
    const ud = UNITS[uk];
    unitsHtml += `<div class="panel-row">
      <div class="pr-info">
        <div class="pr-name">${ud.name}</div>
        <div class="pr-detail">${ud.desc}</div>
        <div class="pr-cost">Coût : ${productionCost({type:'unit',key:uk},city.civId)} prod${ud.attack ? ' · Att ' + ud.attack : ''}${ud.defense ? ' · Déf ' + ud.defense : ''}</div>
      </div>
      <div class="pr-action"><button onclick="setProd('${city.id}','unit','${uk}')">${city.production && city.production.key === uk ? '✓' : 'Produire'}</button></div>
    </div>`;
  }
  let buildingsHtml = '';
  for (const bk in BUILDINGS) {
    if (!isAvailableBuilding(city.civId, bk)) continue;
    if (city.buildings.includes(bk)) continue;
    const bd = BUILDINGS[bk];
    buildingsHtml += `<div class="panel-row">
      <div class="pr-info">
        <div class="pr-name">${bd.name}</div>
        <div class="pr-detail">${bd.effect}</div>
        <div class="pr-cost">Coût : ${productionCost({type:'building',key:bk},city.civId)} prod</div>
      </div>
      <div class="pr-action"><button onclick="setProd('${city.id}','building','${bk}')">${city.production && city.production.key === bk ? '✓' : 'Bâtir'}</button></div>
    </div>`;
  }
  let wondersHtml = '';
  for (const wk in WONDERS) {
    if (!isAvailableWonder(wk, city.civId)) continue;
    const wd = WONDERS[wk];
    wondersHtml += `<div class="panel-row">
      <div class="pr-info">
        <div class="pr-name">✦ ${wd.name}</div>
        <div class="pr-detail">${wd.effect}</div>
        <div class="pr-cost">Coût : ${productionCost({type:'wonder',key:wk},city.civId)} prod (unique)</div>
      </div>
      <div class="pr-action"><button onclick="setProd('${city.id}','wonder','${wk}')">${city.production && city.production.key === wk ? '✓' : 'Élever'}</button></div>
    </div>`;
  }

  const html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">${city.name}</div>
        <div class="panel-sub">Pop ${city.pop} · PV ${city.hp}/${city.hpMax}</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:8px; font-size:11px;">
      <div><div style="color:var(--ink-soft); font-size:9px; letter-spacing:0.15em; text-transform:uppercase;">Nour</div><div style="font-weight:700; font-size:14px;">+${y.food}</div></div>
      <div><div style="color:var(--ink-soft); font-size:9px; letter-spacing:0.15em; text-transform:uppercase;">Prod</div><div style="font-weight:700; font-size:14px;">+${y.prod}</div></div>
      <div><div style="color:var(--ink-soft); font-size:9px; letter-spacing:0.15em; text-transform:uppercase;">Or</div><div style="font-weight:700; font-size:14px;">+${y.gold}</div></div>
      <div><div style="color:var(--ink-soft); font-size:9px; letter-spacing:0.15em; text-transform:uppercase;">Sci</div><div style="font-weight:700; font-size:14px;">+${y.science}</div></div>
    </div>
    ${prodHtml}
    ${city.buildings.length ? `<div style="font-size:10px; color:var(--ink-soft); letter-spacing:0.15em; text-transform:uppercase; margin:8px 0 4px;">Bâtiments</div>
    <div style="font-size:13px; margin-bottom:8px;">${city.buildings.map(b => BUILDINGS[b].name).join(' · ')}</div>` : ''}
    <div style="font-size:10px; color:var(--ink-soft); letter-spacing:0.15em; text-transform:uppercase; margin:12px 0 4px; border-top:1px solid var(--line); padding-top:10px;">Unités</div>
    ${unitsHtml || '<div style="font-size:12px; color:var(--ink-soft);">Aucune unité disponible</div>'}
    ${buildingsHtml ? `<div style="font-size:10px; color:var(--ink-soft); letter-spacing:0.15em; text-transform:uppercase; margin:12px 0 4px; border-top:1px solid var(--line); padding-top:10px;">Bâtiments</div>${buildingsHtml}` : ''}
    ${wondersHtml ? `<div style="font-size:10px; color:var(--gold); letter-spacing:0.15em; text-transform:uppercase; margin:12px 0 4px; border-top:1px solid var(--line); padding-top:10px;">Merveilles</div>${wondersHtml}` : ''}
  `;
  showPanel(html);
}

function setProd(cityId, type, key) {
  state.cities[cityId].production = { type, key };
  state.cities[cityId].productionStored = 0;
  saveState();
  showCityPanel(state.cities[cityId]);
  toast('Production lancée');
}
window.setProd = setProd;

function showTileInfo(q, r) {
  const t = state.tiles[hexKey(q, r)];
  if (!t) return;
  const tr = TERRAINS[t.terrain];
  const html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">${tr.name}</div>
        <div class="panel-sub">Case ${q},${r}</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    <div style="font-size:13px; color:var(--ink-soft);">Nourriture +${tr.food} · Production +${tr.prod} · Or +${tr.gold}</div>
    ${tr.defenseBonus ? `<div style="font-size:12px; color:var(--moss); margin-top:6px;">Bonus défensif +${Math.round(tr.defenseBonus*100)}%</div>` : ''}
    ${tr.water ? `<div style="font-size:12px; color:var(--ink-soft); margin-top:6px;">Infranchissable sans bateau</div>` : ''}
    ${tr.impassable ? `<div style="font-size:12px; color:var(--rust); margin-top:6px;">Infranchissable</div>` : ''}
  `;
  showPanel(html);
}

function showEnemyInfo(unit) {
  const u = UNITS[unit.key];
  const civ = CIVS[unit.civId];
  const html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">${u.name}</div>
        <div class="panel-sub">${civ.name} (ennemi) · PV ${unit.hp}/100</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    <div style="font-size:13px; color:var(--ink-soft);">${u.desc}</div>
    <div style="font-size:12px; color:var(--ink-soft); margin-top:6px;">Att ${u.attack} · Déf ${u.defense}</div>
    <div style="font-size:12px; margin-top:10px;">Sélectionnez une de vos unités à portée pour attaquer.</div>
  `;
  showPanel(html);
}

function showEnemyCityInfo(city) {
  const civ = CIVS[city.civId];
  const html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">${city.name}</div>
        <div class="panel-sub">${civ.name} (ennemi) · PV ${city.hp}/${city.hpMax}</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    <div style="font-size:13px; color:var(--ink-soft);">Attaquez avec vos unités jusqu'à réduire ses PV à 0 pour la capturer.</div>
  `;
  showPanel(html);
}

// ===========================================================
// TECH TREE PANEL
// ===========================================================
function showTechPanel() {
  ui.selectedUnit = null; ui.selectedCity = null;
  ui.moveTargets = []; ui.attackTargets = [];
  renderMap();

  const civ = state.civsInGame[state.playerCivId];
  let curHtml = '';
  if (civ.researching) {
    const t = TECHS[civ.researching];
    const totals = totalsForPlayer();
    const pct = Math.min(100, Math.round(100 * civ.science / t.cost));
    const turns = Math.ceil((t.cost - civ.science) / Math.max(1, totals.sci));
    curHtml = `<div class="tech-current">
      <div class="label">Recherche en cours</div>
      <div class="name">${t.name}</div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="turns">${civ.science}/${t.cost} (≈ ${turns} tour${turns>1?'s':''})</div>
    </div>`;
  } else {
    curHtml = `<div class="tech-current">
      <div class="label">Aucune recherche</div>
      <div class="name">Choisissez une technologie</div>
    </div>`;
  }
  let listHtml = '';
  for (const era of ERAS) {
    const techsInEra = Object.entries(TECHS).filter(([k,t]) => t.era === era);
    listHtml += `<div style="font-size:10px; color:var(--ink-soft); letter-spacing:0.18em; text-transform:uppercase; margin:14px 0 6px;">${ERA_NAMES[era]}</div>`;
    for (const [k, t] of techsInEra) {
      const known = civ.knownTechs.includes(k);
      const avail = isAvailableTech(state.playerCivId, k);
      const missing = t.requires.filter(r => !civ.knownTechs.includes(r));
      let statusDetail = '';
      if (known) statusDetail = '<span style="color:var(--moss);">✓ Maîtrisé</span>';
      else if (missing.length) statusDetail = '<span style="color:var(--ink-soft);">Requiert : ' + missing.map(m => TECHS[m].name).join(', ') + '</span>';
      else if (avail) statusDetail = '<span style="color:var(--ink-soft);">Disponible</span>';
      listHtml += `<div class="panel-row">
        <div class="pr-info">
          <div class="pr-name">${t.name}</div>
          <div class="pr-detail">${statusDetail}</div>
          <div class="pr-cost">${t.cost} science</div>
        </div>
        <div class="pr-action"><button ${avail ? `onclick="actionResearch('${k}')"` : 'disabled'} class="${civ.researching === k ? 'primary' : ''}">${known ? '—' : (civ.researching === k ? 'En cours' : 'Étudier')}</button></div>
      </div>`;
    }
  }
  showPanel(`
    <div class="panel-header">
      <div>
        <div class="panel-title">Recherche</div>
        <div class="panel-sub">Arbre technologique</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
    ${curHtml}
    ${listHtml}
  `);
}

function actionResearch(techKey) {
  startResearch(state.playerCivId, techKey);
  saveState();
  showTechPanel();
  toast('Recherche : ' + TECHS[techKey].name);
}
window.actionResearch = actionResearch;

function showCitiesPanel() {
  ui.selectedUnit = null; ui.selectedCity = null;
  ui.moveTargets = []; ui.attackTargets = [];
  renderMap();
  const myCities = Object.values(state.cities).filter(c => c.civId === state.playerCivId);
  let html = `
    <div class="panel-header">
      <div>
        <div class="panel-title">Villes</div>
        <div class="panel-sub">${myCities.length} cité${myCities.length > 1 ? 's' : ''}</div>
      </div>
      <button class="panel-close" onclick="hidePanel()">×</button>
    </div>
  `;
  if (!myCities.length) {
    html += '<div style="font-size:13px; color:var(--ink-soft);">Aucune ville. Utilisez votre colon pour en fonder.</div>';
  } else {
    for (const c of myCities) {
      const y = cityYields(c);
      const prodInfo = c.production ? `Produit : ${c.production.type === 'unit' ? UNITS[c.production.key].name : c.production.type === 'building' ? BUILDINGS[c.production.key].name : '✦ ' + WONDERS[c.production.key].name}` : '<span style="color:var(--rust);">Inactive</span>';
      html += `<div class="panel-row" onclick="focusCity('${c.id}')" style="cursor:pointer;">
        <div class="pr-info">
          <div class="pr-name">${c.name}</div>
          <div class="pr-detail">Pop ${c.pop} · +${y.prod} prod · +${y.gold} or · +${y.science} sci</div>
          <div class="pr-cost">${prodInfo}</div>
        </div>
        <div class="pr-action"><button onclick="event.stopPropagation(); focusCity('${c.id}')">Voir</button></div>
      </div>`;
    }
  }
  showPanel(html);
}
function focusCity(cityId) {
  const c = state.cities[cityId];
  if (!c) return;
  centerMapOn(c.q, c.r);
  showCityPanel(c);
}
window.focusCity = focusCity;

function showMenu() {
  showModal({
    tag: 'Menu',
    title: 'Pause',
    text: 'Que voulez-vous faire ?',
    actions: [
      { label: 'Continuer', primary: true },
      { label: 'Recommencer une partie', handler: () => {
        if (confirm('Effacer la partie en cours ?')) {
          deleteState();
          location.reload();
        }
      }},
      { label: 'Aide', handler: () => showHelp() },
    ],
  });
}

function showHelp() {
  showModal({
    tag: 'Aide',
    title: 'Comment jouer',
    text: `Tapez une de vos unités (point vert = peut bouger), puis tapez une case verte pour aller. Cases rouges = ennemis attaquables.<br><br>
    Le colon fonde une ville (3 cases d'écart minimum).<br><br>
    Chaque ville produit ressources et peut bâtir une unité, un bâtiment ou une merveille.<br><br>
    Recherchez des technos pour débloquer plus.<br><br>
    Tour = une demi-journée réelle. Cliquez "Fin de tour" quand vous avez fini.<br><br>
    Victoires possibles : éliminer toutes les civs, construire la Grande Bibliothèque finale, ou accumuler ${CONFIG.VICTORY_GOLD} or et ${CONFIG.VICTORY_WONDERS} merveilles.`,
    actions: [{ label: 'Retour', primary: true }],
  });
}

function showGameOver() {
  if (!state.gameOver) return;
  const titles = { domination: 'Victoire militaire', science: 'Victoire scientifique', economy: 'Victoire économique', defeat: 'Défaite' };
  showModal({
    tag: state.gameOver.type === 'defeat' ? 'Fin' : 'Victoire',
    title: titles[state.gameOver.type] || 'Fin de partie',
    text: state.gameOver.text + '<br><br>Tour ' + state.turn + '.',
    actions: [{ label: 'Nouvelle partie', primary: true, handler: () => { deleteState(); location.reload(); }}],
  });
}

// ===========================================================
// MODAL / TOAST
// ===========================================================
function showModal({ tag, title, text, actions }) {
  const bg = document.getElementById('modalBg');
  const c = document.getElementById('modalContent');
  c.innerHTML = `
    ${tag ? `<div class="modal-tag">${tag}</div>` : ''}
    <h2>${title}</h2>
    <p>${text}</p>
    <div class="actions"></div>
  `;
  const wrap = c.querySelector('.actions');
  for (const a of actions) {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.primary ? 'primary' : 'ghost');
    b.textContent = a.label;
    b.addEventListener('click', () => {
      bg.classList.remove('active');
      if (a.handler) a.handler();
    });
    wrap.appendChild(b);
  }
  bg.classList.add('active');
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===========================================================
// GESTURES (pan/zoom map)
// ===========================================================
function setupMapGestures() {
  const wrap = document.getElementById('mapWrap');
  const svg = document.getElementById('mapSvg');
  let isDragging = false;
  let dragStart = null;
  let didDrag = false;

  // Pinch
  let pinchStartDist = null;
  let pinchStartZoom = 1;

  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist = Math.hypot(dx, dy);
      pinchStartZoom = ui.zoom;
    } else if (e.touches.length === 1) {
      isDragging = true;
      didDrag = false;
      dragStart = { x: e.touches[0].clientX - ui.panX, y: e.touches[0].clientY - ui.panY };
    }
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      ui.zoom = Math.max(0.6, Math.min(2.5, pinchStartZoom * d / pinchStartDist));
      applyMapTransform();
      e.preventDefault();
    } else if (isDragging && e.touches.length === 1) {
      const t = e.touches[0];
      const newX = t.clientX - dragStart.x;
      const newY = t.clientY - dragStart.y;
      if (Math.abs(newX - ui.panX) > 4 || Math.abs(newY - ui.panY) > 4) didDrag = true;
      ui.panX = newX;
      ui.panY = newY;
      applyMapTransform();
    }
  }, { passive: false });

  wrap.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
      pinchStartDist = null;
      // si on a draggé, bloquer le click qui suit
      if (didDrag) {
        const blockClick = (ev) => { ev.stopPropagation(); ev.preventDefault(); wrap.removeEventListener('click', blockClick, true); };
        wrap.addEventListener('click', blockClick, true);
        setTimeout(() => wrap.removeEventListener('click', blockClick, true), 50);
      }
    }
  });

  // Mouse (desktop)
  wrap.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'path' || e.target.tagName === 'g' || e.target.tagName === 'circle') {
      // laisse passer le click sur élément
    }
    isDragging = true;
    didDrag = false;
    dragStart = { x: e.clientX - ui.panX, y: e.clientY - ui.panY };
  });
  wrap.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    if (Math.abs(newX - ui.panX) > 4 || Math.abs(newY - ui.panY) > 4) didDrag = true;
    ui.panX = newX;
    ui.panY = newY;
    applyMapTransform();
  });
  wrap.addEventListener('mouseup', () => {
    isDragging = false;
    if (didDrag) {
      const blockClick = (ev) => { ev.stopPropagation(); ev.preventDefault(); wrap.removeEventListener('click', blockClick, true); };
      wrap.addEventListener('click', blockClick, true);
      setTimeout(() => wrap.removeEventListener('click', blockClick, true), 50);
    }
  });

  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    ui.zoom = Math.max(0.6, Math.min(2.5, ui.zoom + delta));
    applyMapTransform();
  }, { passive: false });
}

// ===========================================================
// BOOT / SPLASH
// ===========================================================
function showSplash() {
  document.getElementById('splash').classList.add('active');
  document.getElementById('game').classList.remove('active');

  // populate civs
  const list = document.getElementById('civsList');
  list.innerHTML = '';
  let selected = null;
  for (const civId in CIVS) {
    const c = CIVS[civId];
    const card = document.createElement('div');
    card.className = 'civ-card';
    card.innerHTML = `
      ${emblemSVG(civId, 56)}
      <div class="cname">${c.name}</div>
      <div class="cdesc">${c.desc}</div>
    `;
    card.addEventListener('click', () => {
      list.querySelectorAll('.civ-card').forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
      selected = civId;
      document.getElementById('startBtn').disabled = false;
    });
    list.appendChild(card);
  }
  document.getElementById('startBtn').onclick = () => {
    if (!selected) return;
    state = makeFreshState(selected);
    recomputeVisibility();
    saveState();
    enterGame(true);
  };
  // Resume si save
  const existing = loadState();
  const resumeBtn = document.getElementById('resumeBtn');
  if (existing) {
    resumeBtn.style.display = 'block';
    resumeBtn.onclick = () => {
      state = existing;
      enterGame(false);
    };
  } else {
    resumeBtn.style.display = 'none';
  }
}

function enterGame(isFresh) {
  document.getElementById('splash').classList.remove('active');
  document.getElementById('game').classList.add('active');
  setupMapGestures();
  renderHUD();
  renderMap();

  // centre sur la première unité du joueur
  const myUnit = Object.values(state.units).find(u => u.civId === state.playerCivId);
  if (myUnit) {
    setTimeout(() => centerMapOn(myUnit.q, myUnit.r), 50);
  }

  // boutons
  document.getElementById('btnEndTurn').onclick = onEndTurnClicked;
  document.getElementById('btnTech').onclick = showTechPanel;
  document.getElementById('btnCities').onclick = showCitiesPanel;
  document.getElementById('btnMenu').onclick = showMenu;

  if (isFresh) {
    setTimeout(() => {
      showModal({
        tag: 'Bienvenue',
        title: 'Vos premiers pas',
        text: 'Vous incarnez ' + CIVS[state.playerCivId].name + '.<br><br>1. Tapez votre <b>colon</b> et déplacez-le sur une bonne case (plaine, près de forêt et collines).<br>2. Fondez votre première ville.<br>3. Lancez une recherche dans le menu <b>Recherche</b>.<br>4. Cliquez <b>Fin de tour</b> quand vous avez terminé.<br><br>Bonne chance.',
        actions: [{ label: 'C\'est parti', primary: true }],
      });
    }, 300);
  }

  if (state.gameOver) showGameOver();
}

function onEndTurnClicked() {
  hidePanel();
  endTurn();
  renderHUD();
  renderMap();
  if (state.gameOver) {
    showGameOver();
  }
}

window.actionFoundCity = actionFoundCity;
window.actionFortify = actionFortify;
window.hidePanel = hidePanel;

// Démarrage
window.addEventListener('load', () => {
  showSplash();
});

// SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
