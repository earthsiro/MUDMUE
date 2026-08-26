import { WWBadge, WWPanel, wwTheme } from "../ww-draft.styles";
import {
    canClickRosterCharacter,
    getCurrentTurn,
    getLastBannedOf,
    getLivesOf,
    getRosterOf,
} from "../../../helpers/wwDraftEngine";

import type { DraftPlayer } from "../../../types/wwDraft";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";

/**
 * `$acting` — this player owns the current turn, so the panel gets their colour
 * and a ring. `$dimmed` — the other side, faded back so the eye lands on the
 * acting one. In Last Ban the acting player clicks the *opponent's* panel, so a
 * targeted panel is never dimmed even though its owner is not acting.
 */
/* กรอบเน้นส่งผ่าน $edge/$edgeWidth ของ WWPanel และเรืองแสงด้วย drop-shadow
   แทน box-shadow เพราะเงาที่อยู่นอกกล่องจะโดน clip-path ของมุมตัดตัดทิ้ง */
const Panel = styled(WWPanel)<{ $acting: boolean; $dimmed: boolean; $accent: string }>`
    display: flex;
    flex-direction: column;
    min-height: 0;
    transition: opacity 0.2s ease, filter 0.2s ease;
    filter: ${({ $acting, $accent }) =>
        $acting ? `drop-shadow(0 0 6px color-mix(in srgb, ${$accent} 45%, transparent))` : "none"};
    opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
`;

const Head = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
`;

const PlayerName = styled.div<{ $accent: string }>`
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

const Rule = styled.div`
    height: 2px;
    background: ${wwTheme.line};
    margin-bottom: 12px;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
`;

const Row = styled.button<{ $clickable: boolean; $banned: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 6px;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${wwTheme.line};
    border-radius: ${wwTheme.radiusSm};
    color: inherit;
    font: inherit;
    cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
    opacity: ${({ $banned }) => ($banned ? 0.4 : 1)};

    &:hover:not(:disabled) {
        background: ${wwTheme.accent100};
    }
`;

const Avatar = styled.span<{ $banned: boolean }>`
    position: relative;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: ${wwTheme.neutral200};
    border: 2px solid ${({ $banned }) => ($banned ? wwTheme.accent : wwTheme.line)};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 13px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

const BanMark = styled.span`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${wwTheme.scrim};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 8px;
`;

const Name = styled.div<{ $banned: boolean }>`
    font-family: ${wwTheme.fontHeading};
    font-weight: 700;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: ${({ $banned }) => ($banned ? "line-through" : "none")};
`;

const LivePips = styled.span`
    display: inline-flex;
    gap: 2px;
    flex-shrink: 0;
`;

const Pip = styled.span<{ $filled: boolean; $out: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $filled, $out }) => ($filled ? ($out ? wwTheme.neutral400 : wwTheme.accent) : wwTheme.surface)};
    border: 1px solid ${({ $filled }) => ($filled ? "transparent" : wwTheme.line)};
`;

const Empty = styled.div`
    font-size: 12px;
    color: ${wwTheme.neutral500};
    padding: 8px 0;
`;

const Hint = styled.p`
    margin: 10px 0 0;
    font-size: 11.5px;
    color: ${wwTheme.accent700};
`;

const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

export const RosterPanel = ({
    player,
    /** show remaining lives on each row (battle phase) */
    showLives = false,
}: {
    player: DraftPlayer;
    showLives?: boolean;
}) => {
    const { match, rosterClick, overrideMode, characterMap } = useDraft();
    if (!match) return null;

    const accent = player === "P1" ? wwTheme.p1 : wwTheme.p2;
    const roster = getRosterOf(match, player);
    const lastBanned = getLastBannedOf(match, player);
    const lives = getLivesOf(match, player);
    const name = player === "P1" ? match.playerNames[0] : match.playerNames[1];
    const activeCount = roster.length - lastBanned.length;
    const isTargeted = roster.some((id) => canClickRosterCharacter(match, id, player, overrideMode));
    const anyOutOfLives = showLives && roster.some((id) => (lives[id] ?? 3) <= 0 && !lastBanned.includes(id));

    /* Override mode throws the turn order away, so nothing is highlighted or
       dimmed while it is on — every side is fair game. */
    const turn = overrideMode ? null : getCurrentTurn(match);
    const isActing = turn?.player === player;
    const isDimmed = !!turn && !isActing && !isTargeted;

    return (
        <Panel
            $acting={isActing}
            $dimmed={isDimmed}
            $accent={accent}
            $edge={isActing ? accent : isTargeted ? wwTheme.accent : wwTheme.cardLine}
            $edgeWidth={isActing || isTargeted ? "2px" : "1px"}
        >
            <Head>
                <PlayerName $accent={accent}>{name}</PlayerName>
                {isTargeted ? (
                    <WWBadge $variant="outline">เลือกตัวที่จะแบน</WWBadge>
                ) : isActing ? (
                    <WWBadge $variant="outline" color={accent}>
                        ● ตาของฝั่งนี้
                    </WWBadge>
                ) : (
                    <WWBadge $variant="neutral">
                        {lastBanned.length > 0 ? `${activeCount} ตัว` : `${roster.length} ตัว`}
                    </WWBadge>
                )}
            </Head>
            <Rule />

            <List>
                {roster.length === 0 && <Empty>ยังไม่มีตัวละคร</Empty>}
                {roster.map((id) => {
                    const character = characterMap[id];
                    const banned = lastBanned.includes(id);
                    const clickable = canClickRosterCharacter(match, id, player, overrideMode);
                    const remaining = lives[id] ?? 3;

                    return (
                        <Row
                            key={id}
                            type="button"
                            disabled={!clickable}
                            $clickable={clickable}
                            $banned={banned}
                            onClick={clickable ? () => rosterClick(id, player) : undefined}
                            title={character?.name ?? id}
                        >
                            <Avatar $banned={banned}>
                                {character?.imageUrl ? (
                                    <img src={character.imageUrl} alt={character.name} loading="lazy" />
                                ) : (
                                    initials(character?.name ?? "?")
                                )}
                                {banned && <BanMark>BAN</BanMark>}
                            </Avatar>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Name $banned={banned}>{character?.name ?? id}</Name>
                            </div>

                            {showLives && !banned ? (
                                <LivePips>
                                    {[0, 1, 2].map((index) => (
                                        <Pip key={index} $filled={index < remaining} $out={remaining <= 0} />
                                    ))}
                                </LivePips>
                            ) : (
                                character?.element && (
                                    <WWBadge $variant="outline" style={{ fontSize: 9, padding: "2px 6px" }}>
                                        {character.element}
                                    </WWBadge>
                                )
                            )}
                        </Row>
                    );
                })}
            </List>

            {anyOutOfLives && <Hint>⚠ มีตัวละครที่ใช้ครบ 3 ครั้งแล้ว (ยังเลือกได้ แต่ผิดกติกา)</Hint>}
        </Panel>
    );
};
