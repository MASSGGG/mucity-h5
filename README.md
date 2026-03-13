# 沐城到府 H5 MVP

這是一個不依賴建置工具的前端原型，用來快速展示「到府按摩預約平台」的手機版 H5 MVP，可直接部署到靜態主機。

## 目前內容

- 首頁 Hero 區塊
- 熱門服務列表
- 技師卡片列表
- 服務詳情 Bottom Sheet
- 預約表單 Bottom Sheet
- 假資料互動與下單提示

## 如何查看

直接用瀏覽器打開 [index.html](E:\Codex\index.html) 即可。

## 可直接部署

- `Vercel`：已提供 [vercel.json](E:\Codex\vercel.json)
- `Netlify`：已提供 [netlify.toml](E:\Codex\netlify.toml)
- 一般靜態空間：上傳 `index.html`、`styles.css`、`app.js`、`404.html`、`site.webmanifest`

## 部署重點

- 這版是純前端靜態頁，不需要 Node.js 也能上線
- 若後續接 API，可把介面保留，改由 `app.js` 呼叫後端
- `404.html` 與 rewrite 設定是為了讓 H5 路由或重新整理時不會直接 404

## 下一步建議

1. 接上登入、定位、支付、訂單與技師排班 API。
2. 增加服務城市切換、地址管理、優惠券與訂單查詢。
3. 補使用者端、技師端、管理後台三種角色。
