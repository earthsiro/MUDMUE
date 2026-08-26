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
