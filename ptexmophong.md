# PTex Mô Phỏng — Ghi Nhớ Các Bước Code

> **Mục đích**: Ghi nhớ chi tiết cách vận hành, thêm bài mô phỏng, và các bước kỹ thuật quan trọng.

---

## 1. Cấu Trúc Dự Án

```
ptex-web-mophong/
├── src/
│   ├── app/                    # Pages + API routes
│   │   ├── page.tsx            # Trang chủ
│   │   ├── lop/[grade]/        # /lop/10, /lop/11, /lop/12
│   │   │   ├── page.tsx        # Danh sách chương
│   │   │   └── [chapterSlug]/
│   │   │       ├── page.tsx    # Danh sách bài
│   │   │       └── [lessonSlug]/
│   │   │           └── page.tsx # 🎯 Trang mô phỏng
│   │   └── api/
│   │       ├── chapters/       # CRUD chương
│   │       ├── simulations/    # CRUD mô phỏng
│   │       └── seed/           # Seed dữ liệu
│   ├── components/             # UI components
│   ├── models/                 # Mongoose models
│   ├── lib/                    # DB connection, utils
│   ├── data/                   # Seed data (chương trình)
│   └── types/                  # TypeScript types
├── .env.local                  # MongoDB URI (KHÔNG push git)
└── ptexmophong.md              # File này
```

---

## 2. MongoDB — Kết Nối

```
User:     giupbangioitoan89_db_user
Password: 8sMlKklOZJxqc0AM
Cluster:  cluster0.4mhpew3.mongodb.net
Database: ptex-mophong
```

### Collections:
- **chapters** — Cấu trúc 20 chương (Toán 10/11/12)
- **simulations** — Code mô phỏng JavaScript (ẩn)
- **interactions** — Log tương tác học sinh (tùy chọn)

---

## 3. Cách Thêm Bài Mô Phỏng Mới

### Bước 1: Viết code JavaScript mô phỏng

```javascript
// Ví dụ: Đồ thị hàm số bậc 2
function initSimulation(board, controls) {
  const a = controls.a || 1;
  const b = controls.b || 0;
  const c = controls.c || 0;
  
  board.create('functiongraph', [
    function(x) { return a * x * x + b * x + c; }
  ], { strokeColor: '#2563eb', strokeWidth: 2 });
}
```

### Bước 2: POST lên API

```bash
curl -X POST https://ptex-mophong.vercel.app/api/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 10,
    "chapterSlug": "ham-so-do-thi-va-ung-dung",
    "lessonSlug": "do-thi-ham-bac-2",
    "title": "Đồ thị hàm số y = ax² + bx + c",
    "description": "Khám phá parabol",
    "simulationCode": "function initSimulation(board, controls) { ... }",
    "visualizationType": "jsxgraph",
    "config": {
      "boardSize": {"width": 600, "height": 600},
      "boundingBox": [-5, 10, 5, -2],
      "showAxis": true, "showGrid": true
    },
    "controls": [
      {"type":"slider","name":"a","label":"Hệ số a","min":-5,"max":5,"step":0.1,"defaultValue":1}
    ],
    "mathContent": "y = ax^2 + bx + c",
    "keyInsights": ["Đỉnh tại x = -b/(2a)"],
    "isPublished": true
  }'
```

### Bước 3: Web tự hiển thị bài mới

Không cần deploy lại! MongoDB lưu code → Web fetch → Render.

---

## 4. Visualization Types

| Type | Thư viện | Dùng cho |
|---|---|---|
| `jsxgraph` | JSXGraph | Đồ thị 2D, hình học, kéo thả |
| `plotly` | Plotly.js | 3D, thống kê, biểu đồ |
| `canvas` | Canvas API | Custom animation |
| `custom` | Tự viết | Đặc biệt |

---

## 5. Chạy Local

```bash
cd d:\PTex2026\ptex-web-mophong
npm run dev
# Mở http://localhost:3000
```

---

## 6. Deploy

```bash
# Push code lên GitHub
git add .
git commit -m "Update"
git push origin main

# Deploy Vercel (tự động khi push, hoặc thủ công)
vercel --prod
```

---

## 7. Seed Dữ Liệu Chương

```bash
# Gọi API seed (chỉ chạy 1 lần)
curl -X POST http://localhost:3000/api/seed
```

---

## 8. Lịch Sử Thay Đổi

| Ngày | Thay đổi |
|---|---|
| 2026-06-13 | Khởi tạo project, tạo khung sườn |
