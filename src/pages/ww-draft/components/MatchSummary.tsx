import { WWBadge, WWButton, WWPanel, WWPanelTitle, wwTheme } from "../ww-draft.styles";
import { getActiveRoster, getLivesOf, getPlayerName } from "../../../helpers/wwDraftEngine";

import { CharacterTile } from "./CharacterTile";
import type { DraftPlayer } from "../../../types/wwDraft";
import styled from "styled-components";
import { toPng } from "html-to-image";
import { useDraft } from "../context/draftContext";
import { useRef } from "react";

const Sheet = styled.div`
    background: ${wwTheme.surface};
    border-radius: ${wwTheme.radiusLg};
    padding: 16px;
`;

const ScoreRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 16px;
`;

const Side = styled.div<{ $accent: string }>`
    flex: 1;
    text-align: center;
    font-size: 17px;
    font-weight: 800;
    color: ${({ $accent }) => $accent};
`;

const BigScore = styled.div`
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 0.04em;
`;

const Teams = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 10px 6px;
`;

const Stat = styled.p`
    margin: 6px 0 0;
    font-size: 12px;
    color: ${wwTheme.textDim};
`;

export const MatchSummary = () => {
    const { match, characterMap, bossMap, archiveCurrentMatch } = useDraft();
    const sheetRef = useRef<HTMLDivElement>(null);

    if (!match) return null;

    const winnerLabel =
        match.winner === "draw"
            ? "เสมอ"
            : match.winner
              ? `${getPlayerName(match, match.winner)} ชนะ`
              : "ยังไม่จบแมตช์";

    const exportPng = async () => {
        if (!sheetRef.current) return;
        const dataUrl = await toPng(sheetRef.current, { backgroundColor: wwTheme.bg, pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `ww-draft-${match.matchId}.png`;
        link.href = dataUrl;
        link.click();
    };

    const attemptsOf = (player: DraftPlayer) => match.battleLog.filter((a) => a.player === player);

    return (
        <WWPanel>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <WWPanelTitle style={{ margin: 0 }}>Match Summary</WWPanelTitle>
                <div className="flex gap-2">
                    <WWButton type="button" tone="ghost" onClick={archiveCurrentMatch}>
                        บันทึกลงประวัติ
                    </WWButton>
                    <WWButton type="button" tone="primary" onClick={exportPng}>
                        Export PNG
                    </WWButton>
                </div>
            </div>

            <Sheet ref={sheetRef}>
                <ScoreRow>
                    <Side $accent={wwTheme.p1}>{match.playerNames[0]}</Side>
                    <BigScore>
                        <span style={{ color: wwTheme.p1 }}>{match.scoreP1}</span>
                        <span style={{ color: wwTheme.textDim }}> : </span>
                        <span style={{ color: wwTheme.p2 }}>{match.scoreP2}</span>
                    </BigScore>
                    <Side $accent={wwTheme.p2}>{match.playerNames[1]}</Side>
                </ScoreRow>

                <div className="flex justify-center mb-4">
                    <WWBadge color={match.winner === "draw" ? wwTheme.warn : wwTheme.ok}>{winnerLabel}</WWBadge>
                </div>

                <Teams>
                    {(["P1", "P2"] as DraftPlayer[]).map((player) => {
                        const accent = player === "P1" ? wwTheme.p1 : wwTheme.p2;
                        const lives = getLivesOf(match, player);
                        const active = getActiveRoster(match, player);
                        return (
                            <div key={player}>
                                <WWPanelTitle style={{ color: accent }}>{getPlayerName(match, player)}</WWPanelTitle>
                                <Grid>
                                    {active.map((id) => (
                                        <CharacterTile
                                            key={id}
                                            character={characterMap[id]}
                                            state="disabled"
                                            size="sm"
                                            accent={accent}
                                            lives={lives[id] ?? 3}
                                        />
                                    ))}
                                </Grid>
                                <Stat>ลงสนาม {attemptsOf(player).length} ครั้ง</Stat>
                                <Stat>ชนะบอส {attemptsOf(player).filter((a) => a.result === "win").length} ครั้ง</Stat>
                            </div>
                        );
                    })}
                </Teams>

                {match.bossPoolRolled.length > 0 && (
                    <Stat style={{ marginTop: 12 }}>
                        ลำดับบอส: {match.bossPoolRolled.map((id, i) => `${i + 1}. ${bossMap[id]?.name ?? id}`).join("  •  ")}
                    </Stat>
                )}
            </Sheet>
        </WWPanel>
    );
};
