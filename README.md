# MuCity H5 MVP

MuCity 是一個到府按摩預約 H5 展示專案，目標是先做出高相似商業流程與可部署前端，再逐步串接真實 API、會員、金流與後台。

## 目前已完成

- 首頁商業化模組
- Banner 輪播、公告區、快捷入口、活動專區
- 城市切換與服務範圍說明
- 服務頁
- 分類篩選、搜尋、服務詳情、立即預約
- 技師詳情頁
- 收藏技師、評價篩選、查看更多評價、諮詢客服
- 訂單中心
- 訂單列表、訂單詳情、付款、取消、再次預約、自動狀態流轉
- 我的頁
- 常用地址、優惠券入口、我的收藏、發票與付款、客服入口、商家合作申請
- 客服與 FAQ
- 常見問題展開、客服入口、LINE 客服入口預留
- 收藏與會員中心
- 收藏技師清單、付款中心、合作申請表單
- 全域狀態
- 啟動 loading、載入失敗、重新載入 retry
- 表單狀態
- 下單、地址、合作申請提交中 disabled / loading 文案

## 主要檔案

- `E:\Codex\index.html`：頁面結構與所有 sheet
- `E:\Codex\data.js`：前端展示用假資料來源
- `E:\Codex\config.js`：切換 `mock` / `real` API 模式與 API Base URL
- `E:\Codex\api.js`：前端 API service layer 與 bootstrap 入口
- `E:\Codex\api-schema.md`：前後端串接用的 API 欄位定義
- `E:\Codex\app.js`：前端狀態、假資料、互動流程
- `E:\Codex\styles.css`：視覺樣式與響應式排版
- `E:\Codex\vercel.json`：Vercel 靜態部署設定
- `E:\Codex\netlify.toml`：Netlify 靜態部署設定

## 目前資料模式

目前使用前端假資料與 localStorage：

- 訂單：`mucity-orders`
- 地址：`mucity-addresses`
- 收藏：`mucity-favorites`
- 優惠券：`mucity-coupon`
- 城市：`mucity-city`

## API 切換

- 預設模式在 `E:\Codex\config.js`
- `mode: "mock"`：走本地假資料
- `mode: "real"`：改走 `${apiBaseUrl}/...` API 端點
- 目前已預留的讀取端點包含：
- `/services`
- `/therapists`
- `/banners`
- `/notices`
- `/cities`
- `/campaigns`
- `/shortcuts`
- `/coupons`
- `/faqs`
- `/profile-menus`
- `/affiliate`
- `/orders/defaults`
- `/addresses/defaults`
- 目前已接上的寫入端點包含：
- `POST /orders`
- `POST /orders/:id/pay`
- `POST /orders/:id/cancel`
- `GET /addresses`
- `POST /addresses`
- `DELETE /addresses/:id`
- `PUT /addresses/:id`
- `GET /coupons`
- `GET /profile`
- `GET /cities`
- `GET /campaigns`

## 建議下一步

1. 拆出 API 結構，讓前端從假資料改成可串接後端。
2. 補登入、會員、優惠券核銷、真實付款流程。
3. 建立後台資料表與管理端，處理服務、技師、訂單與城市配置。
4. 補 README 截圖、操作流程與部署說明，作為正式交付文件。
