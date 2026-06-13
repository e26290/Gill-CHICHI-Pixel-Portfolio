<template>
  <div class="stage">
    <canvas ref="gameCanvas" class="game-canvas"></canvas>

    <!-- ===== logo ===== -->
    <div class="logo">
      <div class="logo-top">{{ tt.logoTop }}</div>
      <div class="logo-sub">— {{ tt.logoSub }} —</div>
    </div>

    <!-- ===== top nav ===== -->
    <nav class="topnav">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="px-btn"
        :class="{ 'is-active': openSection === item.id }"
        @click="openModal(item.id)"
      >
        {{ tt.nav[item.id] }}
      </button>
    </nav>

    <!-- ===== minimap ===== -->
    <div class="minimap px-frame">
      <canvas ref="miniCanvas" width="132" height="84"></canvas>
    </div>

    <!-- ===== bottom-right controls ===== -->
    <div class="bottombar">
      <button class="px-btn" @click="toggleFullscreen">{{ tt.hud.fullscreen }}</button>
      <button class="px-btn" @click="openMap">{{ tt.hud.map }}</button>
      <button class="px-btn" @click="openModal('hood')">{{ tt.hud.hood }}</button>
      <button class="px-btn lang-btn" @click="onToggleLang">{{ tt.hud.lang }}</button>
    </div>

    <!-- ===== movement hint ===== -->
    <div class="hint" v-if="!introOpen">{{ tt.hud.hint }}</div>

    <!-- ===== touch D-pad ===== -->
    <div class="dpad" aria-hidden="true">
      <button
        v-for="d in dpadDirs"
        :key="d.dir"
        class="dpad-btn"
        :style="{ gridArea: d.area }"
        @pointerdown.prevent="press(d.dir)"
        @pointerup.prevent="release(d.dir)"
        @pointerleave="release(d.dir)"
        @pointercancel="release(d.dir)"
      >
        {{ d.glyph }}
      </button>
    </div>

    <!-- ===== intro ===== -->
    <transition name="pop">
      <div v-if="introOpen" class="overlay" @click.self="closeIntro">
        <div class="px-panel modal intro">
          <h1>{{ tt.intro.title }}</h1>
          <p class="intro-body">{{ tt.intro.body }}</p>
          <div class="modal-actions">
            <button class="px-btn" @click="closeIntro">{{ tt.intro.start }} →</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== section modal ===== -->
    <transition name="pop">
      <div v-if="openSection" class="overlay" @click.self="closeModal">
        <div class="px-panel modal">
          <div class="modal-head">
            <h2>{{ sectionData.title }}</h2>
            <button class="px-btn close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <p v-for="(line, i) in sectionData.body" :key="i">{{ line }}</p>
          </div>
          <div class="modal-actions">
            <button class="px-btn" @click="closeModal">{{ tt.close }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== full map overlay ===== -->
    <transition name="pop">
      <div v-if="mapOpen" class="overlay" @click.self="closeMap">
        <div class="px-panel modal map-modal">
          <div class="modal-head">
            <h2>{{ tt.sections.map.title }}</h2>
            <button class="px-btn close-btn" @click="closeMap">✕</button>
          </div>
          <canvas ref="fullMapCanvas" class="fullmap" width="660" height="420"></canvas>
          <div class="modal-actions">
            <button class="px-btn" @click="closeMap">{{ tt.close }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Game } from './game/engine.js'
import { state, t, toggleLang } from './i18n.js'

const gameCanvas = ref(null)
const miniCanvas = ref(null)
const fullMapCanvas = ref(null)

const introOpen = ref(true)
const openSection = ref(null)
const mapOpen = ref(false)

const tt = computed(() => t())
// keep reactivity on lang switch
watch(() => state.lang, () => {})

const navItems = [
  { id: 'about' },
  { id: 'cv' },
  { id: 'projects' },
  { id: 'tech' },
  { id: 'memo' },
  { id: 'contact' }
]

const dpadDirs = [
  { dir: 'up', area: 'up', glyph: '▲' },
  { dir: 'left', area: 'left', glyph: '◀' },
  { dir: 'down', area: 'down', glyph: '▼' },
  { dir: 'right', area: 'right', glyph: '▶' }
]

const sectionData = computed(() => {
  if (!openSection.value) return { title: '', body: [] }
  return tt.value.sections[openSection.value] || { title: '', body: [] }
})

let game = null
let miniTimer = null

function openModal(id) {
  openSection.value = id
}
function closeModal() {
  openSection.value = null
}
function openMap() {
  mapOpen.value = true
  nextTick(() => {
    if (game && fullMapCanvas.value) {
      const c = fullMapCanvas.value
      game.drawFullMap(c.getContext('2d'), c.width, c.height)
    }
  })
}
function closeMap() {
  mapOpen.value = false
}
function closeIntro() {
  introOpen.value = false
}
function onToggleLang() {
  toggleLang()
}
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
function press(dir) {
  game?.press(dir)
}
function release(dir) {
  game?.release(dir)
}

const anyOverlay = computed(() => introOpen.value || !!openSection.value || mapOpen.value)
watch(anyOverlay, (v) => {
  if (game) game.paused = v
})

function onResize() {
  game?.resize()
}
function onEsc(e) {
  if (e.key === 'Escape') {
    if (openSection.value) closeModal()
    else if (mapOpen.value) closeMap()
  }
}

onMounted(() => {
  game = new Game(gameCanvas.value, {
    onHotspot: (id) => {
      openSection.value = id
    }
  })
  game.paused = true // intro is open
  game.start()

  miniTimer = setInterval(() => {
    if (miniCanvas.value && game) {
      const c = miniCanvas.value
      game.drawMinimap(c.getContext('2d'), c.width, c.height)
    }
  }, 200)

  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  game?.stop()
  clearInterval(miniTimer)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onEsc)
})
</script>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* ===== logo ===== */
.logo {
  position: absolute;
  top: 18px;
  left: 22px;
  color: var(--paper);
  text-shadow:
    2px 0 0 var(--ink), -2px 0 0 var(--ink),
    0 2px 0 var(--ink), 0 -2px 0 var(--ink),
    2px 2px 0 var(--ink), -2px -2px 0 var(--ink),
    2px -2px 0 var(--ink), -2px 2px 0 var(--ink),
    4px 5px 0 var(--shadow);
  pointer-events: none;
}
.logo-top {
  font-size: 30px;
  letter-spacing: 3px;
  line-height: 1;
}
.logo-sub {
  font-size: 12px;
  letter-spacing: 2px;
  margin-top: 6px;
  color: var(--amber);
}

/* ===== top nav ===== */
.topnav {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: min(72vw, 880px);
}

/* ===== minimap ===== */
.minimap {
  position: absolute;
  left: 18px;
  bottom: 18px;
  background: var(--paper);
  padding: 6px;
  box-shadow:
    0 -4px 0 0 var(--ink),
    0 4px 0 0 var(--ink),
    -4px 0 0 0 var(--ink),
    4px 0 0 0 var(--ink),
    6px 8px 0 0 var(--shadow);
}
.minimap canvas {
  display: block;
  background: var(--ink);
}

/* ===== bottom controls ===== */
.bottombar {
  position: absolute;
  right: 18px;
  bottom: 18px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.lang-btn {
  background: var(--amber);
}

/* ===== hint ===== */
.hint {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--paper);
  text-shadow:
    1px 0 0 var(--ink), -1px 0 0 var(--ink),
    0 1px 0 var(--ink), 0 -1px 0 var(--ink),
    2px 2px 0 var(--shadow);
  pointer-events: none;
  white-space: nowrap;
}

/* ===== D-pad (touch only) ===== */
.dpad {
  position: absolute;
  left: 22px;
  bottom: 130px;
  display: none;
  grid-template-areas:
    '. up .'
    'left down right';
  gap: 8px;
}
.dpad-btn {
  width: 52px;
  height: 52px;
  font-size: 18px;
  background: var(--paper);
  border: none;
  color: var(--ink);
  box-shadow:
    0 -3px 0 0 var(--ink),
    0 3px 0 0 var(--ink),
    -3px 0 0 0 var(--ink),
    3px 0 0 0 var(--ink),
    3px 4px 0 0 var(--shadow);
  touch-action: none;
}
.dpad-btn:active {
  background: var(--amber);
  transform: translate(2px, 2px);
}
@media (pointer: coarse) {
  .dpad {
    display: grid;
  }
}

/* ===== overlays / modals ===== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(31, 26, 18, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  z-index: 20;
}

.modal {
  max-width: 620px;
  width: 100%;
  max-height: calc(100vh - 90px);
  overflow: auto;
  padding: 26px 28px;
}

.modal h1 {
  font-size: 24px;
  letter-spacing: 2px;
  margin-bottom: 14px;
}
.modal h2 {
  font-size: 20px;
  letter-spacing: 2px;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--ink);
}

.close-btn {
  font-size: 13px;
  padding: 4px 9px 5px;
}

.modal-body p {
  font-size: 15px;
  line-height: 1.75;
  margin-bottom: 12px;
  white-space: pre-wrap;
}
.modal-body p::before {
  content: '▸ ';
  color: var(--amber-deep);
}

.intro h1 {
  color: var(--amber-deep);
}
.intro-body {
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 8px;
}

.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.map-modal {
  max-width: 760px;
}
.fullmap {
  width: 100%;
  height: auto;
  display: block;
  background: var(--ink);
  box-shadow: 0 0 0 3px var(--ink);
}

/* ===== transitions ===== */
.pop-enter-active {
  animation: pop-in 0.16s steps(3);
}
.pop-leave-active {
  animation: pop-in 0.12s steps(2) reverse;
}
@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== small screens ===== */
@media (max-width: 860px) {
  .logo-top { font-size: 22px; }
  .topnav { gap: 8px; max-width: 64vw; }
  .px-btn { font-size: 12px; padding: 5px 9px 6px; }
  .hint { display: none; }
  .minimap canvas { width: 96px; height: 61px; }
}
</style>
