# Onwards — Pixel Portfolio (Vite + Vue 3 + JS)

一個「可遊玩」的像素風作品集網站：用方向鍵在小鎮裡走動，走到 `!` 標記即開啟對應內容；小小吉（賓士貓）會跟在你身後。所有圖像皆由程式逐像素繪製，**零圖片資源、零外部美術素材**。

> 設計概念與機制（可行走世界、選單對應場景熱點、小地圖、語言切換）參考了「遊戲式作品集」這個類型；美術、地圖、角色、文案皆為原創，並套用 Onwards 品牌色：紙白 `#F5F1E8`、墨黑 `#1F1A12`、琥珀金 `#D4A248`、粉 `#E89BA0`。

## 快速開始

```bash
npm install
npm run dev      # 開發模式 http://localhost:5173
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 操作

| 操作 | 方式 |
| --- | --- |
| 移動 | ↑↓←→ 或 WASD（手機顯示虛擬十字鍵） |
| 開啟內容 | 走到 `!` 標記，或點上方選單 |
| 地圖 | 右下「地圖 / MAP」 |
| 全螢幕 | 右下 `[ ]` |
| 語言 | 右下 EN / 中 切換 |
| 關閉視窗 | ✕、關閉按鈕或 Esc |

## 專案結構

```
src/
  App.vue            # HUD、彈窗、小地圖、D-pad（Vue 層）
  i18n.js            # ★ 所有文案（中/英）都在這裡，直接改即可
  style.css          # 像素 UI 主題（box-shadow 拼出的像素邊框）
  game/
    engine.js        # 遊戲迴圈：相機跟隨、格子移動、貓的足跡跟隨、NPC 漫遊
    map.js           # 小鎮地圖配置 + 磁磚繪製器 + 碰撞 + 熱點
    sprites.js       # 角色/貓/NPC 像素圖（字元網格定義，可直接編輯）
```

## 自訂指南

- **改文案**：編輯 `src/i18n.js`（`zh` / `en` 兩份字典）。
- **改地圖**：`src/game/map.js` 的 `buildMap()`——用 `fill()` 鋪地形、座標放物件；`hotspots` 陣列決定哪些磁磚觸發哪個視窗。
- **改角色外觀**:`src/game/sprites.js` 的 16×16 字元網格，一個字元＝一個像素，調色盤在檔案上方。
- **改配色**：UI 在 `style.css` 的 `:root` 變數；世界磁磚在 `map.js` 的 `C` 物件。

## 部署

`npm run build` 之後把 `dist/` 丟上 Vercel / Cloudflare Pages 即可（`vite.config.js` 已設 `base: './'`，任何子路徑都能跑）。
