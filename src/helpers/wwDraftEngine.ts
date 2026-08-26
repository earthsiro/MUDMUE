import type { BattleAttempt, DraftPhase, DraftPlayer, DraftState, DraftTurn } from "../types/wwDraft";

/** Lives every character starts with once it lands on a roster. */
export const STARTING_LIVES = 3;
/** Attempts each player gets on a single boss before the boss is considered failed. */
export const ATTEMPTS_PER_BOSS = 3;
/** Boss-clear points needed to win the match. */
export const POINTS_TO_WIN = 3;
/** How many bosses are rolled for a match. */
export const BOSS_ROLL_COUNT = 5;

export const PHASE_ORDER: DraftPhase[] = [
    "ban1",
    "pick1",
    "ban2",
    "pick2",
    "lastban",
    "bossroll",
    "battle",
    "done",
];

export const PHASE_LABELS: Record<DraftPhase, string> = {
    ban1: "Ban 1",
    pick1: "Pick 1",
    ban2: "Ban 2",
    pick2: "Pick 2",
    lastban: "Last Ban",
    bossroll: "Boss Roll",
    battle: "Battle",
    done: "Done",
};

/** Exact turn sequences from the rule tables — order matters. */
export const TURN_TABLES: Record<"ban1" | "pick1" | "ban2" | "pick2" | "lastban", DraftTurn[]> = {
    // 3 bans each, from the shared pool
    ban1: [
        { player: "P1", count: 2 },
        { player: "P2", count: 2 },
        { player: "P1", count: 1 },
        { player: "P2", count: 1 },
    ],
    // 6 picks each
    pick1: [
        { player: "P1", count: 1 },
        { player: "P2", count: 1 },
        { player: "P1", count: 1 },
        { player: "P2", count: 2 },
        { player: "P1", count: 2 },
        { player: "P2", count: 2 },
        { player: "P1", count: 2 },
        { player: "P2", count: 1 },
    ],
    // 2 bans each, P2 starts
    ban2: [
        { player: "P2", count: 1 },
        { player: "P1", count: 1 },
        { player: "P2", count: 1 },
        { player: "P1", count: 1 },
    ],
    // 3 more picks each (6 -> 9), P2 starts
    pick2: [
        { player: "P2", count: 1 },
        { player: "P1", count: 2 },
        { player: "P2", count: 2 },
        { player: "P1", count: 1 },
    ],
    // each side strips 2 characters off the opponent's roster (9 -> 7)
    lastban: [
        { player: "P2", count: 2 },
        { player: "P1", count: 2 },
    ],
};

/** Every character the ban/pick tables consume out of the shared pool. */
export const MIN_POOL_SIZE = (["ban1", "pick1", "ban2", "pick2"] as const).reduce(
    (total, phase) => total + TURN_TABLES[phase].reduce((sum, turn) => sum + turn.count, 0),
    0
);

export const isDraftPickPhase = (phase: DraftPhase): phase is "pick1" | "pick2" =>
    phase === "pick1" || phase === "pick2";

export const isDraftBanPhase = (phase: DraftPhase): phase is "ban1" | "ban2" =>
    phase === "ban1" || phase === "ban2";

/** Phases that consume characters through a turn table. */
export const isTurnTablePhase = (phase: DraftPhase): phase is keyof typeof TURN_TABLES =>
    phase in TURN_TABLES;

export const getTurnTable = (phase: DraftPhase): DraftTurn[] =>
    isTurnTablePhase(phase) ? TURN_TABLES[phase] : [];

export const getCurrentTurn = (state: DraftState): DraftTurn | null => {
    const table = getTurnTable(state.phase);
    return table[state.turnIndex] ?? null;
};

/** Characters still to be taken in the current turn. */
export const getRemainingInTurn = (state: DraftState): number => {
    const turn = getCurrentTurn(state);
    if (!turn) return 0;
    return Math.max(0, turn.count - state.turnProgress);
};

export const getRosterOf = (state: DraftState, player: DraftPlayer): string[] =>
    player === "P1" ? state.rosterP1 : state.rosterP2;

export const getLastBannedOf = (state: DraftState, player: DraftPlayer): string[] =>
    player === "P1" ? state.lastBannedP1 : state.lastBannedP2;

export const getLivesOf = (state: DraftState, player: DraftPlayer): Record<string, number> =>
    player === "P1" ? state.livesP1 : state.livesP2;

/** Roster minus the characters the opponent stripped in the Last Ban phase. */
export const getActiveRoster = (state: DraftState, player: DraftPlayer): string[] => {
    const banned = getLastBannedOf(state, player);
    return getRosterOf(state, player).filter((id) => !banned.includes(id));
};

export const getOpponent = (player: DraftPlayer): DraftPlayer => (player === "P1" ? "P2" : "P1");

export const getPlayerName = (state: DraftState, player: DraftPlayer): string =>
    player === "P1" ? state.playerNames[0] : state.playerNames[1];

const nextPhase = (phase: DraftPhase): DraftPhase => {
    const index = PHASE_ORDER.indexOf(phase);
    if (index < 0 || index === PHASE_ORDER.length - 1) return phase;
    return PHASE_ORDER[index + 1];
};

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createMatch = (
    characterIds: string[],
    playerNames: [string, string] = ["Player 1", "Player 2"]
): DraftState => ({
    matchId: genId(),
    createdAt: new Date().toISOString(),
    playerNames,
    pool: [...characterIds],
    bannedPool: [],
    rosterP1: [],
    rosterP2: [],
    lastBannedP1: [],
    lastBannedP2: [],
    phase: "ban1",
    turnIndex: 0,
    turnProgress: 0,
    bossPoolRolled: [],
    currentBossIndex: 0,
    battleLog: [],
    phaseHistory: [],
    livesP1: {},
    livesP2: {},
    scoreP1: 0,
    scoreP2: 0,
});

/**
 * Move the turn pointer on after one character was taken. When the current turn
 * is used up we step to the next turn, and when the table runs out we step to
 * the next phase.
 */
const advanceAfterAction = (state: DraftState): DraftState => {
    const turn = getCurrentTurn(state);
    if (!turn) return state;

    const turnProgress = state.turnProgress + 1;
    if (turnProgress < turn.count) return { ...state, turnProgress };

    const table = getTurnTable(state.phase);
    const turnIndex = state.turnIndex + 1;
    if (turnIndex < table.length) return { ...state, turnIndex, turnProgress: 0 };

    return { ...state, phase: nextPhase(state.phase), turnIndex: 0, turnProgress: 0 };
};

/** Manual turn/phase step — used by override mode, where auto-advance is off. */
export const advanceTurnManually = (state: DraftState): DraftState => {
    const table = getTurnTable(state.phase);
    if (!table.length) {
        return { ...state, phase: nextPhase(state.phase), turnIndex: 0, turnProgress: 0 };
    }
    const turnIndex = state.turnIndex + 1;
    if (turnIndex < table.length) return { ...state, turnIndex, turnProgress: 0 };
    return { ...state, phase: nextPhase(state.phase), turnIndex: 0, turnProgress: 0 };
};

export const advancePhaseManually = (state: DraftState): DraftState => ({
    ...state,
    phase: nextPhase(state.phase),
    turnIndex: 0,
    turnProgress: 0,
});

// ---------------------------------------------------------------------------
// Click guards — the draft screen only lets through what the rules allow
// ---------------------------------------------------------------------------

/** Can this shared-pool character be clicked right now? */
export const canClickPoolCharacter = (state: DraftState, characterId: string, override = false): boolean => {
    if (!state.pool.includes(characterId)) return false;
    if (override) return isTurnTablePhase(state.phase) && state.phase !== "lastban";
    if (!isDraftBanPhase(state.phase) && !isDraftPickPhase(state.phase)) return false;
    return getRemainingInTurn(state) > 0;
};

/** Can this character be stripped off `owner`'s roster right now? */
export const canClickRosterCharacter = (
    state: DraftState,
    characterId: string,
    owner: DraftPlayer,
    override = false
): boolean => {
    if (state.phase !== "lastban") return false;
    if (!getRosterOf(state, owner).includes(characterId)) return false;
    if (getLastBannedOf(state, owner).includes(characterId)) return false;
    if (override) return true;
    const turn = getCurrentTurn(state);
    if (!turn) return false;
    // the acting player bans from the *opponent's* roster
    if (getOpponent(turn.player) !== owner) return false;
    return getRemainingInTurn(state) > 0;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ActionOptions = {
    override?: boolean;
    /** who the action is attributed to — defaults to whoever's turn it is */
    actingPlayer?: DraftPlayer;
};

const logAction = (
    state: DraftState,
    action: Omit<DraftState["phaseHistory"][number], "timestamp">
): DraftState => ({
    ...state,
    phaseHistory: [...state.phaseHistory, { ...action, timestamp: new Date().toISOString() }],
});

/**
 * Ban or pick a character out of the shared pool, depending on the current phase.
 * In override mode the turn pointer is left alone — the caster steps it manually.
 */
export const applyPoolClick = (
    state: DraftState,
    characterId: string,
    { override = false, actingPlayer }: ActionOptions = {}
): DraftState => {
    const turn = getCurrentTurn(state);
    const player = actingPlayer ?? turn?.player;
    if (!player) return state;
    if (!state.pool.includes(characterId)) return state;

    let next: DraftState = { ...state, pool: state.pool.filter((id) => id !== characterId) };

    if (isDraftBanPhase(state.phase)) {
        next = { ...next, bannedPool: [...next.bannedPool, characterId] };
        next = logAction(next, {
            kind: "ban",
            phase: state.phase,
            player,
            characterIds: [characterId],
            override,
        });
    } else if (isDraftPickPhase(state.phase)) {
        if (player === "P1") {
            next = {
                ...next,
                rosterP1: [...next.rosterP1, characterId],
                livesP1: { ...next.livesP1, [characterId]: STARTING_LIVES },
            };
        } else {
            next = {
                ...next,
                rosterP2: [...next.rosterP2, characterId],
                livesP2: { ...next.livesP2, [characterId]: STARTING_LIVES },
            };
        }
        next = logAction(next, {
            kind: "pick",
            phase: state.phase,
            player,
            characterIds: [characterId],
            override,
        });
    } else {
        return state;
    }

    return override ? next : advanceAfterAction(next);
};

/** Last Ban: strip a character off `owner`'s roster. */
export const applyRosterClick = (
    state: DraftState,
    characterId: string,
    owner: DraftPlayer,
    { override = false, actingPlayer }: ActionOptions = {}
): DraftState => {
    if (state.phase !== "lastban") return state;
    if (!getRosterOf(state, owner).includes(characterId)) return state;
    if (getLastBannedOf(state, owner).includes(characterId)) return state;

    const turn = getCurrentTurn(state);
    const player = actingPlayer ?? turn?.player ?? getOpponent(owner);

    let next: DraftState =
        owner === "P1"
            ? { ...state, lastBannedP1: [...state.lastBannedP1, characterId] }
            : { ...state, lastBannedP2: [...state.lastBannedP2, characterId] };

    next = logAction(next, {
        kind: "lastban",
        phase: state.phase,
        player,
        characterIds: [characterId],
        override,
        note: `from ${getPlayerName(state, owner)}'s roster`,
    });

    return override ? next : advanceAfterAction(next);
};

/** Pick `count` unique bosses at random and lock them in as the match's boss order. */
export const rollBosses = (state: DraftState, bossIds: string[], count = BOSS_ROLL_COUNT): DraftState => {
    const shuffled = [...bossIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const rolled = shuffled.slice(0, Math.min(count, shuffled.length));
    const next: DraftState = {
        ...state,
        bossPoolRolled: rolled,
        currentBossIndex: 0,
        phase: state.phase === "bossroll" ? "battle" : state.phase,
        turnIndex: 0,
        turnProgress: 0,
    };
    return logAction(next, {
        kind: "bossroll",
        phase: "bossroll",
        player: "system",
        characterIds: rolled,
    });
};

export const getAttemptsForBoss = (state: DraftState, bossIndex: number, player: DraftPlayer): number =>
    state.battleLog.filter((a) => a.bossIndex === bossIndex && a.player === player).length;

/** True once both sides have burned their allowance on the current boss with no win. */
export const isBossFailedByBoth = (state: DraftState, bossIndex: number): boolean => {
    const attempts = state.battleLog.filter((a) => a.bossIndex === bossIndex);
    if (attempts.some((a) => a.result === "win")) return false;
    return (
        getAttemptsForBoss(state, bossIndex, "P1") >= ATTEMPTS_PER_BOSS &&
        getAttemptsForBoss(state, bossIndex, "P2") >= ATTEMPTS_PER_BOSS
    );
};

const withWinnerCheck = (state: DraftState): DraftState => {
    if (state.winner) return state;
    if (state.scoreP1 >= POINTS_TO_WIN) return { ...state, winner: "P1", phase: "done" };
    if (state.scoreP2 >= POINTS_TO_WIN) return { ...state, winner: "P2", phase: "done" };
    return state;
};

/**
 * Rebuild a player's remaining lives from the battle log instead of decrementing
 * in place.
 *
 * A boss neither side could clear costs nobody anything — the attempts spent on
 * it are refunded. That refund cannot be expressed by decrementing as you go,
 * because a boss only becomes "failed by both" *after* the lives were already
 * taken, and it can stop being failed again if someone later clears it during
 * the last-boss retry. Deriving the whole map keeps every one of those cases
 * right for free.
 */
const recomputeLives = (state: DraftState, player: DraftPlayer): Record<string, number> => {
    const lives: Record<string, number> = {};
    Object.keys(getLivesOf(state, player)).forEach((id) => {
        lives[id] = STARTING_LIVES;
    });

    state.battleLog
        .filter((a) => a.player === player && !isBossFailedByBoth(state, a.bossIndex))
        .forEach((a) =>
            a.charactersUsed.forEach((id) => {
                lives[id] = Math.max(0, (lives[id] ?? STARTING_LIVES) - 1);
            })
        );

    return lives;
};

/**
 * Log one boss attempt. Every character in the lineup spends a life for that
 * player, win or lose — unless the boss ends up cleared by nobody, in which case
 * the whole boss is refunded to both sides. A win clears the boss: the player
 * scores and the match rolls on to the next boss.
 */
export const logAttempt = (
    state: DraftState,
    player: DraftPlayer,
    charactersUsed: string[],
    result: "win" | "lose"
): DraftState => {
    const bossIndex = state.currentBossIndex;
    const attempt: BattleAttempt = {
        bossIndex,
        attemptNumberForBoss: getAttemptsForBoss(state, bossIndex, player) + 1,
        player,
        charactersUsed: [...charactersUsed],
        result,
        timestamp: new Date().toISOString(),
    };

    let next: DraftState = {
        ...state,
        battleLog: [...state.battleLog, attempt],
    };

    next = { ...next, livesP1: recomputeLives(next, "P1"), livesP2: recomputeLives(next, "P2") };

    let skippedFrom: number | null = null;

    if (result === "win") {
        next =
            player === "P1"
                ? { ...next, scoreP1: next.scoreP1 + 1 }
                : { ...next, scoreP2: next.scoreP2 + 1 };
        next = { ...next, currentBossIndex: Math.min(next.currentBossIndex + 1, Math.max(0, next.bossPoolRolled.length - 1)) };
    } else if (isBossFailedByBoth(next, bossIndex) && bossIndex < next.bossPoolRolled.length - 1) {
        // nobody could clear it — move on to the next boss
        next = { ...next, currentBossIndex: bossIndex + 1 };
        skippedFrom = bossIndex;
    }

    next = logAction(next, {
        kind: "attempt",
        phase: "battle",
        player,
        characterIds: charactersUsed,
        note: result === "win" ? "win" : "lose",
    });

    /* The skip is silent otherwise — the board just swaps boss and nobody scores.
       Log it so the caster's log and the match history both show why. */
    if (skippedFrom !== null) {
        next = logAction(next, {
            kind: "system",
            phase: "battle",
            player: "system",
            characterIds: [],
            note: `แพ้ทั้งคู่ที่บอสตัวที่ ${skippedFrom + 1} — ข้ามไปบอสตัวที่ ${skippedFrom + 2} ไม่มีใครได้แต้ม และคืนจำนวนครั้งที่ใช้ตัวละครให้ทั้งสองฝั่ง`,
        });
    }

    return withWinnerCheck(next);
};

/** Caster override: hand a boss-clear point to a player without logging an attempt. */
export const awardBossPoint = (state: DraftState, player: DraftPlayer): DraftState => {
    const next: DraftState =
        player === "P1"
            ? { ...state, scoreP1: state.scoreP1 + 1 }
            : { ...state, scoreP2: state.scoreP2 + 1 };
    return withWinnerCheck(
        logAction(next, {
            kind: "system",
            phase: state.phase,
            player,
            characterIds: [],
            note: "manual point",
        })
    );
};

export const goToBoss = (state: DraftState, bossIndex: number): DraftState => ({
    ...state,
    currentBossIndex: Math.max(0, Math.min(bossIndex, Math.max(0, state.bossPoolRolled.length - 1))),
});

export const declareWinner = (state: DraftState, winner: DraftPlayer | "draw"): DraftState =>
    logAction({ ...state, winner, phase: "done" }, {
        kind: "system",
        phase: state.phase,
        player: winner === "draw" ? "system" : winner,
        characterIds: [],
        note: `declared ${winner}`,
    });

/** How many of the rolled bosses ended with neither side clearing them. */
export const countBossesFailedByBoth = (state: DraftState): number =>
    state.bossPoolRolled.reduce((count, _, index) => (isBossFailedByBoth(state, index) ? count + 1 : count), 0);

/**
 * The boss immediately before the current one was failed by both sides, and
 * nothing has been logged on the new boss yet — i.e. the board *just* skipped
 * forward with no point awarded. Derived from state rather than a transient
 * flag, so it survives reload and undo. Returns that boss's index, or null.
 */
export const getJustSkippedBoss = (state: DraftState): number | null => {
    const previous = state.currentBossIndex - 1;
    if (previous < 0) return null;
    if (!isBossFailedByBoth(state, previous)) return null;
    if (state.battleLog.some((attempt) => attempt.bossIndex === state.currentBossIndex)) return null;
    return previous;
};

/** True when the last boss is exhausted with no winner — the caster has to rule on it. */
export const isDoubleLossEdgeCase = (state: DraftState): boolean => {
    const lastIndex = state.bossPoolRolled.length - 1;
    if (lastIndex < 0) return false;
    if (state.currentBossIndex !== lastIndex) return false;
    return isBossFailedByBoth(state, lastIndex);
};
