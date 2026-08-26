import { PhaseHeader, PhaseSeg } from "../components/PhaseHeader";
import {
    WWButton,
    WWPanel,
    WWReadout,
    WWRule,
    WWSurface,
    wwFramed,
    wwFramedShape,
    wwShape,
    wwTheme,
} from "../ww-draft.styles";

import { BannedListModal } from "../components/BannedListModal";
import { BattleTracker } from "../components/BattleTracker";
import { BossRollPanel } from "../components/BossRollPanel";
import type { DraftPlayer } from "../../../types/wwDraft";
import { MatchSummary } from "../components/MatchSummary";
import { NewMatchPanel } from "../components/NewMatchPanel";
import { PhaseTimer } from "../components/PhaseTimer";
import { PoolGrid } from "../components/PoolGrid";
import { RosterPanel } from "../components/RosterPanel";
import { breakpoints } from "../../../styles/breakpoints";
import { openBannedListModal } from "../components/bannedListModalControls";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
`;

/** Phase switcher on the left, score + clock on the right. */
const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
`;

const ScoreClock = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const Spacer = styled.div`
    margin-left: auto;

    @media (max-width: ${breakpoints.tablet}px) {
        margin-left: 0;
    }
`;

/** The design's three-column board: roster · pool · roster. */
const Board = styled.div`
    display: grid;
    grid-template-columns: 260px 1fr 260px;
    gap: 24px;
    align-items: stretch;
    min-height: 0;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }
`;

const OverrideBanner = styled.div`
    ${wwFramed("12px", wwTheme.accent, wwTheme.accent100, "2px")}
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 14px;
    color: ${wwTheme.accent700};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 13px;
`;

const PlayerSwitch = styled.button<{ $active: boolean }>`
    ${({ $active }) =>
        wwFramedShape(
            wwShape.lozenge("7px"),
            wwTheme.accent,
            $active ? wwTheme.accent : "transparent"
        )}
    padding: 5px 14px;
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 12px;
    cursor: pointer;
    color: ${({ $active }) => ($active ? wwTheme.onAccent : wwTheme.accent700)};
`;

const Note = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${wwTheme.neutral600};
`;

export const WWDraftBoard = () => {
    const {
        match,
        timerSettings,
        canUndo,
        undo,
        overrideMode,
        setOverrideMode,
        overridePlayer,
        setOverridePlayer,
        nextTurn,
        nextPhase,
        resetMatch,
    } = useDraft();

    if (!match) {
        return (
            <WWSurface>
                <NewMatchPanel />
            </WWSurface>
        );
    }

    const isDraftPhase = ["ban1", "pick1", "ban2", "pick2", "lastban"].includes(match.phase);
    const isBattlePhase = match.phase === "battle";

    return (
        <WWSurface>
            <Column>
                <TopRow>
                    <PhaseSeg phase={match.phase} />
                    <ScoreClock>
                        <WWReadout>
                            <span style={{ color: wwTheme.p1 }}>{match.scoreP1}</span>
                            <span style={{ color: wwTheme.neutral500, fontSize: 14 }}>—</span>
                            <span style={{ color: wwTheme.p2 }}>{match.scoreP2}</span>
                        </WWReadout>
                        <PhaseTimer phase={match.phase} settings={timerSettings} />
                    </ScoreClock>
                </TopRow>

                <Controls>
                    <WWButton type="button" onClick={undo} disabled={!canUndo} title="ย้อนกลับ 1 ขั้น">
                        ↶ Undo
                    </WWButton>
                    <WWButton type="button" onClick={openBannedListModal}>
                        Banned List
                    </WWButton>
                    <WWButton type="button" $active={overrideMode} onClick={() => setOverrideMode(!overrideMode)}>
                        Override {overrideMode ? "ON" : "OFF"}
                    </WWButton>
                    <Spacer />
                    <WWButton
                        type="button"
                        tone="primary"
                        onClick={() => {
                            if (window.confirm("ล้างแมตช์ปัจจุบันและเริ่มใหม่?")) resetMatch();
                        }}
                    >
                        New Match
                    </WWButton>
                </Controls>

                {overrideMode && (
                    <OverrideBanner>
                        <span>⚠ OVERRIDE MODE — ข้ามกติกาเทิร์นได้ทั้งหมด</span>
                        <span style={{ fontWeight: 400 }}>บันทึกเป็นของ:</span>
                        {(["P1", "P2"] as DraftPlayer[]).map((player) => (
                            <PlayerSwitch
                                key={player}
                                type="button"
                                $active={overridePlayer === player}
                                onClick={() => setOverridePlayer(player)}
                            >
                                {player === "P1" ? match.playerNames[0] : match.playerNames[1]}
                            </PlayerSwitch>
                        ))}
                        <WWButton type="button" onClick={nextTurn}>
                            เทิร์นถัดไป →
                        </WWButton>
                        <WWButton type="button" onClick={nextPhase}>
                            เฟสถัดไป ⇥
                        </WWButton>
                    </OverrideBanner>
                )}

                <WWRule style={{ margin: 0 }} />

                <PhaseHeader match={match} />

                {isDraftPhase && (
                    <Board>
                        <RosterPanel player="P1" />
                        <PoolGrid />
                        <RosterPanel player="P2" />
                    </Board>
                )}

                {match.phase === "bossroll" && (
                    <>
                        <BossRollPanel />
                        <Board>
                            <RosterPanel player="P1" />
                            <WWPanel>
                                <Note>ดราฟท์เสร็จแล้ว — สุ่มบอสด้านบนเพื่อเข้าสู่ช่วงตีบอส</Note>
                            </WWPanel>
                            <RosterPanel player="P2" />
                        </Board>
                    </>
                )}

                {isBattlePhase && (
                    <>
                        <BossRollPanel />
                        <Board>
                            <RosterPanel player="P1" showLives />
                            <BattleTracker />
                            <RosterPanel player="P2" showLives />
                        </Board>
                    </>
                )}

                {match.phase === "done" && <MatchSummary />}
            </Column>

            <BannedListModal />
        </WWSurface>
    );
};
