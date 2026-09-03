const PROFILE_KEY = "mudmue_profile";

export const LEVEL_LIST = [
    //NOTE: wait handle level from logic
    {
        name: "BG",
    },
    {
        name: "N",
    },
    {
        name: "S",
    },
    {
        name: "P",
    },
    {
        name: "C",
    },
    {
        name: "B",
    },
    {
        name: "A",
    },
];

export type PlayerProfile = {
    id: number;
    name: string;
    uuid: string;
    displayName: string;
    level: string;
    win: number;
    lose: number;
    createDate: string;
    updateDate: string;
    /**
     * ซ่อนจากลิสต์ "เลือกคนมาวันนี้" ของ MUDMUE Han แต่ประวัติเก่ายังอ้างถึงได้
     * เป็น optional เพราะโปรไฟล์ที่บันทึกไว้ก่อนหน้านี้ไม่มีฟิลด์นี้ — undefined = ยังไม่ถูกซ่อน
     */
    archived?: boolean;
};

export const loadProfiles = (): PlayerProfile[] => {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        if (data) return JSON.parse(data) as PlayerProfile[];
    } catch {
        return [];
    }
    return [];
};

export const saveProfiles = (list: PlayerProfile[]) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(list));
};

export const addProfile = (
    list: PlayerProfile[],
    name: string,
    displayName: string,
    level: string
): PlayerProfile[] => {
    const maxId = list.length ? Math.max(...list.map((p) => p.id)) : 0;
    const newProfile: PlayerProfile = {
        id: maxId + 1,
        name,
        uuid: genUniqueKey(
            list.map((p) => p.uuid),
            6
        ),
        displayName,
        level,
        win: 0,
        lose: 0,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
    };
    return [...list, newProfile];
};

export const updateProfile = (
    list: PlayerProfile[],
    id: number,
    name: string,
    displayName: string,
    level: string
): PlayerProfile[] => {
    const now = new Date().toISOString();
    return list.map((p) => (p.id === id ? { ...p, name, displayName, level, updateDate: now } : p));
};

/** Load all profiles once as a uuid -> profile map (avoids repeated localStorage reads in lists). */
export const loadProfileMap = (): Record<string, PlayerProfile> => {
    return loadProfiles().reduce<Record<string, PlayerProfile>>((acc, profile) => {
        acc[profile.uuid] = profile;
        return acc;
    }, {});
};

export const deleteProfile = (list: PlayerProfile[], id: number): PlayerProfile[] => {
    return list.filter((p) => p.id !== id);
};

/**
 * เพิ่มคนแบบเร็วจากหน้าอื่น (MUDMUE Han) ที่มีแค่ชื่อ — ยังไม่ต้องรู้ระดับมือ
 * ใช้ชื่อเดียวกันทั้ง `name` และ `displayName` แก้ทีหลังได้ที่หน้า Profile ของ Chok
 * ถ้าชื่อนี้มีอยู่แล้ว (ไม่สนตัวพิมพ์/ช่องว่างหัวท้าย) จะคืนโปรไฟล์เดิมแทนการสร้างซ้ำ
 */
export const addProfileByName = (
    list: PlayerProfile[],
    name: string
): { list: PlayerProfile[]; profile: PlayerProfile } => {
    const trimmed = name.trim();
    const existing = list.find(
        (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase() ||
            p.displayName.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return { list, profile: existing };

    const nextList = addProfile(list, trimmed, trimmed, "");
    return { list: nextList, profile: nextList[nextList.length - 1] };
};

/** ซ่อน/เลิกซ่อนโปรไฟล์ — ใช้แทนการลบเมื่อมีประวัติผูกอยู่ */
export const setProfileArchived = (
    list: PlayerProfile[],
    id: number,
    archived: boolean
): PlayerProfile[] => {
    const now = new Date().toISOString();
    return list.map((p) => (p.id === id ? { ...p, archived, updateDate: now } : p));
};

/** คนที่ยังใช้งานอยู่ — ลิสต์เลือกคนใหม่ทุกที่ควรอ่านผ่านตัวนี้ */
export const activeProfiles = (list: PlayerProfile[]): PlayerProfile[] => list.filter((p) => !p.archived);

/** Win/Lose ratio as a display string. "-" when there are no losses yet. */
export const formatWinLoseRatio = (win: number, lose: number): string => {
    if (lose > 0) return (win / lose).toFixed(2);
    return win > 0 ? "-" : "0";
};

const genKey = (length = 6) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
};
const genUniqueKey = (existingKeys: string[], length = 6) => {
    let key;
    do {
        key = genKey(length);
    } while (existingKeys.includes(key));
    return key;
};

// ---------------------------------------------------------------------------
// Async API layer — simulates HTTP calls (swap for real fetch() when ready)
// ---------------------------------------------------------------------------

const simulateDelay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const loadProfilesAsync = async (): Promise<PlayerProfile[]> => {
    await simulateDelay();
    return loadProfiles();
};
