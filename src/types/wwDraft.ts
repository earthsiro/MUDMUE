export type WWCharacter = {
    id: string;
    name: string;
    imageUrl: string; // local asset path, remote URL or data-URI
    element?: string;
    weaponType?: string;
    rarity?: number;
};

export type WWBoss = {
    id: string;
    name: string;
    imageUrl: string;
};

export type DraftPhase = "ban1" | "pick1" | "ban2" | "pick2" | "lastban" | "bossroll" | "battle" | "done";

export type DraftPlayer = "P1" | "P2";

export type BattleAttempt = {
    bossIndex: number; // 0-4
    attemptNumberForBoss: number;
    player: DraftPlayer;
    charactersUsed: string[]; // each of these gets -1 life for that player on log
    result: "win" | "lose";
    timestamp: string;
};

export type DraftActionKind = "ban" | "pick" | "lastban" | "bossroll" | "attempt" | "system";

export type DraftAction = {
    kind: DraftActionKind;
    phase: DraftPhase;
    player: DraftPlayer | "system";
    characterIds: string[];
    /** true when the action was made while override mode was on */
    override?: boolean;
    /** free-text note for system actions (award point, declare winner, ...) */
    note?: string;
    timestamp: string;
};

export type DraftState = {
    matchId: string;
    createdAt: string;
    playerNames: [string, string]; // [P1, P2]
    pool: string[]; // remaining character ids in shared pool
    bannedPool: string[]; // characters banned from shared pool (ban1 + ban2)
    rosterP1: string[];
    rosterP2: string[];
    lastBannedP1: string[]; // banned FROM P1's roster by P2
    lastBannedP2: string[];
    phase: DraftPhase;
    turnIndex: number; // pointer into the current phase's turn sequence
    /** how many characters have already been taken inside the current turn */
    turnProgress: number;
    bossPoolRolled: string[]; // 5 rolled boss ids, in order
    currentBossIndex: number;
    battleLog: BattleAttempt[];
    phaseHistory: DraftAction[]; // for undo / summary
    livesP1: Record<string, number>; // characterId -> remaining lives (starts at 3)
    livesP2: Record<string, number>;
    /** boss-clear points, first to 3 wins the match */
    scoreP1: number;
    scoreP2: number;
    /** set automatically at 3 points, or manually by the caster on the double-loss edge case */
    winner?: DraftPlayer | "draw";
};

export type PhaseTimerSettings = {
    ban1Minutes: number;
    pick1Minutes: number;
    ban2Minutes: number;
    pick2Minutes: number;
    lastbanMinutes: number;
    bossrollMinutes: number;
    battleAttemptMinutes?: number; // optional, per-attempt timer during battle
};

/** One entry of a phase's turn table: whose turn it is and how many characters they take. */
export type DraftTurn = {
    player: DraftPlayer;
    count: number;
};
