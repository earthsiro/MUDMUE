import {
    advancePhaseManually,
    advanceTurnManually,
    applyPoolClick,
    applyRosterClick,
    awardBossPoint,
    createMatch,
    declareWinner,
    goToBoss,
    logAttempt,
    rollBosses,
} from "../../../helpers/wwDraftEngine";
import {
    archiveMatch,
    loadBosses,
    loadCharacters,
    loadCurrentMatch,
    loadTimerSettings,
    loadUndoSnapshot,
    saveCurrentMatch,
    saveTimerSettings,
    saveUndoSnapshot,
    toBossMap,
    toCharacterMap,
} from "../../../services/wwDraftService";
import type { DraftPlayer, DraftState, PhaseTimerSettings, WWBoss, WWCharacter } from "../../../types/wwDraft";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { DraftContext } from "./draftContext";

export const DraftProvider = ({ children }: { children: ReactNode }) => {
    const [characters, setCharacters] = useState<WWCharacter[]>(() => loadCharacters());
    const [bosses, setBosses] = useState<WWBoss[]>(() => loadBosses());
    const [match, setMatch] = useState<DraftState | null>(() => loadCurrentMatch());
    const [undoSnapshot, setUndoSnapshot] = useState<DraftState | null>(() => loadUndoSnapshot());
    const [timerSettings, setTimerSettings] = useState<PhaseTimerSettings>(() => loadTimerSettings());
    const [overrideMode, setOverrideMode] = useState(false);
    const [overridePlayer, setOverridePlayer] = useState<DraftPlayer>("P1");

    useEffect(() => {
        saveCurrentMatch(match);
    }, [match]);

    useEffect(() => {
        saveUndoSnapshot(undoSnapshot);
    }, [undoSnapshot]);

    const reloadPools = useCallback(() => {
        setCharacters(loadCharacters());
        setBosses(loadBosses());
    }, []);

    /** Every mutation goes through here so undo always has the previous state. */
    const commit = useCallback((mutate: (current: DraftState) => DraftState) => {
        setMatch((current) => {
            if (!current) return current;
            const next = mutate(current);
            if (next === current) return current;
            setUndoSnapshot(current);
            return next;
        });
    }, []);

    const startMatch = useCallback(
        (playerNames: [string, string]) => {
            setUndoSnapshot(null);
            setMatch(createMatch(characters.map((c) => c.id), playerNames));
        },
        [characters]
    );

    /**
     * ทิ้งแมตช์ปัจจุบัน — เก็บเข้าประวัติให้ก่อนถ้าเล่นไปแล้วจริง
     *
     * ปุ่ม "บันทึกลงประวัติ" โผล่เฉพาะใน Match Summary ของเฟส done แมตช์ที่แข่งจบ
     * แล้วแต่ยังไม่ได้กดปุ่มนั้น กด New Match ทับทีเดียวหายถาวร — archive ซ้ำได้อยู่แล้ว
     * เพราะ `archiveMatch` เขียนทับรายการที่ matchId เดียวกัน
     */
    const resetMatch = useCallback(() => {
        if (match && (match.phaseHistory.length > 0 || match.battleLog.length > 0)) {
            archiveMatch(match);
        }
        setUndoSnapshot(null);
        setMatch(null);
    }, [match]);

    const archiveCurrentMatch = useCallback(() => {
        setMatch((current) => {
            if (current) archiveMatch(current);
            return current;
        });
    }, []);

    const actionOptions = useMemo(
        () => ({ override: overrideMode, actingPlayer: overrideMode ? overridePlayer : undefined }),
        [overrideMode, overridePlayer]
    );

    const poolClick = useCallback(
        (characterId: string) => commit((s) => applyPoolClick(s, characterId, actionOptions)),
        [commit, actionOptions]
    );

    const rosterClick = useCallback(
        (characterId: string, owner: DraftPlayer) =>
            commit((s) => applyRosterClick(s, characterId, owner, actionOptions)),
        [commit, actionOptions]
    );

    const rollBossPool = useCallback(
        () => commit((s) => rollBosses(s, bosses.map((b) => b.id))),
        [commit, bosses]
    );

    const logBattleAttempt = useCallback(
        (player: DraftPlayer, charactersUsed: string[], result: "win" | "lose") =>
            commit((s) => logAttempt(s, player, charactersUsed, result)),
        [commit]
    );

    const awardPoint = useCallback(
        (player: DraftPlayer) => commit((s) => awardBossPoint(s, player)),
        [commit]
    );

    const setBossIndex = useCallback((index: number) => commit((s) => goToBoss(s, index)), [commit]);

    const declareMatchWinner = useCallback(
        (winner: DraftPlayer | "draw") => commit((s) => declareWinner(s, winner)),
        [commit]
    );

    const nextTurn = useCallback(() => commit((s) => advanceTurnManually(s)), [commit]);
    const nextPhase = useCallback(() => commit((s) => advancePhaseManually(s)), [commit]);

    const undo = useCallback(() => {
        setUndoSnapshot((snapshot) => {
            if (!snapshot) return null;
            setMatch(snapshot);
            return null;
        });
    }, []);

    const updateTimerSettings = useCallback((settings: PhaseTimerSettings) => {
        setTimerSettings(settings);
        saveTimerSettings(settings);
    }, []);

    const value = useMemo(
        () => ({
            characters,
            bosses,
            characterMap: toCharacterMap(characters),
            bossMap: toBossMap(bosses),
            reloadPools,
            match,
            startMatch,
            resetMatch,
            archiveCurrentMatch,
            poolClick,
            rosterClick,
            rollBossPool,
            logBattleAttempt,
            awardPoint,
            setBossIndex,
            declareMatchWinner,
            canUndo: Boolean(undoSnapshot),
            undo,
            overrideMode,
            setOverrideMode,
            overridePlayer,
            setOverridePlayer,
            nextTurn,
            nextPhase,
            timerSettings,
            updateTimerSettings,
        }),
        [
            characters,
            bosses,
            reloadPools,
            match,
            startMatch,
            resetMatch,
            archiveCurrentMatch,
            poolClick,
            rosterClick,
            rollBossPool,
            logBattleAttempt,
            awardPoint,
            setBossIndex,
            declareMatchWinner,
            undoSnapshot,
            undo,
            overrideMode,
            overridePlayer,
            nextTurn,
            nextPhase,
            timerSettings,
            updateTimerSettings,
        ]
    );

    return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};
