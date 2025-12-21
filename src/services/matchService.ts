import MockData from "./mockDashboardData";

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
            let valA = a[filter.orderBy!];
            let valB = b[filter.orderBy!];

            // ถ้า field เป็น number หรือ date ให้แปลงก่อน
            if (filter.orderBy === "createDate" || filter.orderBy === "updateDate") {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            // ถ้า orderDirection เป็น desc สลับลำดับ
            if (filter.orderDirection === "desc") {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            } else {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            }
        });
    }
    console.log("loadMatchesWithFilter result:", result);
    return result;
};

export const saveHistories = (list: MatchDataType[]) => {
    localStorage.setItem("mudmue_history", JSON.stringify(list));
};

// export const addHistory = (players: PlayerDataType[], serviceSide: string, winner: string): MatchDataType[] => {
//     const list = loadHistories();
//     const maxId = list.length ? Math.max(...list.map((h) => h.id)) : 0;
//     const newHistory: MatchDataType = {
//         id: maxId + 1,
//         player: players,
//         serviceSide,
//         winner,
//         createDate: new Date().toISOString(),
//         updateDate: new Date().toISOString(),
//     };
//     return [...list, newHistory];
// };

// export const updateHistory = (
//     id: number,
//     players: PlayerDataType[],
//     serviceSide: string,
//     winner: string
// ): MatchDataType[] => {
//     const list = loadHistories();
//     return list.map((h) => {
//         const now = new Date().toISOString();
//         return h.id === id ? { ...h, player: players, serviceSide, winner, updateDate: now } : h;
//     });
// };

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
    const newList = list.map((h) => {
        const now = new Date().toISOString();
        return h.id === id ? { ...h, player: players, serviceSide, winner, updateDate: now } : h;
    });
    saveHistories(newList);
    return newList;
};

export const deleteHistory = (list: MatchDataType[], id: number): MatchDataType[] => {
    return list.filter((h) => h.id !== id);
};

export const getMockMatches = (): MatchDataType[] => {
    return MockData;
};
