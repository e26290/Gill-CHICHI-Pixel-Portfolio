// ============================================================
// map.js — town layout + procedural tile renderers.
// The whole world is drawn by code; no image assets.
// ============================================================

export const TS = 16 // logical tile size in px
export const COLS = 44
export const ROWS = 28

// Tile ids
// G grass · g grass(flowers) · P plaza stone · S sidewalk
// R roof · # wall · w window · D door-top · d door-bottom · M poster
// W water · E pond rim · H hedge · t trunk · B bench · L lamp · K kiosk
const SOLID = new Set(['#', 'w', 'R', 'M', 'W', 'E', 'H', 't', 'B', 'L', 'K', 'D'])

export function buildMap() {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill('G'))

  const fill = (x0, y0, x1, y1, t) => {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) if (m[y] && m[y][x] !== undefined) m[y][x] = t
  }

  // --- studio building (top band) ---
  fill(0, 0, COLS - 1, 0, 'R')
  fill(0, 1, COLS - 1, 4, '#')
  // windows on rows 1-2
  for (let x = 2; x < COLS - 2; x += 5) {
    fill(x, 1, x + 1, 2, 'w')
  }
  // doors (2 tall) — section entrances
  const doors = [6, 14, 22, 30, 38]
  for (const dx of doors) {
    m[3][dx] = 'D'
    m[4][dx] = 'd'
    if (m[1][dx] === 'w') m[1][dx] = '#'
    if (m[2][dx] === 'w') m[2][dx] = '#'
    if (m[1][dx + 1] === 'w') m[1][dx + 1] = '#'
    if (m[2][dx + 1] === 'w') m[2][dx + 1] = '#'
  }
  // town map poster on the wall
  m[2][35] = 'M'

  // --- sidewalk under building ---
  fill(0, 5, COLS - 1, 6, 'S')

  // --- plaza (right) and paths ---
  fill(16, 7, COLS - 1, 14, 'P')
  fill(19, 7, 22, ROWS - 2, 'P') // vertical path
  fill(16, 17, COLS - 3, 18, 'P') // lower horizontal path

  // --- pond (left-bottom) ---
  fill(3, 14, 12, 22, 'E')
  fill(4, 15, 11, 21, 'W')

  // --- hedges ---
  fill(1, 8, 13, 8, 'H')
  fill(1, 9, 1, 12, 'H')

  // --- benches on sidewalk + near pond ---
  m[6][3] = 'B'
  m[6][11] = 'B'
  m[6][26] = 'B'
  m[6][34] = 'B'
  m[13][14] = 'B'

  // --- lamps ---
  m[8][17] = 'L'
  m[8][27] = 'L'
  m[16][14] = 'L'
  m[16][30] = 'L'
  m[23][18] = 'L'

  // --- kiosk (Technologies board) ---
  m[10][31] = 'K'

  // --- trees (trunk tile; canopy drawn as foreground) ---
  const trees = [
    [15, 10],
    [25, 12],
    [36, 10],
    [2, 24],
    [15, 21],
    [33, 21],
    [40, 20],
    [8, 11],
    [41, 8]
  ]
  for (const [x, y] of trees) if (m[y][x] === 'G') m[y][x] = 't'

  // --- flower patches ---
  const flowers = [
    [14, 8], [17, 15], [24, 15], [29, 8], [13, 19],
    [26, 20], [37, 16], [5, 12], [23, 23], [31, 24], [10, 25]
  ]
  for (const [x, y] of flowers) if (m[y][x] === 'G') m[y][x] = 'g'

  // hotspot trigger tiles (one tile below each door / beside kiosk)
  const hotspots = [
    { id: 'about', x: 6, y: 5 },
    { id: 'cv', x: 14, y: 5 },
    { id: 'projects', x: 22, y: 5 },
    { id: 'memo', x: 30, y: 5 },
    { id: 'contact', x: 38, y: 5 },
    { id: 'tech', x: 31, y: 11 }
  ]

  return { m, hotspots }
}

export function isSolid(m, x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true
  return SOLID.has(m[y][x])
}

// ============================================================
// Tile renderers — each draws a 16x16 tile at (px,py) on ctx.
// ============================================================
const C = {
  grass1: '#7da453',
  grass2: '#86ad5b',
  grassDot: '#6b9347',
  plaza1: '#cfc8b8',
  plaza2: '#c4bcaa',
  plazaLine: '#aaa28e',
  side1: '#b9b1a0',
  side2: '#b1a896',
  brick1: '#b06a44',
  brick2: '#a65f3c',
  brickLine: '#8a4c2f',
  roof: '#5a4636',
  roofHi: '#6d5642',
  winFrame: '#3e6e63',
  winGlass: '#bcd8e0',
  winGlass2: '#a3c5d2',
  door: '#3e6e63',
  doorDark: '#2f574e',
  knob: '#d4a248',
  water1: '#5aa7c2',
  water2: '#4f9ab5',
  waterHi: '#cfeaf2',
  rim: '#e8e2d2',
  rimLine: '#b6ad97',
  hedge1: '#4f7d3c',
  hedge2: '#5b8c46',
  hedgeHi: '#74a85c',
  trunk: '#7a5638',
  trunkDark: '#5e4029',
  leaf1: '#4f8a44',
  leaf2: '#63a052',
  leafHi: '#86bd6e',
  bench1: '#a87c4a',
  bench2: '#8f6638',
  metal: '#6e6a62',
  metalHi: '#8f8b82',
  amber: '#d4a248',
  ink: '#1f1a12',
  paper: '#f5f1e8',
  pink: '#e89ba0'
}

function seeded(x, y, n) {
  // deterministic pseudo-random per tile
  let s = Math.sin(x * 127.1 + y * 311.7 + n * 74.7) * 43758.5453
  return s - Math.floor(s)
}

function grass(ctx, px, py, x, y, withFlowers) {
  ctx.fillStyle = (x + y) % 2 ? C.grass1 : C.grass2
  ctx.fillRect(px, py, TS, TS)
  for (let i = 0; i < 4; i++) {
    const rx = Math.floor(seeded(x, y, i) * 14) + 1
    const ry = Math.floor(seeded(x, y, i + 9) * 14) + 1
    ctx.fillStyle = C.grassDot
    ctx.fillRect(px + rx, py + ry, 1, 2)
  }
  if (withFlowers) {
    const spots = [
      [3, 4], [10, 3], [6, 9], [12, 11], [2, 12]
    ]
    spots.forEach(([fx, fy], i) => {
      ctx.fillStyle = i % 2 ? C.pink : C.paper
      ctx.fillRect(px + fx, py + fy, 2, 2)
      ctx.fillStyle = C.amber
      ctx.fillRect(px + fx, py + fy, 1, 1)
    })
  }
}

function plaza(ctx, px, py, x, y) {
  ctx.fillStyle = (x + y) % 2 ? C.plaza1 : C.plaza2
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.plazaLine
  ctx.fillRect(px, py + 15, TS, 1)
  ctx.fillRect(px + ((x % 2) ? 4 : 10), py, 1, TS)
}

function sidewalk(ctx, px, py, x) {
  ctx.fillStyle = x % 2 ? C.side1 : C.side2
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.plazaLine
  ctx.fillRect(px, py, 1, TS)
  ctx.fillRect(px, py + 7, TS, 1)
}

function wall(ctx, px, py, y) {
  ctx.fillStyle = y % 2 ? C.brick1 : C.brick2
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.brickLine
  for (let r = 3; r < TS; r += 4) ctx.fillRect(px, py + r, TS, 1)
  ctx.fillRect(px + (y % 2 ? 4 : 10), py, 1, 3)
  ctx.fillRect(px + (y % 2 ? 12 : 6), py + 8, 1, 3)
}

function roof(ctx, px, py) {
  ctx.fillStyle = C.roof
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.roofHi
  ctx.fillRect(px, py + 2, TS, 2)
  ctx.fillStyle = C.ink
  ctx.fillRect(px, py + 14, TS, 2)
}

function windowTile(ctx, px, py, y) {
  wall(ctx, px, py, y)
  ctx.fillStyle = C.winFrame
  ctx.fillRect(px + 1, py + 1, 14, 14)
  ctx.fillStyle = C.winGlass
  ctx.fillRect(px + 3, py + 3, 10, 10)
  ctx.fillStyle = C.winGlass2
  ctx.fillRect(px + 3, py + 8, 10, 1)
  ctx.fillRect(px + 8, py + 3, 1, 10)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(px + 4, py + 4, 2, 3)
}

function doorTop(ctx, px, py) {
  ctx.fillStyle = C.door
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.doorDark
  ctx.fillRect(px + 2, py + 2, 12, 14)
  ctx.fillStyle = C.winGlass
  ctx.fillRect(px + 4, py + 4, 8, 5)
}

function doorBottom(ctx, px, py) {
  ctx.fillStyle = C.door
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.doorDark
  ctx.fillRect(px + 2, py, 12, 14)
  ctx.fillStyle = C.knob
  ctx.fillRect(px + 11, py + 6, 2, 2)
  ctx.fillStyle = C.ink
  ctx.fillRect(px, py + 14, TS, 2)
}

function poster(ctx, px, py, y) {
  wall(ctx, px, py, y)
  ctx.fillStyle = C.paper
  ctx.fillRect(px + 1, py + 1, 14, 13)
  ctx.fillStyle = C.winFrame
  ctx.fillRect(px + 3, py + 3, 4, 3)
  ctx.fillStyle = C.amber
  ctx.fillRect(px + 9, py + 4, 4, 2)
  ctx.fillStyle = C.pink
  ctx.fillRect(px + 4, py + 8, 3, 3)
  ctx.fillStyle = C.water1
  ctx.fillRect(px + 9, py + 9, 4, 3)
}

function water(ctx, px, py, x, y) {
  ctx.fillStyle = (x + y) % 2 ? C.water1 : C.water2
  ctx.fillRect(px, py, TS, TS)
}

function rim(ctx, px, py) {
  ctx.fillStyle = C.rim
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.rimLine
  ctx.fillRect(px, py + 4, TS, 1)
  ctx.fillRect(px, py + 11, TS, 1)
  ctx.fillRect(px + 7, py, 1, TS)
}

function hedge(ctx, px, py, x, y) {
  ctx.fillStyle = C.hedge1
  ctx.fillRect(px, py, TS, TS)
  ctx.fillStyle = C.hedge2
  ctx.fillRect(px, py, TS, 12)
  for (let i = 0; i < 6; i++) {
    const rx = Math.floor(seeded(x, y, i) * 14)
    const ry = Math.floor(seeded(x, y, i + 5) * 9)
    ctx.fillStyle = C.hedgeHi
    ctx.fillRect(px + rx, py + ry, 2, 1)
  }
  ctx.fillStyle = '#3c5f2e'
  ctx.fillRect(px, py + 14, TS, 2)
}

function trunk(ctx, px, py, x, y) {
  grass(ctx, px, py, x, y, false)
  ctx.fillStyle = C.trunkDark
  ctx.fillRect(px + 5, py + 2, 6, 12)
  ctx.fillStyle = C.trunk
  ctx.fillRect(px + 6, py + 2, 3, 12)
  ctx.fillStyle = 'rgba(31,26,18,0.25)'
  ctx.fillRect(px + 3, py + 13, 10, 2)
}

function bench(ctx, px, py, under) {
  under()
  ctx.fillStyle = C.bench2
  ctx.fillRect(px + 1, py + 5, 14, 7)
  ctx.fillStyle = C.bench1
  ctx.fillRect(px + 1, py + 5, 14, 2)
  ctx.fillRect(px + 1, py + 9, 14, 2)
  ctx.fillStyle = C.ink
  ctx.fillRect(px + 2, py + 12, 2, 3)
  ctx.fillRect(px + 12, py + 12, 2, 3)
}

function lamp(ctx, px, py, under) {
  under()
  ctx.fillStyle = C.metal
  ctx.fillRect(px + 7, py + 3, 2, 11)
  ctx.fillStyle = C.metalHi
  ctx.fillRect(px + 7, py + 3, 1, 11)
  ctx.fillStyle = C.ink
  ctx.fillRect(px + 5, py + 13, 6, 2)
  ctx.fillStyle = C.amber
  ctx.fillRect(px + 5, py + 0, 6, 4)
  ctx.fillStyle = '#f3d99a'
  ctx.fillRect(px + 6, py + 1, 2, 2)
  ctx.fillStyle = C.ink
  ctx.fillRect(px + 5, py + 4, 6, 1)
}

function kiosk(ctx, px, py, under) {
  under()
  ctx.fillStyle = C.trunkDark
  ctx.fillRect(px + 3, py + 6, 2, 9)
  ctx.fillRect(px + 11, py + 6, 2, 9)
  ctx.fillStyle = C.paper
  ctx.fillRect(px + 1, py + 1, 14, 8)
  ctx.fillStyle = C.ink
  ctx.fillRect(px + 1, py + 1, 14, 1)
  ctx.fillRect(px + 1, py + 8, 14, 1)
  ctx.fillRect(px + 1, py + 1, 1, 8)
  ctx.fillRect(px + 14, py + 1, 1, 8)
  ctx.fillStyle = C.amber
  ctx.fillRect(px + 3, py + 3, 6, 1)
  ctx.fillStyle = C.metal
  ctx.fillRect(px + 3, py + 5, 10, 1)
  ctx.fillRect(px + 3, py + 6, 8, 1)
}

// ============================================================
// Static layer baking
// ============================================================
export function bakeStatic(m) {
  const canvas = document.createElement('canvas')
  canvas.width = COLS * TS
  canvas.height = ROWS * TS
  const ctx = canvas.getContext('2d')
  const waterTiles = []
  const canopies = []

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = m[y][x]
      const px = x * TS
      const py = y * TS
      const under = () => {
        if (y <= 6) sidewalk(ctx, px, py, x)
        else if (t === 'B' || t === 'L' || t === 'K') {
          // pick the background the object sits on
          plazaOrGrass(ctx, px, py, x, y, m)
        }
      }
      switch (t) {
        case 'G': grass(ctx, px, py, x, y, false); break
        case 'g': grass(ctx, px, py, x, y, true); break
        case 'P': plaza(ctx, px, py, x, y); break
        case 'S': sidewalk(ctx, px, py, x); break
        case 'R': roof(ctx, px, py); break
        case '#': wall(ctx, px, py, y); break
        case 'w': windowTile(ctx, px, py, y); break
        case 'D': doorTop(ctx, px, py); break
        case 'd': doorBottom(ctx, px, py); break
        case 'M': poster(ctx, px, py, y); break
        case 'W': water(ctx, px, py, x, y); waterTiles.push([x, y]); break
        case 'E': rim(ctx, px, py); break
        case 'H': hedge(ctx, px, py, x, y); break
        case 't': trunk(ctx, px, py, x, y); canopies.push([x, y]); break
        case 'B': bench(ctx, px, py, under); break
        case 'L': lamp(ctx, px, py, under); break
        case 'K': kiosk(ctx, px, py, under); break
      }
    }
  }

  // foreground canopy layer
  const fg = document.createElement('canvas')
  fg.width = canvas.width
  fg.height = canvas.height
  const fctx = fg.getContext('2d')
  for (const [x, y] of canopies) {
    drawCanopy(fctx, x * TS, (y - 1) * TS, x, y)
  }

  return { canvas, fg, waterTiles }

  function plazaOrGrass(ctx2, px, py, x, y, m2) {
    // look at a neighbor to decide base
    const n = m2[y + 1] ? m2[y + 1][x] : 'G'
    if (n === 'P') plaza(ctx2, px, py, x, y)
    else if (n === 'S') sidewalk(ctx2, px, py, x)
    else grass(ctx2, px, py, x, y, false)
  }
}

function drawCanopy(ctx, px, py, sx, sy) {
  // 2-tile tall round canopy centered on trunk tile
  const blob = [
    '....llll....',
    '..llllllll..',
    '.llhhllllll.',
    'llhhllllllll',
    'llllllllllll',
    'llllllllddll',
    '.llllddddll.',
    '..lldddd1l..',
    '...111111...'
  ]
  const colors = { l: C.leaf2, h: C.leafHi, d: C.leaf1, 1: '#3c6b35' }
  const ox = px + 2 - TS / 2 + 2
  for (let y = 0; y < blob.length; y++) {
    for (let x = 0; x < blob[y].length; x++) {
      const ch = blob[y][x]
      if (ch === '.') continue
      ctx.fillStyle = colors[ch]
      // scale each cell 2x2 px for a chunky canopy ~24px wide
      ctx.fillRect(ox + x * 2 - 4, py + y * 2 - 2, 2, 2)
    }
  }
}

// animated water highlights (drawn over static each frame)
export function drawWaterAnim(ctx, waterTiles, time, ox, oy) {
  const phase = Math.floor(time / 450)
  ctx.fillStyle = C.waterHi
  for (const [x, y] of waterTiles) {
    const r = seeded(x, y, phase % 4)
    if (r > 0.72) {
      const hx = x * TS + 3 + Math.floor(seeded(x, y, phase + 1) * 9)
      const hy = y * TS + 3 + Math.floor(seeded(x, y, phase + 2) * 9)
      ctx.fillRect(hx - ox, hy - oy, 3, 1)
      ctx.fillRect(hx - ox + 1, hy - oy + 1, 1, 1)
    }
  }
}

// "!" hotspot marker
export function drawMarker(ctx, px, py, time) {
  const bob = Math.floor(time / 400) % 2
  const y = py - 14 + bob
  ctx.fillStyle = C.paper
  ctx.fillRect(px + 4, y, 8, 10)
  ctx.fillStyle = C.ink
  ctx.fillRect(px + 4, y, 8, 1)
  ctx.fillRect(px + 4, y + 9, 8, 1)
  ctx.fillRect(px + 3, y + 1, 1, 8)
  ctx.fillRect(px + 12, y + 1, 1, 8)
  ctx.fillStyle = C.amber
  ctx.fillRect(px + 7, y + 2, 2, 4)
  ctx.fillRect(px + 7, y + 7, 2, 1)
}
