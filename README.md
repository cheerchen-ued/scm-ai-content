# AI 幫寫 · 元件預覽

這是 KKday SCM「AI 產文」功能的 UI 原型（prototype），純前端、假資料，沒有任何真實
後端 API 或帳號資料，僅供設計討論與內部操作體驗使用，**不是正式產品頁面**。

涵蓋節點：
- 1-1 商品名稱
- 1-2 商品亮點
- 5-1 商品描述（AI 內容綁定商品說明欄位）
- 2-2 行程管理／方案層行程表

## 本機開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview   # 本機預覽建置結果
```

建置輸出在 `dist/`，`vite.config.js` 已將 `base` 設為相對路徑，
可直接部署到 GitHub Pages（含子路徑，例如 `https://<user>.github.io/<repo>/`）
或任何靜態網站託管服務。
