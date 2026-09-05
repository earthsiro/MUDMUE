import {
    ATTEMPTS_PER_BOSS,
    MIN_POOL_SIZE,
    POINTS_TO_WIN,
    STARTING_LIVES,
    TURN_TABLES,
    applyPoolClick,
    applyRosterClick,
    canClickPoolCharacter,
    canClickRosterCharacter,
    countBossesFailedByBoth,
    createMatch,
    declareWinner,
    getActiveRoster,
    getCurrentTurn,
    getRemainingInTurn,
    logAttempt,
} from "./wwDraftEngine";
import { describe, expect, it } from "vitest";

import type { DraftState } from "../types/wwDraft";

/**
 * The draft rules live entirely in this engine — the board only renders what it
 * returns. These tests pin the rule tables and the two rules that are easy to
 * break by accident: the turn pointer, and the life refund on a boss nobody
 * cleared (which is derived from the log, not decremented in place).
 */

const pool = (count: number): string[] => Array.from({ length: count }, (_, i) => `c${i + 1}`);

const turnTotal = (phase: keyof typeof TURN_TABLES, player: "P1" | "P2") =>
    TURN_TABLES[phase].filter((turn) => turn.player === player).reduce((sum, turn) => sum + turn.count, 0);

/** Click through a whole phase's turn table, taking whatever is on top of the pool. */
const playOutPhase = (state: DraftState): DraftState => {
    let current = state;
    const startingPhase = current.phase;
    let guard = 0;
    while (current.phase === startingPhase && guard++ < 100) {
        current = applyPoolClick(current, current.pool[0]);
    }
    return current;
};

describe("rule tables", () => {
    it("gives both players the same number of bans and picks in every phase", () => {
        expect([turnTotal("ban1", "P1"), turnTotal("ban1", "P2")]).toEqual([3, 3]);
        expect([turnTotal("pick1", "P1"), turnTotal("pick1", "P2")]).toEqual([6, 6]);
        expect([turnTotal("ban2", "P1"), turnTotal("ban2", "P2")]).toEqual([2, 2]);
        expect([turnTotal("pick2", "P1"), turnTotal("pick2", "P2")]).toEqual([3, 3]);
        expect([turnTotal("lastban", "P1"), turnTotal("lastban", "P2")]).toEqual([2, 2]);
    });

    it("hands each side a 9-character roster before Last Ban strips it to 7", () => {
        expect(turnTotal("pick1", "P1") + turnTotal("pick2", "P1")).toBe(9);
        expect(turnTotal("pick1", "P1") + turnTotal("pick2", "P1") - turnTotal("lastban", "P2")).toBe(7);
    });

    it("P2 opens the second ban and pick phases", () => {
        expect(TURN_TABLES.ban2[0].player).toBe("P2");
        expect(TURN_TABLES.pick2[0].player).toBe("P2");
    });

    it("needs a pool big enough for every ban and pick to come out of it", () => {
        expect(MIN_POOL_SIZE).toBe(28);
    });
});

describe("turn pointer", () => {
    it("starts a new match on Ban 1 with P1 taking two", () => {
        const match = createMatch(pool(30));

        expect(match.phase).toBe("ban1");
        expect(match.pool).toHaveLength(30);
        expect(getCurrentTurn(match)).toEqual({ player: "P1", count: 2 });
        expect(getRemainingInTurn(match)).toBe(2);
    });

    it("stays on the same turn until its count is used up", () => {
        const match = applyPoolClick(createMatch(pool(30)), "c1");

        expect(getCurrentTurn(match)?.player).toBe("P1");
        expect(getRemainingInTurn(match)).toBe(1);
        expect(match.pool).not.toContain("c1");
        expect(match.bannedPool).toEqual(["c1"]);
    });

    it("moves to the opponent once a turn is spent", () => {
        let match = createMatch(pool(30));
        match = applyPoolClick(match, "c1");
        match = applyPoolClick(match, "c2");

        expect(getCurrentTurn(match)?.player).toBe("P2");
        expect(getRemainingInTurn(match)).toBe(2);
    });

    it("rolls into the next phase when the table runs out", () => {
        const match = playOutPhase(createMatch(pool(30)));

        expect(match.phase).toBe("pick1");
        expect(match.bannedPool).toHaveLength(6);
        expect(match.pool).toHaveLength(24);
        expect(getCurrentTurn(match)).toEqual({ player: "P1", count: 1 });
    });

    it("leaves the pointer alone in override mode so the caster steps it manually", () => {
        const match = applyPoolClick(createMatch(pool(30)), "c1", { override: true, actingPlayer: "P2" });

        expect(match.turnProgress).toBe(0);
        expect(match.bannedPool).toEqual(["c1"]);
        expect(match.phaseHistory[0]).toMatchObject({ player: "P2", override: true });
    });
});

describe("picking", () => {
    it("puts picks on the acting player's roster with a full set of lives", () => {
        let match = playOutPhase(createMatch(pool(30))); // through Ban 1
        const firstPick = match.pool[0];
        match = applyPoolClick(match, firstPick);

        expect(match.rosterP1).toEqual([firstPick]);
        expect(match.rosterP2).toEqual([]);
        expect(match.livesP1[firstPick]).toBe(STARTING_LIVES);
    });

    it("fills both rosters to six by the end of Pick 1", () => {
        const match = playOutPhase(playOutPhase(createMatch(pool(30))));

        expect(match.phase).toBe("ban2");
        expect(match.rosterP1).toHaveLength(6);
        expect(match.rosterP2).toHaveLength(6);
    });

    it("ignores a character that is not in the shared pool", () => {
        const match = createMatch(pool(30));
        expect(applyPoolClick(match, "not-a-character")).toBe(match);
    });
});

describe("click guards", () => {
    it("only lets the pool be clicked during a ban or pick phase", () => {
        const match = createMatch(pool(30));

        expect(canClickPoolCharacter(match, "c1")).toBe(true);
        expect(canClickPoolCharacter(match, "nope")).toBe(false);
        expect(canClickPoolCharacter({ ...match, phase: "lastban" }, "c1")).toBe(false);
        expect(canClickPoolCharacter({ ...match, phase: "battle" }, "c1")).toBe(false);
    });

    it("override opens the pool up but still not during Last Ban", () => {
        const match = createMatch(pool(30));

        expect(canClickPoolCharacter({ ...match, turnIndex: 99 }, "c1", true)).toBe(true);
        expect(canClickPoolCharacter({ ...match, phase: "lastban" }, "c1", true)).toBe(false);
    });

    it("Last Ban only lets a player strip the opponent's roster, once each", () => {
        const match: DraftState = {
            ...createMatch([]),
            phase: "lastban",
            rosterP1: ["a1", "a2"],
            rosterP2: ["b1", "b2"],
        };

        // the table opens with P2, who bans from P1's roster
        expect(canClickRosterCharacter(match, "a1", "P1")).toBe(true);
        expect(canClickRosterCharacter(match, "b1", "P2")).toBe(false);

        const afterBan = applyRosterClick(match, "a1", "P1");
        expect(afterBan.lastBannedP1).toEqual(["a1"]);
        expect(canClickRosterCharacter(afterBan, "a1", "P1")).toBe(false);
    });

    it("keeps stripped characters on the roster but out of the active roster", () => {
        const match: DraftState = {
            ...createMatch([]),
            phase: "lastban",
            rosterP1: ["a1", "a2", "a3"],
            lastBannedP1: ["a2"],
        };

        expect(match.rosterP1).toContain("a2");
        expect(getActiveRoster(match, "P1")).toEqual(["a1", "a3"]);
    });
});

describe("battle", () => {
    const battleState = (): DraftState => ({
        ...createMatch([]),
        phase: "battle",
        bossPoolRolled: ["b1", "b2", "b3", "b4", "b5"],
        rosterP1: ["p1a", "p1b"],
        rosterP2: ["p2a"],
        livesP1: { p1a: STARTING_LIVES, p1b: STARTING_LIVES },
        livesP2: { p2a: STARTING_LIVES },
    });

    it("spends a life for every character in the lineup, win or lose", () => {
        const lost = logAttempt(battleState(), "P1", ["p1a", "p1b"], "lose");
        expect(lost.livesP1).toEqual({ p1a: 2, p1b: 2 });

        const won = logAttempt(battleState(), "P1", ["p1a"], "win");
        expect(won.livesP1).toEqual({ p1a: 2, p1b: STARTING_LIVES });
    });

    it("scores a point and moves to the next boss on a win", () => {
        const match = logAttempt(battleState(), "P2", ["p2a"], "win");

        expect(match.scoreP2).toBe(1);
        expect(match.scoreP1).toBe(0);
        expect(match.currentBossIndex).toBe(1);
    });

    it("stays on the boss while either side still has attempts left", () => {
        let match = battleState();
        match = logAttempt(match, "P1", ["p1a"], "lose");
        match = logAttempt(match, "P2", ["p2a"], "lose");

        expect(match.currentBossIndex).toBe(0);
        expect(countBossesFailedByBoth(match)).toBe(0);
    });

    it("refunds every life spent on a boss neither side could clear", () => {
        let match = battleState();
        for (let i = 0; i < ATTEMPTS_PER_BOSS; i++) {
            match = logAttempt(match, "P1", ["p1a"], "lose");
            match = logAttempt(match, "P2", ["p2a"], "lose");
        }

        expect(match.livesP1.p1a).toBe(STARTING_LIVES);
        expect(match.livesP2.p2a).toBe(STARTING_LIVES);
        expect(match.scoreP1).toBe(0);
        expect(match.scoreP2).toBe(0);
        expect(match.currentBossIndex).toBe(1);
        expect(countBossesFailedByBoth(match)).toBe(1);
    });

    it("ends the match at three boss clears", () => {
        let match = battleState();
        for (let i = 0; i < POINTS_TO_WIN; i++) {
            match = logAttempt(match, "P1", ["p1a"], "win");
        }

        expect(match.scoreP1).toBe(POINTS_TO_WIN);
        expect(match.winner).toBe("P1");
        expect(match.phase).toBe("done");
    });

    it("lets the caster rule on the match directly", () => {
        const match = declareWinner(battleState(), "draw");

        expect(match.winner).toBe("draw");
        expect(match.phase).toBe("done");
    });
});
