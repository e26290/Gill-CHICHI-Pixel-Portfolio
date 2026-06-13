// ============================================================
// i18n.js — all on-screen text lives here. Edit freely.
// ============================================================
import { reactive } from 'vue'

export const state = reactive({ lang: 'zh' })

export function toggleLang() {
  state.lang = state.lang === 'zh' ? 'en' : 'zh'
}

const dict = {
  zh: {
    logoTop: 'GILL WUUU',
    logoSub: 'CHICHI · PORTFOLIO',
    nav: {
      about: '關於我',
      cv: '履歷',
      projects: '任務',
      tech: '技術',
      memo: '#memo',
      contact: '聯絡'
    },
    hud: {
      map: '地圖',
      hood: '引擎室',
      lang: 'EN',
      fullscreen: '[ ]',
      hint: '↑↓←→ / WASD 移動 · 走到「!」標記開啟內容'
    },
    intro: {
      title: '魔法重現的時代',
      body: '我與我的 ½，繼續設計。\n\n用方向鍵或 WASD 在小鎮裡走走——小小吉會跟著你。走到驚嘆號標記，就能打開對應的內容；也可以直接點上方選單。',
      start: '出發'
    },
    sections: {
      about: {
        title: '關於我',
        body: [
          '我是 Gill，台灣的資深 UI/UX 設計師，獨立接案中。',
          '工作範圍涵蓋 UI/UX、AI 應用、品牌與網站設計。我相信「創意，始於計畫」——結構與意圖先行，執行才有方向。',
          '旁邊這位是小小吉（Chichi），賓士貓琥珀金來自他的眼睛，粉色來自他的鼻子。'
        ]
      },
      cv: {
        title: '履歷',
        body: [
          '【現在】獨立設計師 · Onwards Studio — UI/UX / 品牌 / 網站',
          '【近期】車險 e 化報價系統 — Figma 設計系統重構、元件庫建置（Vite + Vue 3）',
          '【專長】設計系統 · Variables/Tokens 架構 · RWD · 介面動效 · AI 工作流',
          '完整履歷請透過「聯絡」索取 PDF。'
        ]
      },
      projects: {
        title: '任務（Quests）',
        body: [
          '✦ 第一章 · 報價的魔法陣 — 金融保險系統的設計系統重構：三層 Variables（Base → Functional → RWD），雙模式前後台。',
          '✦ 第二章 · Onwards — 個人品牌與作品集網站：與一隻貓共同署名的設計實驗。',
          '✦ 第三章 · 進行中 — 更多任務記錄將依年份逐步解鎖。'
        ]
      },
      tech: {
        title: '技術',
        body: [
          '設計：Figma（Variables · 元件庫 · MCP 整合）',
          '前端：Vite · Vue 3 · JavaScript · CSS',
          '佈署：Cloudflare · Vercel',
          'AI：Claude · 生成式工作流',
          '本站：Canvas 像素引擎，無任何外部美術素材，全部由程式繪製。'
        ]
      },
      memo: {
        title: '#memo',
        body: [
          '「創意，始於計畫。」— 水野學',
          '抽象的文字遊戲不會生出好設計；落地、具體、來自真實生活的世界觀才會。',
          '森林光、季節感、編輯排版、貓的尾巴：這些是我的素材庫。'
        ]
      },
      contact: {
        title: '聯絡',
        body: [
          '信箱：hi@onwards.tw',
          '網域：onwards.tw',
          '合作邀約、案件洽詢、或只是想看貓照片，都歡迎來信。'
        ]
      },
      hood: {
        title: '引擎室（Under the Hood）',
        body: [
          '這個網站是一個小小的像素遊戲引擎：',
          '· Vite + Vue 3（Composition API, JS）',
          '· Canvas 2D：磁磚地圖、相機跟隨、碰撞、NPC 漫遊',
          '· 所有圖像皆以程式逐像素繪製，零圖片資源',
          '· 角色身後的貓：跟隨玩家足跡的路徑佇列',
          '· 介面：CSS box-shadow 拼出的像素邊框'
        ]
      },
      map: { title: '小鎮地圖' }
    },
    close: '關閉'
  },

  en: {
    logoTop: 'GILL WUUU',
    logoSub: 'CHICHI · PORTFOLIO',
    nav: {
      about: 'About me',
      cv: 'CV',
      projects: 'Quests',
      tech: 'Technologies',
      memo: '#memo',
      contact: 'Contact'
    },
    hud: {
      map: 'MAP',
      hood: 'Under the Hood',
      lang: '中',
      fullscreen: '[ ]',
      hint: 'Move with ↑↓←→ / WASD · step on “!” markers to open sections'
    },
    intro: {
      title: 'An age where magic returns',
      body: 'Me and my ½, designing onwards.\n\nWalk around the little town with arrow keys or WASD — CHICHI will follow you. Step on an exclamation marker to open that section, or just use the menu above.',
      start: 'Onwards!'
    },
    sections: {
      about: {
        title: 'About me',
        body: [
          'I am Gill, a senior UI/UX designer based in Taiwan, working independently.',
          'My work spans UI/UX, AI applications, branding and web design. I believe creativity begins with planning — structure and intent come before execution.',
          'The one beside me is CHICHI, a bicolor cat and the other half of this site. The amber comes from his eyes; the pink from his nose.'
        ]
      },
      cv: {
        title: 'CV',
        body: [
          '[Now] Independent designer · Onwards Studio — UI/UX / branding / web',
          '[Recent] Car-insurance e-quote system — Figma design-system rebuild and component library (Vite + Vue 3)',
          '[Focus] Design systems · variable/token architecture · RWD · motion · AI workflows',
          'Ask for the full PDF via Contact.'
        ]
      },
      projects: {
        title: 'Quests',
        body: [
          '✦ Chapter 1 · The Quotation Circle — design-system rebuild for an insurance platform: three-layer variables (Base → Functional → RWD), dual front/back-office modes.',
          '✦ Chapter 2 · Onwards — personal brand and portfolio site, co-signed with a cat.',
          '✦ Chapter 3 · In progress — more quests unlock year by year.'
        ]
      },
      tech: {
        title: 'Technologies',
        body: [
          'Design: Figma (variables · libraries · MCP integration)',
          'Front-end: Vite · Vue 3 · JavaScript · CSS',
          'Infra: Cloudflare · Vercel',
          'AI: Claude · generative workflows',
          'This site: a canvas pixel engine — every sprite is drawn by code, no image assets.'
        ]
      },
      memo: {
        title: '#memo',
        body: [
          '“Creativity begins with planning.” — Manabu Mizuno',
          'Vague word games never produce good design; grounded, concrete world-building from real life does.',
          'Forest light, seasons, editorial layout, a cat’s tail: that is my material library.'
        ]
      },
      contact: {
        title: 'Contact',
        body: [
          'Mail: hi@onwards.tw',
          'Domain: onwards.tw',
          'Collaboration, project inquiries, or cat photos — all welcome.'
        ]
      },
      hood: {
        title: 'Under the Hood',
        body: [
          'This site is a tiny pixel game engine:',
          '· Vite + Vue 3 (Composition API, JS)',
          '· Canvas 2D: tile map, camera follow, collision, wandering NPCs',
          '· Every sprite is drawn pixel-by-pixel in code — zero image assets',
          '· The cat behind you: a trail queue following the player’s footsteps',
          '· UI: pixel borders built from CSS box-shadows'
        ]
      },
      map: { title: 'Town map' }
    },
    close: 'Close'
  }
}

export function t() {
  return dict[state.lang]
}
