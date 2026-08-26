import {
    ATTEMPTS_PER_BOSS,
    getActiveRoster,
    getAttemptsForBoss,
    getJustSkippedBoss,
    getLivesOf,
    getPlayerName,
    isBossFailedByBoth,
    isDoubleLossEdgeCase,
} from "../../../helpers/wwDraftEngine";
import { WWBadge, WWButton, WWPanel, WWPanelTitle, wwFramed, wwTheme } from "../ww-draft.styles";

import type { BattleAttempt, DraftPlayer } from "../../../types/wwDraft";

import { CharacterTile } from "./CharacterTile";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";
import { useState } from "react";

/* Both rosters at once. auto-fit means the pair sits side by side whenever the
   panel can afford ~240px a side and folds to one column when it cannot — no
   breakpoint to keep in sync with the board's own 1100px collapse. */
const Sides = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    margin-bottom: 10px;
`;

/* แถบสีฝั่งหนา 5px ที่ขอบบน ทำด้วย gradient ในชั้นขอบ แล้วหดพื้นลงมา 5px
   เพราะ border-top ปกติจะโดนมุมตัดของ clip-path เฉือนหาย */
const Side = styled.div<{ $accent: string }>`
    ${({ $accent }) =>
        wwFramed("12px", `linear-gradient(${$accent} 0 5px, ${wwTheme.cardLine} 5px)`, wwTheme.panelSoft, "1px")}
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;

    &::after {
        inset: 5px 1px 1px;
    }
`;

const SideHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const SideName = styled.div<{ $accent: string }>`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: ${({ $accent }) => $accent};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
    gap: 12px 6px;
`;

const SideFoot = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-top: auto;
`;

const SelectedCount = styled.span<{ $accent: string; $any: boolean }>`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 12px;
    color: ${({ $accent, $any }) => ($any ? $accent : wwTheme.textDim)};
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
`;

const LogList = styled.ol`
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    max-height: 180px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

/* A win is marked by the accent edge; a loss stays neutral — the system has one
   hot colour, so "notable" reads as accent rather than as a second hue. */
const LogRow = styled.li<{ $win: boolean }>`
    font-size: 12px;
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 6px 8px;
    border-radius: ${wwTheme.radiusSm};
    background: ${wwTheme.surface};
    border-left: 3px solid ${({ $win }) => ($win ? wwTheme.accent : wwTheme.neutral400)};
    color: ${wwTheme.neutral700};
`;

/** The boss changing hands with nobody scoring is an event in its own right, so
    it gets its own row rather than being inferred from two 3/3 counters. */
const SkipRow = styled.li`
    font-size: 12px;
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 6px 8px;
    border-radius: ${wwTheme.radiusSm};
    background: ${wwTheme.neutral200};
    border-left: 3px solid ${wwTheme.text};
    color: ${wwTheme.neutral800};
    font-weight: 600;
`;

const Warn = styled.p`
    margin: 8px 0 0;
    font-size: 12px;
    color: ${wwTheme.warn};
`;

/* A boss nobody cleared belongs to neither side, so this reads in ink rather
   than in either player's colour. */
const SkipNotice = styled.div`
    display: flex;
    gap: 10px;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding: 10px 14px;
    border: 2px solid ${wwTheme.text};
    border-left-width: 8px;
    border-radius: ${wwTheme.radiusMd};
    background: ${wwTheme.neutral200};
    font-size: 13px;
    color: ${wwTheme.neutral800};
`;

const SkipTitle = styled.strong`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${wwTheme.text};
`;

export const BattleTracker = () => {
    const { match, characterMap, bossMap, logBattleAttempt, awardPoint, declareMatchWinner, setBossIndex } = useDraft();
    /** One selection list per side — both are on screen, so they cannot share one. */
    const [selected, setSelected] = useState<Record<DraftPlayer, string[]>>({ P1: [], P2: [] });

    if (!match) return null;

    const bossId = match.bossPoolRolled[match.currentBossIndex];
    const boss = bossId ? bossMap[bossId] : undefined;
    const edgeCase = isDoubleLossEdgeCase(match);
    const skipped = getJustSkippedBoss(match);
    const skippedBossName = skipped !== null ? bossMap[match.bossPoolRolled[skipped]]?.name : undefined;

    /* Attempts interleaved with the "nobody cleared it" moments, so the log reads
       as the story of the match rather than as a flat list of attempts. A skip is
       announced after the attempt that exhausted the second side's allowance. */
    const lastBossIndex = match.bossPoolRolled.length - 1;
    const logEntries: ({ kind: "attempt"; attempt: BattleAttempt } | { kind: "skip"; bossIndex: number })[] = [];
    match.battleLog.forEach((attempt, i) => {
        logEntries.push({ kind: "attempt", attempt });
        const isLastOfItsBoss = !match.battleLog.slice(i + 1).some((a) => a.bossIndex === attempt.bossIndex);
        if (isLastOfItsBoss && attempt.bossIndex < lastBossIndex && isBossFailedByBoth(match, attempt.bossIndex)) {
            logEntries.push({ kind: "skip", bossIndex: attempt.bossIndex });
        }
    });

    const toggle = (player: DraftPlayer, id: string) =>
        setSelected((current) => ({
            ...current,
            [player]: current[player].includes(id)
                ? current[player].filter((x) => x !== id)
                : [...current[player], id],
        }));

    const clear = (player: DraftPlayer) => setSelected((current) => ({ ...current, [player]: [] }));

    const submit = (player: DraftPlayer, result: "win" | "lose") => {
        const picks = selected[player];
        if (!picks.length) return;
        logBattleAttempt(player, picks, result);
        clear(player);
    };

    const renderSide = (player: DraftPlayer) => {
        const accent = player === "P1" ? wwTheme.p1 : wwTheme.p2;
        const roster = getActiveRoster(match, player);
        const lives = getLivesOf(match, player);
        const picks = selected[player];
        const attemptsUsed = getAttemptsForBoss(match, match.currentBossIndex, player);
        const overAttemptLimit = attemptsUsed >= ATTEMPTS_PER_BOSS;
        const usedOutOfLives = picks.filter((id) => (lives[id] ?? 0) <= 0);

        return (
            <Side key={player} $accent={accent}>
                <SideHead>
                    <SideName $accent={accent}>{getPlayerName(match, player)}</SideName>
                    <WWBadge color={accent}>
                        ลองแล้ว {attemptsUsed}/{ATTEMPTS_PER_BOSS}
                    </WWBadge>
                </SideHead>

                <Grid>
                    {roster.map((id) => {
                        const order = picks.indexOf(id);
                        return (
                            <CharacterTile
                                key={id}
                                character={characterMap[id]}
                                state="available"
                                size="sm"
                                accent={accent}
                                selectionIndex={order >= 0 ? order + 1 : undefined}
                                dimmed={picks.length > 0}
                                lives={lives[id] ?? 3}
                                onClick={() => toggle(player, id)}
                            />
                        );
                    })}
                </Grid>

                <SideFoot>
                    <SelectedCount $accent={accent} $any={picks.length > 0}>
                        เลือกแล้ว {picks.length} ตัว
                    </SelectedCount>
                    <WWButton
                        type="button"
                        tone="primary"
                        title="บันทึกว่าชนะ"
                        onClick={() => submit(player, "win")}
                        disabled={!picks.length}
                    >
                        ชนะ
                    </WWButton>
                    <WWButton
                        type="button"
                        tone="danger"
                        title="บันทึกว่าแพ้"
                        onClick={() => submit(player, "lose")}
                        disabled={!picks.length}
                    >
                        แพ้
                    </WWButton>
                    <WWButton type="button" tone="ghost" onClick={() => clear(player)} disabled={!picks.length}>
                        ล้าง
                    </WWButton>
                </SideFoot>

                {usedOutOfLives.length > 0 && (
                    <Warn>
                        ⚠ {usedOutOfLives.map((id) => characterMap[id]?.name ?? id).join(", ")} ใช้ครบ 3 ครั้งแล้ว —
                        ระบบยังให้บันทึกได้ แต่ผิดกติกา
                    </Warn>
                )}
                {overAttemptLimit && <Warn>⚠ ฝั่งนี้ลองครบ {ATTEMPTS_PER_BOSS} ครั้งกับบอสตัวนี้แล้ว</Warn>}
            </Side>
        );
    };

    if (!match.bossPoolRolled.length) {
        return (
            <WWPanel>
                <WWPanelTitle>Battle</WWPanelTitle>
                <p style={{ fontSize: 13, color: wwTheme.textDim, margin: 0 }}>สุ่มบอสก่อนจึงจะเริ่มบันทึกผลได้</p>
            </WWPanel>
        );
    }

    return (
        <WWPanel>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <WWPanelTitle style={{ margin: 0 }}>
                    Battle — บอสตัวที่ {match.currentBossIndex + 1}: {boss?.name ?? "unknown"}
                </WWPanelTitle>
                <WWBadge $variant="neutral">กดตัวละครที่ส่งลง แล้วบันทึกผลของแต่ละฝั่ง</WWBadge>
            </div>

            {skipped !== null && (
                <SkipNotice>
                    <SkipTitle>⚠ แพ้ทั้งคู่</SkipTitle>
                    <span>
                        บอสตัวที่ {skipped + 1}
                        {skippedBossName ? ` (${skippedBossName})` : ""} — ทั้งสองฝั่งลองครบ {ATTEMPTS_PER_BOSS}{" "}
                        ครั้งแล้วไม่มีใครผ่าน ข้ามมาบอสตัวที่ {skipped + 2}
                        {boss?.name ? ` (${boss.name})` : ""} โดยไม่มีใครได้แต้ม
                        <strong> และคืนจำนวนครั้งที่ใช้ตัวละครของบอสตัวนั้นให้ทั้งสองฝั่งแล้ว</strong>
                    </span>
                </SkipNotice>
            )}

            <Sides>{(["P1", "P2"] as DraftPlayer[]).map(renderSide)}</Sides>

            {edgeCase && (
                <WWPanel $edge={wwTheme.warn} style={{ marginTop: 10 }}>
                    <WWPanelTitle style={{ color: wwTheme.warn }}>บอสตัวสุดท้าย — แพ้ทั้งคู่</WWPanelTitle>
                    <p style={{ fontSize: 12, color: wwTheme.textDim, margin: "0 0 10px" }}>
                        คืนจำนวนครั้งที่ใช้ตัวละครของบอสตัวนี้ให้ทั้งสองฝั่งแล้ว — กติกาให้สลับทีมแล้วลองใหม่ได้อีก{" "}
                        {ATTEMPTS_PER_BOSS} ครั้ง (บันทึกต่อได้เลย) หรือให้กรรมการตัดสินผล
                    </p>
                    <Actions>
                        <WWButton type="button" onClick={() => awardPoint("P1")}>
                            ให้แต้ม {getPlayerName(match, "P1")}
                        </WWButton>
                        <WWButton type="button" onClick={() => awardPoint("P2")}>
                            ให้แต้ม {getPlayerName(match, "P2")}
                        </WWButton>
                        <WWButton type="button" tone="warn" onClick={() => declareMatchWinner("draw")}>
                            ตัดสินเสมอ
                        </WWButton>
                    </Actions>
                </WWPanel>
            )}

            <Actions style={{ marginTop: 10 }}>
                <WWButton
                    type="button"
                    tone="ghost"
                    onClick={() => setBossIndex(match.currentBossIndex + 1)}
                    disabled={match.currentBossIndex >= match.bossPoolRolled.length - 1}
                >
                    ข้ามไปบอสถัดไป
                </WWButton>
                <WWButton type="button" tone="ghost" onClick={() => declareMatchWinner("P1")}>
                    ประกาศ {getPlayerName(match, "P1")} ชนะ
                </WWButton>
                <WWButton type="button" tone="ghost" onClick={() => declareMatchWinner("P2")}>
                    ประกาศ {getPlayerName(match, "P2")} ชนะ
                </WWButton>
            </Actions>

            <LogList>
                {[...logEntries]
                    .reverse()
                    .slice(0, 20)
                    .map((entry, index) =>
                        entry.kind === "skip" ? (
                            <SkipRow key={`skip-${entry.bossIndex}-${index}`}>
                                <span>⚠ แพ้ทั้งคู่</span>
                                <span>
                                    บอส {entry.bossIndex + 1} ไม่มีใครผ่าน — ข้ามไปบอส {entry.bossIndex + 2}
                                    ไม่มีใครได้แต้ม และคืนครั้งที่ใช้ตัวละครให้ทั้งคู่
                                </span>
                            </SkipRow>
                        ) : (
                            <LogRow key={`${entry.attempt.timestamp}-${index}`} $win={entry.attempt.result === "win"}>
                                <strong style={{ color: entry.attempt.player === "P1" ? wwTheme.p1 : wwTheme.p2 }}>
                                    {getPlayerName(match, entry.attempt.player)}
                                </strong>
                                <span>
                                    บอส {entry.attempt.bossIndex + 1} · ครั้งที่ {entry.attempt.attemptNumberForBoss} ·{" "}
                                    {entry.attempt.result === "win" ? "ชนะ" : "แพ้"}
                                </span>
                                <span style={{ marginLeft: "auto", opacity: 0.75 }}>
                                    {entry.attempt.charactersUsed.map((id) => characterMap[id]?.name ?? id).join(", ")}
                                </span>
                            </LogRow>
                        )
                    )}
            </LogList>
        </WWPanel>
    );
};
