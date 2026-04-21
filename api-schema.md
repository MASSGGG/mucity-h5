# MuCity API Schema

這份文件定義目前 H5 前端最優先需要串接的 API。欄位命名以現有前端資料結構為準，後端若能維持一致，前端可最小改動接入。

## Base

- Base URL: `/api`
- Content-Type: `application/json`
- Time format: ISO 8601 或 `YYYY-MM-DD HH:mm`
- Currency: TWD

## 1. GET /services

回傳服務列表。

### Response 200

```json
{
  "data": [
    {
      "id": "aroma",
      "category": "舒壓",
      "name": "精油舒壓",
      "duration": "90 分鐘",
      "durationMinutes": 90,
      "price": 1880,
      "description": "適合下班後快速放鬆，主打肩頸釋壓、下背舒展與溫潤精油推撫。",
      "points": ["瑞典式舒壓", "肩頸重點釋放", "居家香氛精油"],
      "active": true
    }
  ]
}
```

### Field Notes

- `id`: 前端唯一識別，會被訂單與技師引用。
- `durationMinutes`: 建議後端提供，方便後續排序與計價。
- `active`: 後端可直接控制上下架。

## 2. GET /therapists

回傳技師列表。

### Query

- `serviceId` optional
- `cityId` optional
- `availableAt` optional

### Response 200

```json
{
  "data": [
    {
      "id": "t1",
      "name": "Lina",
      "title": "芳療師 6 年",
      "specialty": "精油舒壓、睡眠修復",
      "eta": "45 分鐘可到",
      "etaMinutes": 45,
      "rating": 4.9,
      "orders": 1248,
      "serviceId": "aroma",
      "tags": ["高回購", "輕柔手法", "晚間熱門"],
      "bio": "擅長舒壓與睡眠調理，重視服務節奏與細膩溝通。",
      "reviews": [
        {
          "user": "C小姐",
          "score": 5,
          "body": "肩頸放鬆很有感，力道穩定，整體體驗很舒服。"
        }
      ],
      "active": true
    }
  ]
}
```

### Field Notes

- `serviceId` 必須對應 `/services` 的 `id`。
- `eta` 是展示字串；`etaMinutes` 方便排序。
- `reviews` 後續可拆成獨立 `/therapists/:id/reviews`。

## 3. GET /orders

回傳目前使用者的訂單列表。

### Query

- `status` optional: `upcoming | matched | ongoing | completed`

### Response 200

```json
{
  "data": [
    {
      "id": "MO20260313001",
      "serviceId": "deep",
      "therapistId": "t2",
      "status": "matched",
      "date": "2026-03-13 20:30",
      "address": "台北市信義區松仁路 100 號",
      "amount": 2380,
      "timelineStep": 1,
      "lastAutoUpdate": 1773501000000
    }
  ]
}
```

### Field Notes

- `status` 必須對應前端狀態流轉：`upcoming -> matched -> ongoing -> completed`
- `timelineStep` 前端已有使用，後端若提供可直接減少推算。
- `lastAutoUpdate` 展示版目前用來模擬狀態推進，正式版可改成後端事件時間。

## 4. POST /orders

建立新訂單。

### Request Body

```json
{
  "serviceId": "sleep",
  "therapistId": "t4",
  "address": "台北市信義區信義路五段 7 號",
  "date": "2026-03-20 21:00",
  "phone": "0912345678",
  "note": "管理室代收，請先電話聯絡",
  "couponId": "new300"
}
```

### Response 201

```json
{
  "data": {
    "id": "MO20260319001",
    "serviceId": "sleep",
    "therapistId": "t4",
    "status": "upcoming",
    "date": "2026-03-20 21:00",
    "address": "台北市信義區信義路五段 7 號",
    "amount": 1180,
    "timelineStep": 0,
    "lastAutoUpdate": 1773590400000
  }
}
```

### Validation Rules

- `serviceId`: required
- `therapistId`: required
- `address`: required
- `date`: required
- `phone`: required
- `couponId`: optional
- 若 `couponId` 無效或未達門檻，後端應忽略優惠券並回傳正確 `amount`

## 5. POST /orders/:id/pay

將待付款訂單更新成已付款並進入派單 / 技師出發流程。

### Response 200

```json
{
  "data": {
    "id": "MO20260319001",
    "status": "matched",
    "timelineStep": 1,
    "lastAutoUpdate": 1773676800000
  }
}
```

## 6. POST /orders/:id/cancel

取消指定訂單。

### Response 200

```json
{
  "data": {
    "id": "MO20260319001",
    "cancelled": true
  }
}
```

## 7. GET /addresses

取得目前使用者常用地址列表。

### Response 200

```json
{
  "data": [
    {
      "id": "addr-1",
      "label": "住家",
      "value": "台北市信義區信義路五段 7 號"
    }
  ]
}
```

## 8. POST /addresses

新增常用地址。

### Request Body

```json
{
  "label": "公司",
  "value": "台北市松山區敦化北路 168 號"
}
```

### Response 201

```json
{
  "data": {
    "id": "addr-2",
    "label": "公司",
    "value": "台北市松山區敦化北路 168 號"
  }
}
```

## 9. DELETE /addresses/:id

刪除指定常用地址。

### Response 200

```json
{
  "data": {
    "id": "addr-2",
    "deleted": true
  }
}
```

## 10. PUT /addresses/:id

更新指定常用地址。

### Request Body

```json
{
  "label": "住家",
  "value": "台北市信義區松仁路 100 號"
}
```

### Response 200

```json
{
  "data": {
    "id": "addr-1",
    "label": "住家",
    "value": "台北市信義區松仁路 100 號"
  }
}
```

## 11. GET /coupons

取得目前使用者可用優惠券列表。

### Response 200

```json
{
  "data": [
    {
      "id": "new300",
      "name": "新客折抵",
      "amount": 300,
      "minSpend": 1500
    }
  ]
}
```

## 12. GET /profile

取得目前登入使用者的會員摘要資料。

### Response 200

```json
{
  "data": {
    "initials": "MC",
    "name": "陳小姐",
    "membershipLabel": "Membership",
    "tier": "白金會員",
    "totalOrders": 12,
    "availableCoupons": 3,
    "walletBalance": 1200,
    "averageRating": 4.9
  }
}
```

## 13. GET /cities

取得可服務城市與範圍說明。

### Response 200

```json
{
  "data": [
    {
      "id": "taipei",
      "name": "台北市",
      "range": "大安、信義、松山、中山、內湖、士林、北投等主要行政區可服務。"
    }
  ]
}
```

## 14. GET /campaigns

取得首頁與活動專區使用的活動資料。

### Response 200

```json
{
  "data": [
    {
      "id": "camp-1",
      "title": "晚間舒壓專場",
      "subtitle": "20:00 後下單立折 200",
      "badge": "Night",
      "serviceId": "aroma"
    }
  ]
}
```

### Field Notes

- `serviceId` 建議提供，前端可直接把活動導流到對應方案預約。

## 15. Suggested Next Endpoints

這些是下一階段很自然要補的：

- `GET /campaigns/:id`
- `GET /therapists/:id/reviews`

## 16. Frontend Mapping

目前前端主要依賴欄位如下：

- Service: `id`, `category`, `name`, `duration`, `price`, `description`, `points`
- Therapist: `id`, `name`, `title`, `specialty`, `eta`, `rating`, `orders`, `serviceId`, `tags`, `bio`, `reviews`
- Order: `id`, `serviceId`, `therapistId`, `status`, `date`, `address`, `amount`, `timelineStep`
- City: `id`, `name`, `range`
- Campaign: `id`, `title`, `subtitle`, `badge`, `serviceId`

如果後端要改欄位名稱，前端需要同步調整 [app.js](E:\Codex\app.js) 的讀取與渲染邏輯。
