import type { DraftPlayer, DraftState, PhaseTimerSettings, WWBoss, WWCharacter } from "../../../types/wwDraft";

import { createContext, useContext } from "react";

export type DraftContextValue = {
    /** pools */
    characters: WWCharacter[];
    bosses: WWBoss[];
    characterMap: Record<string, WWCharacter>;
    bossMap: Record<string, WWBoss>;
    reloadPools: () => void;

    /** match */
    match: DraftState | null;
    startMatch: (playerNames: [string, string]) => void;
    resetMatch: () => void;
    archiveCurrentMatch: () => void;

    /** draft actions */
    poolClick: (characterId: string) => void;
    rosterClick: (characterId: string, owner: DraftPlayer) => void;
    rollBossPool: () => void;
    logBattleAttempt: (player: DraftPlayer, charactersUsed: string[], result: "win" | "lose") => void;
    awardPoint: (player: DraftPlayer) => void;
    setBossIndex: (index: number) => void;
    declareMatchWinner: (winner: DraftPlayer | "draw") => void;

    /** undo (one step) */
    canUndo: boolean;
    undo: () => void;

    /** override mode */
    overrideMode: boolean;
    setOverrideMode: (on: boolean) => void;
    overridePlayer: DraftPlayer;
    setOverridePlayer: (player: DraftPlayer) => void;
    nextTurn: () => void;
    nextPhase: () => void;

    /** timer settings */
    timerSettings: PhaseTimerSettings;
    updateTimerSettings: (settings: PhaseTimerSettings) => void;
};

export const DraftContext = createContext<DraftContextValue | null>(null);

export const useDraft = (): DraftContextValue => {
    const ctx = useContext(DraftContext);
    if (!ctx) throw new Error("useDraft must be used inside <DraftProvider>");
    return ctx;
};
