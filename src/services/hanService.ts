import { HanCourt, HanSession, HanSettings, RateTier } from "../types/han";

/**
 * ที่เก็บข้อมูลของ MUDMUE Han — localStorage ล้วน (เฟสเดียวกับแอปอื่นในเว็บนี้)
 *
 * แยกเป็นสามก้อน:
 * - `HAN_DRAFT_KEY`    บิลที่กำลังกรอกค้างอยู่ กลับมาหน้าเดิมแล้วต้องยังอยู่ครบ
 * - `HAN_SESSIONS_KEY` ประวัติที่กดบันทึกแล้ว เก็บเป็น JSON ล้วน ไม่เก็บรูป (~1-2KB/ก๊วน)
 * - `HAN_SETTINGS_KEY` ตั้งค่าถาวร เช่น รูป QR พร้อมเพย์
 */

const HAN_DRAFT_KEY = "mudmue_han_draft";
const HAN_SESSIONS_KEY = "mudmue_han_sessions";
const HAN_SETTINGS_KEY = "mudmue_han_settings";

const genId = (prefix: string): string =>
    `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const createTier = (label = "", pricePerHour = 0, hours = 1): RateTier => ({
    id: genId("tier"),
    label,
    pricePerHour,
    hours,
});

export const createCourt = (index: number, tierIds: string[] = []): HanCourt => ({
    id: genId("court"),
    index,
    tierIds,
});

/**
 * บิลเปล่า — ตั้งใจให้เห็นกลไกครบตั้งแต่หน้าแรก (คอร์ท 1 ใบ + ป้ายราคา 1 ใบที่แปะไว้แล้ว)
 * แต่ไม่ยัดตัวเลขตัวอย่างมาให้ ทุกช่องราคาเริ่มที่ 0
 */
export const createEmptySession = (): HanSession => {
    const firstTier = createTier("ชม.แรก", 0, 1);
    return {
        id: genId("han"),
        date: new Date().toISOString(),
        title: "",
        tiers: [firstTier],
        courts: [createCourt(1, [firstTier.id])],
        shuttlePricePerPiece: 0,
        shuttleUsedCount: 0,
        attendees: [],
    };
};

/* ------------------------------------------------------------------ */
/* Draft — บิลที่กำลังกรอก                                            */
/* ------------------------------------------------------------------ */

export const loadDraft = (): HanSession | null => {
    try {
        const data = localStorage.getItem(HAN_DRAFT_KEY);
        if (data) return JSON.parse(data) as HanSession;
    } catch {
        return null;
    }
    return null;
};

export const saveDraft = (session: HanSession) => {
    localStorage.setItem(HAN_DRAFT_KEY, JSON.stringify(session));
};

export const clearDraft = () => {
    localStorage.removeItem(HAN_DRAFT_KEY);
};

/* ------------------------------------------------------------------ */
/* History — บิลที่บันทึกแล้ว                                          */
/* ------------------------------------------------------------------ */

export const loadSessions = (): HanSession[] => {
    try {
        const data = localStorage.getItem(HAN_SESSIONS_KEY);
        if (data) return JSON.parse(data) as HanSession[];
    } catch {
        return [];
    }
    return [];
};

export const saveSessions = (list: HanSession[]) => {
    localStorage.setItem(HAN_SESSIONS_KEY, JSON.stringify(list));
};

/** บันทึกทับถ้า id เดิมมีอยู่แล้ว (กดบันทึกซ้ำหลังแก้ยอด) ไม่งั้นต่อท้าย */
export const upsertSession = (session: HanSession): HanSession[] => {
    const stamped: HanSession = { ...session, savedAt: new Date().toISOString() };
    const list = loadSessions();
    const index = list.findIndex((item) => item.id === stamped.id);
    const next = index >= 0 ? list.map((item, i) => (i === index ? stamped : item)) : [...list, stamped];
    saveSessions(next);
    return next;
};

export const deleteSession = (id: string): HanSession[] => {
    const next = loadSessions().filter((session) => session.id !== id);
    saveSessions(next);
    return next;
};

/**
 * ใช้เป็นตัวกันลบโปรไฟล์ — ถ้าคนนี้ติดอยู่ในบิลที่บันทึกไว้แล้ว ต้อง "ซ่อน" แทน "ลบ"
 * ไม่งั้นประวัติจะกลายเป็นชื่อคนที่ไม่มีอยู่จริง
 */
export const countSessionsWithProfile = (profileUuid: string): number =>
    loadSessions().filter((session) => session.attendees.some((a) => a.profileUuid === profileUuid)).length;

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const defaultSettings: HanSettings = { paymentQrImage: "" };

export const loadHanSettings = (): HanSettings => {
    try {
        const data = localStorage.getItem(HAN_SETTINGS_KEY);
        if (data) return { ...defaultSettings, ...(JSON.parse(data) as Partial<HanSettings>) };
    } catch {
        return defaultSettings;
    }
    return defaultSettings;
};

export const saveHanSettings = (settings: HanSettings) => {
    localStorage.setItem(HAN_SETTINGS_KEY, JSON.stringify(settings));
};
