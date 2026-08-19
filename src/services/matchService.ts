import { PlayerProfile, loadProfiles, saveProfiles } from "./profileService";

/** Simulates a network delay — replace with real fetch() when API is ready */
const simulateDelay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Winner value used when a match ends in a draw. */
export const TIED = "tied";

export interface MatchDataType {
    id: number;
    player: PlayerDataType[];
    serviceSide: string;
    winner?: string; // Optional, used for match results
    createDate: string;
    updateDate: string;
    finishedDate?: string;
}
export interface PlayerDataType {
    name: string;
    uuid: string;
    team: string;
    score: number;
    position: number;
}

export interface MatchFilterPayload {
    finished?: boolean; // true = winner exist
    winner?: string; // "blue", "red", "tiled"
    serviceSide?: string; // "blue", "red"
    playerNameIncludes?: string;
    dateFrom?: string; // ISO string
    dateTo?: string;

    orderBy?: "createDate" | "updateDate" | "id"; // ตัวอย่าง
    orderDirection?: "asc" | "desc";
}
export const loadHistories = (): MatchDataType[] => {
    try {
        const data = localStorage.getItem("mudmue_history");
        if (data) return JSON.parse(data) as MatchDataType[];
    } catch {
        return [];
    }
    // Fallback: ใช้ mock data ถ้า localStorage ไม่มี
    return [];
};
export const loadMatchesWithFilter = (filter: MatchFilterPayload = {}): MatchDataType[] => {
    const allMatches = loadHistories();
    let result = allMatches.filter((match) => {
        // Finished filter
        if (filter.finished !== undefined) {
            const isFinished = !!match.winner;
            if (isFinished !== filter.finished) return false;
        }
        // Winner filter
        if (filter.winner && match.winner !== filter.winner) return false;

        // Service Side
        if (filter.serviceSide && match.serviceSide !== filter.serviceSide) return false;

        // playerNameIncludes
        if (
            filter.playerNameIncludes &&
            !match.player.some((p) => p.name.toLowerCase().includes(filter.playerNameIncludes!.toLowerCase()))
        )
            return false;

        // Date range
        if (filter.dateFrom && match.createDate < filter.dateFrom) return false;
        if (filter.dateTo && match.createDate > filter.dateTo) return false;

        return true;
    });
    if (filter.orderBy) {
        result = result.sort((a, b) => {
            let valA: number | string = a[filter.orderBy!] as string;
            let valB: number | string = b[filter.orderBy!] as string;

            // ถ้า field เป็น date ให้แปลงเป็น timestamp ก่อน
            if (filter.orderBy === "createDate" || filter.orderBy === "updateDate") {
                valA = new Date(valA as string).getTime();
                valB = new Date(valB as string).getTime();
            }

            // ถ้า orderDirection เป็น desc สลับลำดับ
            if (filter.orderDirection === "desc") {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            } else {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            }
        });
    }
    return result;
};

export const saveHistories = (list: MatchDataType[]) => {
    localStorage.setItem("mudmue_history", JSON.stringify(list));
};

export const createMatch = (players: PlayerDataType[], serviceSide: string): MatchDataType[] => {
    const list = loadHistories();
    const maxId = list.length ? Math.max(...list.map((h) => h.id)) : 0;
    const newHistory: MatchDataType = {
        id: maxId + 1,
        player: players,
        serviceSide,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
    };
    const newList = [...list, newHistory];
    saveHistories(newList);
    return newList;
};

export const updateMatch = (
    id: number,
    players: PlayerDataType[],
    serviceSide: string,
    winner: string
): MatchDataType[] => {
    const list = loadHistories();
    const now = new Date().toISOString();
    const newList = list.map((h) =>
        h.id === id ? { ...h, player: players, serviceSide, winner, updateDate: now, finishedDate: now } : h
    );
    saveHistories(newList);

    // อัปเดต win/lose ของ profile
    if (winner !== TIED) {
        const profiles = loadProfiles();
        const match = newList.find((h) => h.id === id);
        if (match) {
            const updatedProfiles = profiles.map((profile: PlayerProfile) => {
                const playerInMatch = match.player.find((p) => p.uuid === profile.uuid);
                if (!playerInMatch) return profile;
                const isWinner = playerInMatch.team === winner;
                return {
                    ...profile,
                    win: isWinner ? profile.win + 1 : profile.win,
                    lose: !isWinner ? profile.lose + 1 : profile.lose,
                    updateDate: now,
                };
            });
            saveProfiles(updatedProfiles);
        }
    }

    return newList;
};

// ---------------------------------------------------------------------------
// Async API layer — simulates HTTP calls (swap for real fetch() when ready)
// ---------------------------------------------------------------------------

export const loadMatchesWithFilterAsync = async (filter: MatchFilterPayload = {}): Promise<MatchDataType[]> => {
    await simulateDelay();
    return loadMatchesWithFilter(filter);
};

export const createMatchAsync = async (
    players: PlayerDataType[],
    serviceSide: string
): Promise<MatchDataType[]> => {
    await simulateDelay();
    return createMatch(players, serviceSide);
};

export const updateMatchAsync = async (
    id: number,
    players: PlayerDataType[],
    serviceSide: string,
    winner: string
): Promise<MatchDataType[]> => {
    await simulateDelay();
    return updateMatch(id, players, serviceSide, winner);
};
