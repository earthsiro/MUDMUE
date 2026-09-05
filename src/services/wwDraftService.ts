import * as XLSX from "xlsx";

import type { DraftState, PhaseTimerSettings, WWBoss, WWCharacter } from "../types/wwDraft";

import { PHASE_LABELS } from "../helpers/wwDraftEngine";

const CHARACTERS_KEY = "ww_draft_characters";
const BOSSES_KEY = "ww_draft_bosses";
const MATCHES_KEY = "ww_draft_matches";
const CURRENT_MATCH_KEY = "ww_draft_current_match";
const TIMER_SETTINGS_KEY = "ww_draft_timer_settings";
/** single-step undo snapshot of the whole match state */
const UNDO_KEY = "ww_draft_undo";

export const DEFAULT_TIMER_SETTINGS: PhaseTimerSettings = {
    ban1Minutes: 2,
    pick1Minutes: 5,
    ban2Minutes: 2,
    pick2Minutes: 3,
    lastbanMinutes: 2,
    bossrollMinutes: 1,
    battleAttemptMinutes: 5,
};

export const ELEMENT_LIST = ["Aero", "Electro", "Fusion", "Glacio", "Havoc", "Spectro"];
export const WEAPON_LIST = ["Sword", "Broadblade", "Pistols", "Gauntlets", "Rectifier"];

const read = <T>(key: string, fallback: T): T => {
    try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
    return fallback;
};

const write = (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// ---------------------------------------------------------------------------
// Character pool
// ---------------------------------------------------------------------------

export const loadCharacters = (): WWCharacter[] => read<WWCharacter[]>(CHARACTERS_KEY, []);
export const saveCharacters = (list: WWCharacter[]) => write(CHARACTERS_KEY, list);

export const loadBosses = (): WWBoss[] => read<WWBoss[]>(BOSSES_KEY, []);
export const saveBosses = (list: WWBoss[]) => write(BOSSES_KEY, list);

const genId = (prefix: string, existing: string[]): string => {
    let id: string;
    do {
        id = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
    } while (existing.includes(id));
    return id;
};

export const upsertCharacter = (list: WWCharacter[], draft: WWCharacter): WWCharacter[] => {
    if (draft.id && list.some((c) => c.id === draft.id)) {
        return list.map((c) => (c.id === draft.id ? { ...c, ...draft } : c));
    }
    return [...list, { ...draft, id: draft.id || genId("char", list.map((c) => c.id)) }];
};

export const deleteCharacter = (list: WWCharacter[], id: string): WWCharacter[] =>
    list.filter((c) => c.id !== id);

export const upsertBoss = (list: WWBoss[], draft: WWBoss): WWBoss[] => {
    if (draft.id && list.some((b) => b.id === draft.id)) {
        return list.map((b) => (b.id === draft.id ? { ...b, ...draft } : b));
    }
    return [...list, { ...draft, id: draft.id || genId("boss", list.map((b) => b.id)) }];
};

export const deleteBoss = (list: WWBoss[], id: string): WWBoss[] => list.filter((b) => b.id !== id);

/**
 * รวมของที่นำเข้าเข้ากับพูลเดิม — เทียบ id ก่อน ถ้าไม่เจอค่อยถอยไปเทียบชื่อ
 *
 * แถวในไฟล์ Excel ที่ไม่ได้ใส่ id (เทมเพลตที่ระบบแจกก็เว้นว่างมาให้) จะได้ id ใหม่
 * ทุกครั้งที่นำเข้า ถ้าเทียบแค่ id การนำเข้าไฟล์เดิมซ้ำจะได้ข้อมูลซ้ำทั้งชุด
 *
 * เวลาเจอด้วยชื่อจะรักษา id เดิมไว้เสมอ เพราะแมตช์ที่ค้างอยู่อ้างถึงตัวละครด้วย id
 */
const mergeByIdOrName = <T extends { id: string; name: string }>(existing: T[], incoming: T[]): T[] =>
    incoming.reduce<T[]>((list, draft) => {
        const byId = list.findIndex((item) => item.id === draft.id);
        if (byId >= 0) return list.map((item, index) => (index === byId ? { ...item, ...draft } : item));

        const key = draft.name.trim().toLowerCase();
        const byName = list.findIndex((item) => item.name.trim().toLowerCase() === key);
        if (byName >= 0) {
            return list.map((item, index) => (index === byName ? { ...item, ...draft, id: item.id } : item));
        }

        return [...list, draft];
    }, existing);

export const mergeCharacters = (existing: WWCharacter[], incoming: WWCharacter[]): WWCharacter[] =>
    mergeByIdOrName(existing, incoming);

export const mergeBosses = (existing: WWBoss[], incoming: WWBoss[]): WWBoss[] =>
    mergeByIdOrName(existing, incoming);

/** Look-ups keyed by id, so grids don't scan the array per tile. */
export const toCharacterMap = (list: WWCharacter[]): Record<string, WWCharacter> =>
    list.reduce<Record<string, WWCharacter>>((acc, c) => {
        acc[c.id] = c;
        return acc;
    }, {});

export const toBossMap = (list: WWBoss[]): Record<string, WWBoss> =>
    list.reduce<Record<string, WWBoss>>((acc, b) => {
        acc[b.id] = b;
        return acc;
    }, {});

// ---------------------------------------------------------------------------
// Match state
// ---------------------------------------------------------------------------

export const loadCurrentMatch = (): DraftState | null => read<DraftState | null>(CURRENT_MATCH_KEY, null);

export const saveCurrentMatch = (state: DraftState | null) => {
    if (!state) {
        localStorage.removeItem(CURRENT_MATCH_KEY);
        return;
    }
    write(CURRENT_MATCH_KEY, state);
};

export const loadMatchHistory = (): DraftState[] => read<DraftState[]>(MATCHES_KEY, []);
export const saveMatchHistory = (list: DraftState[]) => write(MATCHES_KEY, list);

/** Archive a match into history, replacing any earlier save of the same match. */
export const archiveMatch = (state: DraftState): DraftState[] => {
    const list = loadMatchHistory().filter((m) => m.matchId !== state.matchId);
    const next = [state, ...list];
    saveMatchHistory(next);
    return next;
};

export const deleteMatchFromHistory = (matchId: string): DraftState[] => {
    const next = loadMatchHistory().filter((m) => m.matchId !== matchId);
    saveMatchHistory(next);
    return next;
};

export const loadUndoSnapshot = (): DraftState | null => read<DraftState | null>(UNDO_KEY, null);

export const saveUndoSnapshot = (state: DraftState | null) => {
    if (!state) {
        localStorage.removeItem(UNDO_KEY);
        return;
    }
    write(UNDO_KEY, state);
};

// ---------------------------------------------------------------------------
// Timer settings
// ---------------------------------------------------------------------------

export const loadTimerSettings = (): PhaseTimerSettings => ({
    ...DEFAULT_TIMER_SETTINGS,
    ...read<Partial<PhaseTimerSettings>>(TIMER_SETTINGS_KEY, {}),
});

export const saveTimerSettings = (settings: PhaseTimerSettings) => write(TIMER_SETTINGS_KEY, settings);

// ---------------------------------------------------------------------------
// Excel import / export (SheetJS)
// ---------------------------------------------------------------------------

type CharacterRow = {
    id?: string;
    name?: string;
    imageUrl?: string;
    element?: string;
    weaponType?: string;
    rarity?: number | string;
};

type BossRow = { id?: string; name?: string; imageUrl?: string };

export const exportPoolsToExcel = (
    characters: WWCharacter[],
    bosses: WWBoss[],
    matches: DraftState[] = []
) => {
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet(
            characters.map((c) => ({
                id: c.id,
                name: c.name,
                imageUrl: c.imageUrl,
                element: c.element ?? "",
                weaponType: c.weaponType ?? "",
                rarity: c.rarity ?? "",
            }))
        ),
        "Characters"
    );

    XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet(bosses.map((b) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl }))),
        "Bosses"
    );

    if (matches.length) {
        XLSX.utils.book_append_sheet(
            book,
            XLSX.utils.json_to_sheet(
                matches.map((m) => ({
                    matchId: m.matchId,
                    createdAt: m.createdAt,
                    p1: m.playerNames[0],
                    p2: m.playerNames[1],
                    phase: PHASE_LABELS[m.phase],
                    scoreP1: m.scoreP1,
                    scoreP2: m.scoreP2,
                    winner: m.winner ?? "",
                    attempts: m.battleLog.length,
                }))
            ),
            "Matches"
        );
    }

    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(book, `ww-draft-pools-${stamp}.xlsx`);
};

export type ImportResult = {
    characters: WWCharacter[];
    bosses: WWBoss[];
    warnings: string[];
};

/**
 * Read Characters/Bosses sheets back out of a workbook. Rows without a name are
 * skipped, ids are generated when missing and de-duplicated on collision.
 */
export const importPoolsFromExcel = async (file: File): Promise<ImportResult> => {
    const buffer = await file.arrayBuffer();
    const book = XLSX.read(buffer, { type: "array" });
    const warnings: string[] = [];

    const charSheet = book.Sheets["Characters"];
    const bossSheet = book.Sheets["Bosses"];
    if (!charSheet && !bossSheet) {
        throw new Error('ไม่พบชีท "Characters" หรือ "Bosses" ในไฟล์นี้');
    }

    const characters: WWCharacter[] = [];
    const seenCharIds: string[] = [];
    if (charSheet) {
        const rows = XLSX.utils.sheet_to_json<CharacterRow>(charSheet);
        rows.forEach((row, index) => {
            const name = String(row.name ?? "").trim();
            if (!name) {
                warnings.push(`Characters แถวที่ ${index + 2}: ไม่มีชื่อ — ข้ามไป`);
                return;
            }
            let id = String(row.id ?? "").trim();
            if (!id) id = genId("char", seenCharIds);
            if (seenCharIds.includes(id)) {
                const fresh = genId("char", seenCharIds);
                warnings.push(`Characters "${name}": id ซ้ำ (${id}) — เปลี่ยนเป็น ${fresh}`);
                id = fresh;
            }
            seenCharIds.push(id);
            const rarity = Number(row.rarity);
            characters.push({
                id,
                name,
                imageUrl: String(row.imageUrl ?? "").trim(),
                element: String(row.element ?? "").trim() || undefined,
                weaponType: String(row.weaponType ?? "").trim() || undefined,
                rarity: Number.isFinite(rarity) && rarity > 0 ? rarity : undefined,
            });
        });
    }

    const bosses: WWBoss[] = [];
    const seenBossIds: string[] = [];
    if (bossSheet) {
        const rows = XLSX.utils.sheet_to_json<BossRow>(bossSheet);
        rows.forEach((row, index) => {
            const name = String(row.name ?? "").trim();
            if (!name) {
                warnings.push(`Bosses แถวที่ ${index + 2}: ไม่มีชื่อ — ข้ามไป`);
                return;
            }
            let id = String(row.id ?? "").trim();
            if (!id) id = genId("boss", seenBossIds);
            if (seenBossIds.includes(id)) {
                const fresh = genId("boss", seenBossIds);
                warnings.push(`Bosses "${name}": id ซ้ำ (${id}) — เปลี่ยนเป็น ${fresh}`);
                id = fresh;
            }
            seenBossIds.push(id);
            bosses.push({ id, name, imageUrl: String(row.imageUrl ?? "").trim() });
        });
    }

    return { characters, bosses, warnings };
};

/** Blank workbook with the expected headers, so the caster can fill it offline. */
export const downloadImportTemplate = () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet([
            { id: "", name: "Jinhsi", imageUrl: "https://...", element: "Spectro", weaponType: "Broadblade", rarity: 5 },
        ]),
        "Characters"
    );
    XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet([{ id: "", name: "Dreamless", imageUrl: "https://..." }]),
        "Bosses"
    );
    XLSX.writeFile(book, "ww-draft-template.xlsx");
};
