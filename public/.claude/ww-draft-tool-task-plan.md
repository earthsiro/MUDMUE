# Wuthering Waves Ban & Pick Draft Tool — Task Plan

## 0. Context & Assumptions
- Feature module to add into existing ReactJS site as a new menu item.
- No backend — all data in `localStorage`. Import/export via Excel (xlsx) for
  portability between machines.
- Single "caster" (คนกลาง) controls one screen and manually advances turns for
  both sides — no real-time multiplayer/WebSocket needed.
- **Character/boss images: real in-game assets.** Decided to use actual
  character/boss art from Wuthering Waves rather than placeholders. Kuro
  Games' derivative-work guidelines technically exclude software/tools from
  their permitted fan-content scope, but small non-commercial fan tools are
  broadly tolerated in practice. Mitigation baked into the data model:
  `imageUrl` is a separate field per character/boss (not hardcoded into
  logic), so all images can be swapped or pulled quickly if ever needed.
  Keep the tool low-profile (not indexed/publicized broadly) rather than a
  major public destination.
- Ban phase 1 & 2 remove characters from the **shared/global pool** (confirmed).
  Last Ban phase removes characters directly from the **opponent's picked
  roster** (confirmed by rule text).
- **Team reuse limit (3 lives) — auto-tracked.** Each character starts at
  3 lives once picked. Every time the caster logs a boss attempt for a team,
  every character in that team's lineup gets `-1 life` (regardless of
  win/lose — using a character in a team "spends" one of its 3 uses). Life
  count is tracked per `(player, characterId)` pair since each side has its
  own roster copy of shared characters. UI **warns** when a character is at
  0 lives but does **not hard-block** re-selection (caster can override for
  edge cases/manual rulings). Can be switched to a hard block later if
  wanted.
- **Guided UI, not open-ended.** The draft screen only allows clicks that are
  valid for the current phase/turn per the state machine in Section 2 —
  invalid targets (already banned/picked, wrong player's turn) are visually
  disabled, not just discouraged. This is a deliberate choice: the rules are
  a fixed sequence with no judgment calls, so hard-constraining reduces
  live-broadcast misclicks and speeds up the caster's flow.
- **Undo (1 step back).** A single "undo last action" button reverts the most
  recent ban/pick/attempt-log using `phaseHistory`, restoring pool/roster/
  lives state to before that action. Multi-step undo is out of scope for v1.
- **Admin override toggle.** A separate mode switch that, when enabled,
  temporarily lifts the phase/turn constraints so the caster can manually
  force any ban/pick/state change for edge cases the rules don't cover.
  Should be visually distinct (e.g. a banner) so it's obvious when active,
  and easy to toggle back off. Note: this only applies to the ban/pick draft
  phases — the boss battle phase is already a free-form match logger (caster
  logs whatever happened), so override mode has nothing extra to unlock there.
- **Per-phase countdown timer.** A settings panel lets the caster configure
  minutes-per-phase (ban1, pick1, ban2, pick2, lastban, bossroll, and
  optionally per boss-attempt during battle). Timer counts down visually and
  flashes/beeps at zero; it does **not** auto-advance the turn — caster still
  clicks to move on. (Flag if you'd rather it auto-skip on timeout — different
  implementation.)

---

## 1. Data Models

```ts
type Character = {
  id: string;
  name: string;
  imageUrl: string; // local asset or URL
  element?: string;
  weaponType?: string;
  rarity?: number;
};

type Boss = {
  id: string;
  name: string;
  imageUrl: string;
};

type DraftPhase =
  | "ban1" | "pick1" | "ban2" | "pick2" | "lastban" | "bossroll" | "battle" | "done";

type DraftState = {
  matchId: string;
  createdAt: string;
  playerNames: [string, string]; // [P1, P2]
  pool: string[];       // remaining character ids in shared pool
  bannedPool: string[]; // characters banned from shared pool (ban1+ban2)
  rosterP1: string[];
  rosterP2: string[];
  lastBannedP1: string[]; // banned FROM P1's roster by P2
  lastBannedP2: string[];
  phase: DraftPhase;
  turnIndex: number; // pointer into the current phase's turn sequence
  bossPoolRolled: string[]; // 5 rolled boss ids, in order
  battleLog: BattleAttempt[];
  phaseHistory: DraftAction[]; // for undo / summary
  livesP1: Record<string, number>; // characterId -> remaining lives (starts at 3)
  livesP2: Record<string, number>;
};

type BattleAttempt = {
  bossIndex: number; // 0-4
  attemptNumberForBoss: number;
  player: "P1" | "P2";
  charactersUsed: string[]; // each of these gets -1 life for that player on log
  result: "win" | "lose";
  timestamp: string;
};

type PhaseTimerSettings = {
  ban1Minutes: number;
  pick1Minutes: number;
  ban2Minutes: number;
  pick2Minutes: number;
  lastbanMinutes: number;
  bossrollMinutes: number;
  battleAttemptMinutes?: number; // optional, per-attempt timer during battle
};

type DraftAction = {
  phase: DraftPhase;
  player: "P1" | "P2" | "system";
  characterIds: string[];
  timestamp: string;
};
```

Persist to `localStorage`:
- `ww_draft_characters` → Character[]
- `ww_draft_bosses` → Boss[]
- `ww_draft_matches` → DraftState[] (history, optional)
- `ww_draft_current_match` → DraftState (active match)
- `ww_draft_timer_settings` → PhaseTimerSettings

---

## 2. Draft State Machine — Exact Turn Sequences

### Ban 1 (from shared pool, target 3 per side)
| Turn | Player | Bans |
|---|---|---|
| 1 | P1 | 2 |
| 2 | P2 | 2 |
| 3 | P1 | 1 |
| 4 | P2 | 1 |

### Pick 1 (from shared pool → roster, target 6 per side)
| Turn | Player | Picks | Running total |
|---|---|---|---|
| 1 | P1 | 1 | P1=1 |
| 2 | P2 | 1 | P2=1 |
| 3 | P1 | 1 | P1=2 |
| 4 | P2 | 2 | P2=3 |
| 5 | P1 | 2 | P1=4 |
| 6 | P2 | 2 | P2=5 |
| 7 | P1 | 2 | P1=6 |
| 8 | P2 | 1 | P2=6 |

### Ban 2 (from shared pool, target 2 per side, starts with P2)
| Turn | Player | Bans |
|---|---|---|
| 1 | P2 | 1 |
| 2 | P1 | 1 |
| 3 | P2 | 1 |
| 4 | P1 | 1 |

### Pick 2 (from shared pool → roster, target 9 per side, starts with P2)
| Turn | Player | Picks | Running total |
|---|---|---|---|
| 1 | P2 | 1 | P2=7 |
| 2 | P1 | 2 | P1=8 |
| 3 | P2 | 2 | P2=9 |
| 4 | P1 | 1 | P1=9 |

### Last Ban (from opponent's roster, 9 → 7 each)
| Turn | Player | Action |
|---|---|---|
| 1 | P2 | bans 2 characters from P1's roster |
| 2 | P1 | bans 2 characters from P2's roster |

### Boss Roll
- Randomly pick 5 unique bosses from boss pool → ordered list, index 0-4.

### Battle Phase (logger + auto life-tracking)
- Current boss = `bossPoolRolled[currentBossIndex]`.
- Each round: caster records attempt (player, characters used, win/lose).
- **On every logged attempt**, each character in `charactersUsed` has its
  life decremented by 1 for that player (`livesP1`/`livesP2`), regardless of
  win/lose. UI shows a warning badge on characters at 0 lives; selecting them
  again is still allowed (soft warning, not blocked).
- First to 3 wins on current boss's series → boss "cleared", move to score.
- If both fail 3 attempts each on same boss → advance to next boss index.
- On the **last boss (index 4)**: if both fail 3 attempts, allow one team-swap
  retry (3 more attempts); if still both fail → (per rules, no further boss to
  move to — flag this edge case as "double loss / draw", let caster resolve
  manually, e.g. add a manual "declare winner" override button).
- First player to reach 3 boss-clear points wins the match.

### Phase Timer (runs alongside every phase above)
- On entering any draft phase, start a countdown from the configured minutes
  for that phase (`PhaseTimerSettings`).
- Timer resets when moving to the next phase (not per-turn — one countdown
  per phase, unless later changed to per-turn).
- At 00:00: visual flash + optional sound alert. Turn advancement stays
  manual (caster clicks as normal).
- Caster can pause/reset the current timer manually (useful if a real match
  pauses).

---

## 3. Component Breakdown (React)

- `DraftProvider` — context holding `DraftState`, exposes actions
  (`banCharacter`, `pickCharacter`, `advanceTurn`, `rollBosses`, `logAttempt`, `resetMatch`).
- `PoolGrid` — grid of character portraits from `pool`, click to ban/pick
  depending on current phase; disables already banned/picked.
- `RosterPanel` (x2, one per player) — shows picked characters, highlights
  banned-from-roster ones (strikethrough) after Last Ban phase, and during
  battle shows remaining lives (e.g. "●●○" or "2/3") per character with a
  warning style at 0.
- `PhaseTimer` — countdown display + pause/reset controls, reads current
  phase's configured minutes from `PhaseTimerSettings`.
- `TimerSettingsPanel` — form to set minutes per phase, saved to
  `ww_draft_timer_settings`.
- `PhaseHeader` — shows current phase name, whose turn, turns remaining in
  this phase (reuse the "Round 1 ●●●●" style from the reference screenshots).
- `UndoButton` — reverts the last logged action (ban/pick/attempt) using
  `phaseHistory`; disabled when there's nothing to undo.
- `OverrideToggle` — switch that lifts phase/turn click constraints on
  `PoolGrid`/`RosterPanel` when active; renders a persistent banner while on.
- `BannedListModal` — reference-style popup showing Lunatic/Pre-ban style
  grouped ban history (like image 2).
- `BossRollPanel` — button to roll 5 bosses + display rolled boss row.
- `BattleTracker` — per-boss attempt logger: select player, multi-select
  characters used, win/lose button, running score display, auto-advance boss
  on 3-fail-both rule.
- `MatchSummary` — final score, MVP-ish stats optional, "export as image"
  button.
- `AdminPoolManager` — CRUD screens for Character pool & Boss pool
  (name, image upload/URL, element/weapon tags).
- `ImportExportPanel` — export current pools/history to `.xlsx`, import back.

---

## 4. Task List (execute roughly in order)

### Setup
- [ ] Scaffold new route/menu entry in existing React app (e.g. `/ww-draft`).
- [ ] Set up local state persistence helper (`useLocalStorage` hook or similar).
- [ ] Define TypeScript types from Section 1 in a shared `types.ts`.

### Pool Management (build first — everything else depends on data existing)
- [ ] `AdminPoolManager`: Character CRUD (add/edit/delete, image upload or URL field).
- [ ] `AdminPoolManager`: Boss CRUD (same pattern).
- [ ] Excel export (pools + match history) using a lib like `xlsx` (SheetJS).
- [ ] Excel import with validation (basic shape check, id collisions handled).

### Draft Engine
- [ ] Implement `DraftState` reducer/context with the 5 phases wired to the
      exact turn tables in Section 2 (ban1 → pick1 → ban2 → pick2 → lastban).
- [ ] `PoolGrid` + `RosterPanel` wired to reducer; clicking a character calls
      the correct action for current phase/turn.
- [ ] Click guards: derive "is this target clickable right now" from
      `phase` + `turnIndex` + whose turn it is; disable/gray-out everything
      else (already banned/picked, wrong player's turn).
- [ ] `UndoButton`: pop last entry from `phaseHistory`, reverse its effect on
      `pool`/`bannedPool`/`rosterP1`/`rosterP2`/`lives*`, decrement `turnIndex`.
- [ ] `OverrideToggle`: global flag that bypasses the click guards above when
      on; persistent visual banner while active; auto-logs override actions
      to `phaseHistory` same as normal ones (so undo still works on them).
- [ ] `PhaseHeader` showing live phase/turn/remaining-picks-or-bans state.
- [ ] Turn auto-advance logic (after N clicks in a turn, move to next turn;
      after last turn in phase, move to next phase).
- [ ] `BannedListModal` (cosmetic, reference-style banned history view).

### Boss & Battle
- [ ] `BossRollPanel`: random-5-unique-from-pool roll, store order.
- [ ] `BattleTracker`: attempt logging UI, score counter, 3-fail-both →
      advance boss logic, last-boss team-swap edge case handled with manual
      override.
- [ ] Life-point tracking: init `livesP1`/`livesP2` to 3 per character on
      pick; decrement on every logged attempt; warning badge at 0 lives.
- [ ] `MatchSummary`: final score + team-usage log + final life counts display.

### Timer
- [ ] `PhaseTimerSettings` CRUD form (`TimerSettingsPanel`), persisted to
      localStorage.
- [ ] `PhaseTimer` component: countdown tied to current phase, resets on
      phase change, pause/reset controls, zero-time flash/sound alert.
- [ ] Wire `PhaseTimer` into the main draft screen header alongside
      `PhaseHeader`.

### Polish / Stretch
- [ ] Reset/new-match flow (clear current match, keep pools).
- [ ] Match history list (past `DraftState`s saved to localStorage).
- [ ] Export `MatchSummary` as PNG (`html-to-image` or `dom-to-image`).
- [ ] Visual polish pass matching reference screenshots (dark theme, circular
      portraits, ban icon overlay, rank-style side panel optional).

