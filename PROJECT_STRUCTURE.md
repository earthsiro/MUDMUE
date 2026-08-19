# 🖐️ Mudmue Web — Project Structure

โปรเจครวม mini-apps ส่วนตัว

---

## 📁 Directory Structure

```
mudmue-web/
├── public/
│   └── .claude/                      # Design references (เปิดด้วยเบราว์เซอร์ได้เลย)
│       ├── WW Draft Tool - App (standalone).html          # ธีม Modernist ของหน้า WuWa
│       ├── Mudmue Chok - UX Design Review (standalone).html # role map สี/type/hit target ของหน้า Chok
│       └── ww-draft-tool-task-plan.md
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
│   │   │   └── HomePage.tsx          # Landing page (hub)
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
│   │   ├── mudmue-chim/              # 🗺️ App 2 - แผนที่ + รีวิวร้านอาหาร (Leaflet)
│   │   │   ├── MudmueChimPage.tsx
│   │   │   └── components/           # FoodMap, Sidebar, mockPlace
│   │   │
│   │   └── ww-draft/                 # ⚔️ App 3 - Wuthering Waves Ban & Pick
│   │       ├── WWDraftPage.tsx       # Layout + Side/Tab menu
│   │       ├── ww-draft.styles.ts    # ธีมมืดเฉพาะแอปนี้ + styled primitives
│   │       ├── context/
│   │       │   ├── draftContext.ts   # context + useDraft hook
│   │       │   └── DraftProvider.tsx # state + persist + undo snapshot
│   │       ├── components/           # CharacterTile, PoolGrid, RosterPanel,
│   │       │                         # PhaseHeader, PhaseTimer, BossRollPanel,
│   │       │                         # BattleTracker, MatchSummary, ...
│   │       ├── draft/WWDraftBoard.tsx
│   │       ├── pool/WWPoolManager.tsx
│   │       ├── settings/WWTimerSettings.tsx
│   │       └── history/WWMatchHistory.tsx
│   │
│   ├── services/
│   │   ├── matchService.ts           # CRUD match (localStorage)
│   │   ├── profileService.ts         # CRUD player profile (localStorage)
│   │   └── wwDraftService.ts         # WW pools/match/timer + Excel import-export
│   │
│   ├── helpers/
│   │   └── wwDraftEngine.ts          # state machine ของ ban/pick (pure functions)
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

### 🎯 Mudmue Chok
> จับคู่ผู้เล่นแบบสุ่มด้วย Roulette — route `/chok` (โฟลเดอร์ยังชื่อ `mudmue-pick/`)

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

### 🗺️ Mudmue Chim ✅
> แผนที่ปักหมุดและรีวิวร้านอาหาร (Leaflet + localStorage)

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

### ⚔️ WuWa MudMue ✅
> เครื่องมือ Ban & Pick สำหรับทัวร์นาเมนต์ Wuthering Waves (กรรมการคุมจอเดียว)

| Feature | รายละเอียด |
|---------|-----------|
| Draft | 5 เฟสตามกติกา: ban1 → pick1 → ban2 → pick2 → lastban ตามตารางเทิร์นเป๊ะ |
| Guided UI | คลิกได้เฉพาะเป้าหมายที่ถูกกติกาในเทิร์นนั้น ที่เหลือถูก disable |
| Undo | ย้อนกลับ 1 ขั้น (snapshot ทั้ง state) |
| Override | โหมดข้ามกติกาสำหรับเคสพิเศษ พร้อมแบนเนอร์เตือน |
| Timer | นับถอยหลังต่อเฟส ตั้งค่าได้ กะพริบ+เสียงเมื่อหมดเวลา (ไม่ข้ามเทิร์นเอง) |
| Battle | สุ่มบอส 5 ตัว, บันทึกผลการตี, ตัด "ชีวิต" ตัวละคร 3 ครั้งอัตโนมัติ |
| Pool | CRUD ตัวละคร/บอส + Import/Export `.xlsx` |

**Data Model** — ดู [src/types/wwDraft.ts](src/types/wwDraft.ts)
```
WWCharacter  { id, name, imageUrl, element?, weaponType?, rarity? }
WWBoss       { id, name, imageUrl }
DraftState   { pool[], bannedPool[], rosterP1/P2[], lastBannedP1/P2[],
               phase, turnIndex, turnProgress, bossPoolRolled[],
               battleLog[], phaseHistory[], livesP1/P2, scoreP1/P2 }
```

**localStorage keys**
```
ww_draft_characters | ww_draft_bosses | ww_draft_current_match
ww_draft_matches    | ww_draft_timer_settings | ww_draft_undo
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
| Excel | SheetJS (`xlsx`) — import/export พูล WuWa MudMue |
| Image export | `html-to-image` — export สรุปผลแมตช์เป็น PNG |
| Language | TypeScript |
