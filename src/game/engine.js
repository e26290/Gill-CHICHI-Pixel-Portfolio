// ============================================================
// engine.js — tiny canvas pixel engine
// grid movement + camera follow + trail-following cat + NPCs
// ============================================================
import {
  TS, COLS, ROWS,
  buildMap, isSolid, bakeStatic, drawWaterAnim, drawMarker
} from './map.js'
import {
  HUMAN_FRAMES, CAT_FRAMES, PLAYER_PAL, CAT_PAL, NPC_PALS, bakeActor
} from './sprites.js'

const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
}

class Actor {
  constructor(x, y, frames, speed) {
    this.x = x // tile coords
    this.y = y
    this.px = x * TS // pixel coords (interpolated)
    this.py = y * TS
    this.dir = 'down'
    this.moving = false
    this.frames = frames
    this.speed = speed // tiles per second
    this.animT = 0
  }

  startMove(dir, map) {
    if (this.moving) return false
    this.dir = dir
    const [dx, dy] = DIRS[dir]
    const nx = this.x + dx
    const ny = this.y + dy
    if (isSolid(map, nx, ny)) return false
    this.tx = nx
    this.ty = ny
    this.moving = true
    this.progress = 0
    return true
  }

  update(dt) {
    this.animT += dt
    if (!this.moving) return
    this.progress += dt * this.speed
    if (this.progress >= 1) {
      this.x = this.tx
      this.y = this.ty
      this.px = this.x * TS
      this.py = this.y * TS
      this.moving = false
    } else {
      const [dx, dy] = DIRS[this.dir]
      this.px = (this.x + dx * this.progress) * TS
      this.py = (this.y + dy * this.progress) * TS
    }
  }

  frame() {
    const set = this.frames[this.dir]
    if (!this.moving) return set[0]
    return set[Math.floor(this.animT * 7) % set.length]
  }
}

export class Game {
  constructor(canvas, { onHotspot } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onHotspot = onHotspot || (() => {})
    this.paused = false
    this.keys = new Set()
    this.time = 0
    this.lastHotspot = null

    const { m, hotspots } = buildMap()
    this.map = m
    this.hotspots = hotspots
    const baked = bakeStatic(m)
    this.static = baked.canvas
    this.fg = baked.fg
    this.waterTiles = baked.waterTiles

    // actors
    this.player = new Actor(20, 12, bakeActor(HUMAN_FRAMES, PLAYER_PAL), 5.2)
    this.cat = new Actor(20, 13, bakeActor(CAT_FRAMES, CAT_PAL), 5.2)
    this.trail = [] // tiles the player has left, cat follows

    this.npcs = NPC_PALS.map((pal, i) => {
      const spots = [
        [25, 9], [33, 13], [18, 18], [38, 17]
      ]
      const a = new Actor(spots[i][0], spots[i][1], bakeActor(HUMAN_FRAMES, pal), 2.2)
      a.thinkT = Math.random() * 2
      return a
    })

    // ducks on the pond (simple bobbing dots drawn manually)
    this.ducks = [
      { x: 6.5, y: 17.5, t: 0 },
      { x: 9.2, y: 19.8, t: 2 }
    ]

    this._onKeyDown = (e) => {
      const k = this.normKey(e.key)
      if (k) {
        this.keys.add(k)
        e.preventDefault()
      }
    }
    this._onKeyUp = (e) => {
      const k = this.normKey(e.key)
      if (k) this.keys.delete(k)
    }
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)

    this._raf = null
    this._last = performance.now()
    this.resize()
  }

  normKey(key) {
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': return 'up'
      case 'ArrowDown': case 's': case 'S': return 'down'
      case 'ArrowLeft': case 'a': case 'A': return 'left'
      case 'ArrowRight': case 'd': case 'D': return 'right'
      default: return null
    }
  }

  // D-pad support (touch UI)
  press(dir) { this.keys.add(dir) }
  release(dir) { this.keys.delete(dir) }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    // zoom: aim for ~13 tiles of visible height
    this.zoom = Math.max(2, Math.round(this.canvas.height / (TS * 13)))
    this.ctx.imageSmoothingEnabled = false
  }

  start() {
    if (this._raf) return
    this._last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this._last) / 1000)
      this._last = now
      this.time = now
      if (!this.paused) this.update(dt)
      this.render()
      this._raf = requestAnimationFrame(loop)
    }
    this._raf = requestAnimationFrame(loop)
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf)
    this._raf = null
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
  }

  update(dt) {
    const p = this.player

    // player input
    if (!p.moving) {
      let dir = null
      for (const d of ['up', 'down', 'left', 'right']) {
        if (this.keys.has(d)) { dir = d; break }
      }
      if (dir) {
        const from = [p.x, p.y]
        if (p.startMove(dir, this.map)) {
          this.trail.push(from)
          if (this.trail.length > 6) this.trail.shift()
        } else {
          p.dir = dir // face the wall anyway
        }
      }
    }
    p.update(dt)

    // cat follows the trail, staying ~1 tile behind
    const c = this.cat
    if (!c.moving && this.trail.length) {
      const [tx, ty] = this.trail[0]
      if (c.x === tx && c.y === ty) {
        this.trail.shift()
      } else {
        const dx = tx - c.x
        const dy = ty - c.y
        let dir = null
        if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left'
        else if (dy !== 0) dir = dy > 0 ? 'down' : 'up'
        else if (dx !== 0) dir = dx > 0 ? 'right' : 'left'
        if (dir) {
          if (!c.startMove(dir, this.map)) this.trail.shift()
        }
      }
    }
    c.update(dt)

    // NPCs wander
    for (const n of this.npcs) {
      n.thinkT -= dt
      if (!n.moving && n.thinkT <= 0) {
        n.thinkT = 0.8 + Math.random() * 2.2
        const dirs = ['up', 'down', 'left', 'right']
        const dir = dirs[Math.floor(Math.random() * 4)]
        // keep NPCs out of the player's exact tile
        const [dx, dy] = DIRS[dir]
        const nx = n.x + dx
        const ny = n.y + dy
        const occupied =
          (nx === p.x && ny === p.y) ||
          this.npcs.some((o) => o !== n && o.x === nx && o.y === ny)
        if (!occupied) n.startMove(dir, this.map)
      }
      n.update(dt)
    }

    // ducks paddle in tiny circles
    for (const d of this.ducks) {
      d.t += dt
    }

    // hotspot trigger
    const hs = this.hotspots.find((h) => h.x === p.x && h.y === p.y && !p.moving)
    if (hs) {
      if (this.lastHotspot !== hs.id) {
        this.lastHotspot = hs.id
        this.onHotspot(hs.id)
      }
    } else if (!p.moving) {
      this.lastHotspot = null
    }
  }

  cameraOrigin() {
    const viewW = this.canvas.width / this.zoom
    const viewH = this.canvas.height / this.zoom
    const cx = this.player.px + TS / 2 - viewW / 2
    const cy = this.player.py + TS / 2 - viewH / 2
    const maxX = COLS * TS - viewW
    const maxY = ROWS * TS - viewH
    return [
      Math.max(0, Math.min(maxX, cx)),
      Math.max(0, Math.min(maxY, cy))
    ]
  }

  render() {
    const { ctx, canvas, zoom } = this
    const [ox, oy] = this.cameraOrigin()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#1f1a12'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0)
    ctx.imageSmoothingEnabled = false

    // static world
    ctx.drawImage(this.static, -Math.round(ox), -Math.round(oy))

    // water sparkles
    drawWaterAnim(ctx, this.waterTiles, this.time, Math.round(ox), Math.round(oy))

    // ducks
    for (const d of this.ducks) {
      const dx = d.x * TS + Math.cos(d.t * 0.8) * 6 - ox
      const dy = d.y * TS + Math.sin(d.t * 0.8) * 4 - oy
      ctx.fillStyle = '#6e5a3c'
      ctx.fillRect(Math.round(dx), Math.round(dy), 6, 4)
      ctx.fillStyle = '#3e6e63'
      ctx.fillRect(Math.round(dx) + 4, Math.round(dy) - 2, 3, 3)
      ctx.fillStyle = '#d4a248'
      ctx.fillRect(Math.round(dx) + 7, Math.round(dy) - 1, 2, 1)
    }

    // hotspot markers
    for (const h of this.hotspots) {
      drawMarker(ctx, h.x * TS - ox, h.y * TS - oy, this.time)
    }

    // entities sorted by y for depth
    const ents = [this.cat, this.player, ...this.npcs]
    ents.sort((a, b) => a.py - b.py)
    for (const e of ents) {
      ctx.drawImage(e.frame(), Math.round(e.px - ox), Math.round(e.py - oy))
    }

    // foreground canopies
    ctx.drawImage(this.fg, -Math.round(ox), -Math.round(oy))
  }

  // ---- minimap ----
  drawMinimap(mctx, w, h) {
    mctx.imageSmoothingEnabled = false
    mctx.clearRect(0, 0, w, h)
    mctx.drawImage(this.static, 0, 0, COLS * TS, ROWS * TS, 0, 0, w, h)
    const sx = w / (COLS * TS)
    const sy = h / (ROWS * TS)
    // hotspots
    mctx.fillStyle = '#e84a3c'
    for (const hs of this.hotspots) {
      mctx.fillRect(Math.round(hs.x * TS * sx) - 1, Math.round(hs.y * TS * sy) - 1, 3, 3)
    }
    // player
    mctx.fillStyle = '#ffffff'
    mctx.fillRect(Math.round(this.player.px * sx) - 2, Math.round(this.player.py * sy) - 2, 5, 5)
    mctx.fillStyle = '#d4a248'
    mctx.fillRect(Math.round(this.player.px * sx) - 1, Math.round(this.player.py * sy) - 1, 3, 3)
  }

  // full-map render (for MAP overlay)
  drawFullMap(mctx, w, h) {
    mctx.imageSmoothingEnabled = false
    mctx.clearRect(0, 0, w, h)
    const scale = Math.min(w / (COLS * TS), h / (ROWS * TS))
    const dw = COLS * TS * scale
    const dh = ROWS * TS * scale
    const dx = (w - dw) / 2
    const dy = (h - dh) / 2
    mctx.drawImage(this.static, dx, dy, dw, dh)
    mctx.fillStyle = '#e84a3c'
    for (const hs of this.hotspots) {
      mctx.fillRect(dx + hs.x * TS * scale - 2, dy + hs.y * TS * scale - 2, 5, 5)
    }
    mctx.fillStyle = '#ffffff'
    mctx.fillRect(dx + this.player.px * scale - 3, dy + this.player.py * scale - 3, 7, 7)
    mctx.fillStyle = '#d4a248'
    mctx.fillRect(dx + this.player.px * scale - 1, dy + this.player.py * scale - 1, 4, 4)
  }
}
