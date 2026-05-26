# 🖐️ Mudmue Web — Project Structure

โปรเจครวม mini-apps ส่วนตัว

---

## 📁 Directory Structure

```
mudmue-web/
├── public/
│
├── src/
│   ├── assets/                       # รูปภาพ, icons
│   │
│   ├── components/                   # Shared components
│   │   ├── Loader.tsx
│   │   ├── MudmueButton.tsx
│   │   └── ...
│   │
│   ├── configs/
│   │   └── router.tsx                # React Router config (createBrowserRouter)
│   │
│   ├── helpers/
│   │   ├── formatDate.ts
│   │   └── spinHelp.ts               # Logic รวม spin roulette
│   │
│   ├── pages/
│   │   ├── MainLayout.tsx            # Root layout (Navbar + Outlet)
│   │   ├── home/
│   │   │   └── HomePage.tsx          # Landing page
│   │   ├── leader-board/
│   │   │   └── LeaderBoardPage.tsx
│   │   │
│   │   ├── mudmue-pick/              # 🎯 App 1 - จับคู่ผู้เล่น
│   │   │   ├── MudmuePickPage.tsx    # Layout + Side/Tab menu
│   │   │   ├── components/
│   │   │   │   ├── TabMenu.tsx
│   │   │   │   └── VSLabel.tsx
│   │   │   ├── matchmaker/           # หน้า Spin Roulette
│   │   │   │   ├── MudmueMatchmaker.tsx
│   │   │   │   ├── Matchmaker.css
│   │   │   │   ├── Roulette.css
│   │   │   │   └── components/
│   │   │   │       └── Roulette.tsx
│   │   │   ├── dashboard/            # หน้าแสดง match ที่ยังไม่จบ
│   │   │   │   ├── MudmueDashboard.tsx
│   │   │   │   └── components/
│   │   │   │       └── ScoreStepper.tsx
│   │   │   ├── history/              # ประวัติ match ที่จบแล้ว
│   │   │   │   └── MudmueHistory.tsx
│   │   │   └── profile/              # จัดการ player profile
│   │   │       └── MudmueProfile.tsx
│   │   │
│   │   └── mudmue-chim/              # 🗺️ App 2 - แผนที่ + รีวิวร้านอาหาร (Phase ถัดไป)
│   │
│   ├── services/
│   │   ├── matchService.ts           # CRUD match (localStorage)
│   │   ├── profileService.ts         # CRUD player profile (localStorage)
│   │   └── mockDashboardData.ts      # Mock data
│   │
│   ├── main.tsx                      # Entry point
│   └── index.css
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── PROJECT_STRUCTURE.md
```

---

## 🚀 Apps Overview

### 🎯 Mudmue Pick
> จับคู่ผู้เล่นแบบสุ่มด้วย Roulette

| Phase | Feature |
|-------|---------|
| Phase 1 | Spin roulette จับคู่แบบสุ่ม, สร้าง match list, กด Complete เมื่อจบ |
| Phase 2 | จับคู่ตามฝีมือ โดยดูจากประวัติที่เคยบันทึกไว้ |

**Data Model**
```
Player        { id, name, skill? }
MatchSession  { id, date, players[], status }
Match         { id, sessionId, player1, player2, completed, winner? }
```

---

### 🗺️ Mudmue Chim
> แผนที่ปักหมุดและรีวิวร้านอาหาร

| Feature | รายละเอียด |
|---------|-----------|
| แผนที่ | แสดงตำแหน่งปัจจุบันผ่าน GPS |
| ปักหมุด | เพิ่มร้านอาหารที่สนใจลงแผนที่ |
| รีวิว | รีวิวร้านที่เคยไป พร้อมคะแนนและรูปภาพ |

**Data Model**
```
Place   { id, name, lat, lng, category, addedAt }
Review  { id, placeId, rating, comment, images[], visitedAt }
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS + DaisyUI + styled-components |
| Animation | Framer Motion |
| Storage | localStorage (Phase 1) |
| Language | TypeScript |
