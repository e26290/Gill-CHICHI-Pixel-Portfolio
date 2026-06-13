// ============================================================
// sprites.js — original pixel art, defined as 16x16 char grids.
// Each char maps to a palette color; '.' is transparent.
// ============================================================

// ---------- palettes ----------
export const PLAYER_PAL = {
  h: '#2a2320', // hair (ink-dark)
  s: '#eebd96', // skin
  e: '#1f1a12', // eyes
  j: '#1f1a12', // jacket (ink black)
  a: '#d4a248', // scarf (amber)
  p: '#4a4038', // pants
  b: '#2a2320', // boots
  w: '#f5f1e8' // highlight
}

export const CAT_PAL = {
  k: '#1f1a12', // black fur
  w: '#ffffff', // white fur
  a: '#d4a248', // amber eyes
  n: '#e89ba0', // pink nose
  d: '#c9c2b4' // shadow line
}

// NPC palette swaps (same body, different outfits)
export const NPC_PALS = [
  { ...PLAYER_PAL, h: '#6b4a2f', j: '#5e7d5a', a: '#5e7d5a', p: '#3c4a5a', s: '#e8b08a' },
  { ...PLAYER_PAL, h: '#d8c9a8', j: '#8a5a6a', a: '#8a5a6a', p: '#2f2a3a', s: '#f0c8a0' },
  { ...PLAYER_PAL, h: '#1f1a12', j: '#46698c', a: '#46698c', p: '#4a4038', s: '#d9a06e' },
  { ...PLAYER_PAL, h: '#8c5a3c', j: '#c98a4b', a: '#c98a4b', p: '#5a5248', s: '#eebd96' }
]

// ---------- humanoid frames (16x16) ----------
// facing DOWN, standing
const H_DOWN_0 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....ssssss.....',
  '.....sessse.....',
  '.....ssssss.....',
  '......ssss......',
  '.....jjjjjj.....',
  '....jjaaaajj....',
  '....jjjjjjjj....',
  '....s.jjjj.s....',
  '......pppp......',
  '......p..p......',
  '......b..b......',
  '................'
]
// facing DOWN, walking (legs apart)
const H_DOWN_1 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....ssssss.....',
  '.....sessse.....',
  '.....ssssss.....',
  '......ssss......',
  '.....jjjjjj.....',
  '....jjaaaajj....',
  '....jjjjjjjj....',
  '....s.jjjj.s....',
  '......pppp......',
  '.....p....p.....',
  '.....b....b.....',
  '................'
]
// facing UP
const H_UP_0 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....shhhhs.....',
  '......ssss......',
  '.....jjjjjj.....',
  '....jjjjjjjj....',
  '....jjjjjjjj....',
  '....s.jjjj.s....',
  '......pppp......',
  '......p..p......',
  '......b..b......',
  '................'
]
const H_UP_1 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....shhhhs.....',
  '......ssss......',
  '.....jjjjjj.....',
  '....jjjjjjjj....',
  '....jjjjjjjj....',
  '....s.jjjj.s....',
  '......pppp......',
  '.....p....p.....',
  '.....b....b.....',
  '................'
]
// facing LEFT
const H_SIDE_0 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....ssssss.....',
  '.....essshh.....',
  '.....ssssss.....',
  '......ssss......',
  '.....jjjjjj.....',
  '.....jaaajj.....',
  '.....jjjjjj.....',
  '.....s.jj.......',
  '......pppp......',
  '......p.p.......',
  '......b.b.......',
  '................'
]
const H_SIDE_1 = [
  '................',
  '......hhhh......',
  '.....hhhhhh.....',
  '.....hhhhhh.....',
  '.....ssssss.....',
  '.....essshh.....',
  '.....ssssss.....',
  '......ssss......',
  '.....jjjjjj.....',
  '.....jaaajj.....',
  '.....jjjjjj.....',
  '.....s.jj.......',
  '......pppp......',
  '.....p...p......',
  '.....b...b......',
  '................'
]

export const HUMAN_FRAMES = {
  down: [H_DOWN_0, H_DOWN_1],
  up: [H_UP_0, H_UP_1],
  left: [H_SIDE_0, H_SIDE_1]
  // right = mirrored left, generated at bake time
}

// ---------- cat frames (16x16, bicolor tuxedo) ----------
// facing LEFT
const CAT_SIDE_0 = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '...kk.kk........',
  '...kkkkk....k...',
  '...akwkk...kk...',
  '...kwnkkkkkk....',
  '....kkkkkkkk....',
  '....wkkkkkkk....',
  '....wwkkkkkk....',
  '....kkkkkkkk....',
  '....k..k.k..k...',
  '....w..w.k..k...',
  '................'
]
const CAT_SIDE_1 = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '...kk.kk....k...',
  '...kkkkk...k....',
  '...akwkk..kk....',
  '...kwnkkkkkk....',
  '....kkkkkkkk....',
  '....wkkkkkkk....',
  '....wwkkkkkk....',
  '....kkkkkkkk....',
  '...k..k...k.k...',
  '...w..w...k.k...',
  '................'
]
// facing DOWN (sitting-ish walk)
const CAT_DOWN_0 = [
  '................',
  '................',
  '................',
  '................',
  '.....kk.kk......',
  '.....kkkkk......',
  '.....akkka......',
  '.....kwnwk......',
  '.....kwwwk......',
  '.....kkkkk......',
  '.....kwwwk......',
  '.....kwwwk......',
  '.....kkkkk......',
  '.....k...k......',
  '.....w...w......',
  '................'
]
const CAT_DOWN_1 = [
  '................',
  '................',
  '................',
  '................',
  '.....kk.kk......',
  '.....kkkkk......',
  '.....akkka......',
  '.....kwnwk......',
  '.....kwwwk......',
  '.....kkkkk......',
  '.....kwwwk......',
  '.....kwwwk......',
  '.....kkkkk......',
  '....k.....k.....',
  '....w.....w.....',
  '................'
]
const CAT_UP_0 = [
  '................',
  '................',
  '................',
  '................',
  '.....kk.kk......',
  '.....kkkkk......',
  '.....kkkkk......',
  '.....kkkkk..k...',
  '.....kkkkk..k...',
  '.....kkkkkkkk...',
  '.....kkkkk......',
  '.....kkkkk......',
  '.....kkkkk......',
  '.....k...k......',
  '.....w...w......',
  '................'
]

export const CAT_FRAMES = {
  down: [CAT_DOWN_0, CAT_DOWN_1],
  up: [CAT_UP_0, CAT_UP_0],
  left: [CAT_SIDE_0, CAT_SIDE_1]
}

// ---------- baking ----------
function bakeFrame(grid, pal) {
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 16
  const ctx = c.getContext('2d')
  for (let y = 0; y < 16; y++) {
    const row = grid[y] || ''
    for (let x = 0; x < 16; x++) {
      const ch = row[x]
      if (!ch || ch === '.') continue
      const col = pal[ch]
      if (!col) continue
      ctx.fillStyle = col
      ctx.fillRect(x, y, 1, 1)
    }
  }
  return c
}

function mirror(canvas) {
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 16
  const ctx = c.getContext('2d')
  ctx.translate(16, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(canvas, 0, 0)
  return c
}

// Returns { down:[c,c], up:[c,c], left:[c,c], right:[c,c] }
export function bakeActor(frames, pal) {
  const out = {}
  for (const dir of ['down', 'up', 'left']) {
    out[dir] = frames[dir].map((g) => bakeFrame(g, pal))
  }
  out.right = out.left.map(mirror)
  return out
}
