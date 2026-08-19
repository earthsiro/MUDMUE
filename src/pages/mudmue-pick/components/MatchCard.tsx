import { ChokCaption, ChokPlayerName, ChokResult, chok } from "../chok.styles";
import { MatchDataType, PlayerDataType, TIED } from "../../../services/matchService";

import IconShuttleCockBlue from "../../../assets/icon-shuttlecock-blue.png";
import IconShuttleCockRed from "../../../assets/icon-shuttlecock-red.png";
import { PlayerProfile } from "../../../services/profileService";
import { ReactNode } from "react";
import { ScoreStepper } from "../dashboard/components/ScoreStepper";
import { VSLabel } from "./VSLabel";
import { formatDateTime } from "../../../helpers/formatDate";
import styled, { keyframes } from "styled-components";

/**
 * One match, used by both Dashboard (live scoring) and History (read-only).
 * Both pages used to carry their own copy of this markup — including the
 * service-side logic — with fixed `w-[200px] lg:w-[360px]` columns and a
 * `h-[182px]` card that clipped doubles names. This one is a grid that folds
 * into a column under 900px.
 */
/** Inset of the short service line from the net — shared by the court's own
    service line and the centre line that has to stop against it. */
const SERVICE_INSET = "clamp(7px, 2vw, 10px)";

const Card = styled.div`
    width: 100%;
    position: relative;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
    border-radius: 12px;
    padding: 14px clamp(10px, 3vw, 20px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* Clips the "fight" punch overlay, which flies in from 120px outside the
       card — off a narrow screen that would scroll the page sideways. */
    overflow: hidden;
`;

const CardHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

/**
 * The two halves face each other at every width — that facing *is* the court,
 * so this never stacks. Narrow screens shrink the gaps and the type instead.
 */
const Sides = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: clamp(4px, 2.5vw, 40px);
`;

const Side = styled.div<{ $align: "left" | "right" }>`
    display: flex;
    align-items: center;
    gap: clamp(4px, 1.6vw, 16px);
    min-width: 0;
    flex-direction: ${({ $align }) => ($align === "right" ? "row" : "row-reverse")};
    justify-content: flex-end;
`;

/**
 * One half of the court. The net is the thick line facing the middle of the
 * card; the thin lines are the boundary; `::after` is the short service line,
 * inset from the net the way it is on a real court.
 */
const CourtHalf = styled.div<{ $net: "left" | "right" }>`
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
    padding: 8px clamp(10px, 3vw, 18px);
    background: ${chok.courtTint};
    text-align: ${({ $net }) => ($net === "right" ? "right" : "left")};
    border: 1px solid ${chok.courtLine};
    border-${({ $net }) => $net}: 2px solid ${chok.courtNet};
    border-radius: ${({ $net }) => ($net === "right" ? "6px 0 0 6px" : "0 6px 6px 0")};

    &::after {
        content: "";
        position: absolute;
        top: 6px;
        bottom: 6px;
        ${({ $net }) => $net}: ${SERVICE_INSET};
        width: 1px;
        background: ${chok.courtLine};
    }
`;

const NameRow = styled.div<{ $align: "left" | "right"; $divided: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    /* Both service courts keep their height so the court doesn't resize when a
       singles player moves between them. */
    min-height: clamp(30px, 8vw, 34px);
    flex-direction: ${({ $align }) => ($align === "right" ? "row" : "row-reverse")};
    justify-content: flex-end;

    /* Centre line — stops at the short service line, like the real marking. */
    &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: ${({ $align }) => ($align === "right" ? "0" : SERVICE_INSET)};
        right: ${({ $align }) => ($align === "right" ? SERVICE_INSET : "0")};
        height: 1px;
        background: ${({ $divided }) => ($divided ? chok.courtLine : "transparent")};
    }
`;

const ServeIcon = styled.img`
    width: clamp(14px, 4vw, 18px);
    height: clamp(14px, 4vw, 18px);
    flex-shrink: 0;
`;

const stepUp = keyframes`
    from { transform: translateY(18px); opacity: 0.35; }
    to { transform: none; opacity: 1; }
`;

const stepDown = keyframes`
    from { transform: translateY(-18px); opacity: 0.35; }
    to { transform: none; opacity: 1; }
`;

/**
 * A player standing in one service court. Keyed by player in `MatchCard`, so it
 * remounts — and replays this slide — whenever someone changes court: the
 * singles player swapping ends, or doubles partners rotating on serve.
 */
const Plate = styled.div<{ $align: "left" | "right"; $from: "above" | "below" }>`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-direction: ${({ $align }) => ($align === "right" ? "row" : "row-reverse")};
    animation: ${({ $from }) => ($from === "below" ? stepUp : stepDown)} 0.28s ease-out;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

/** Doubles: which partner serves depends on the serving side's score parity. */
const isServer = (score: number, slot: number, team: "blue" | "red"): boolean => {
    const shouldServeIndex = score % 2 === 0 ? 0 : 1;
    return team === "blue" ? slot === shouldServeIndex : slot !== shouldServeIndex;
};

/**
 * Which of the two service courts a singles player stands in — slot 0 is the
 * top half, slot 1 the bottom.
 *
 * The serving player's own score decides their court (even = their right court)
 * and the receiver stands diagonally opposite, so one parity check places both
 * players. On screen the red half faces right and the blue half faces left, so
 * their right courts are on opposite ends: even → red bottom + blue top.
 */
const singlesSlot = (serveScore: number, team: "blue" | "red"): number => {
    const even = serveScore % 2 === 0;
    if (team === "red") return even ? 1 : 0;
    return even ? 0 : 1;
};

const resultFor = (match: MatchDataType, team: "red" | "blue"): ChokResult | undefined => {
    if (!match.winner) return undefined;
    if (match.winner === TIED) return "draw";
    return match.winner === team ? "win" : "lose";
};

interface MatchCardProps {
    match: MatchDataType;
    profileMap: Record<string, PlayerProfile>;
    /** History: no +/- buttons, and each side gets a WIN / LOSE / DRAW badge. */
    readOnly?: boolean;
    onScoreChange?: (team: "blue" | "red", score: number) => void;
    /** Right-hand controls in the card header (complete, replay). */
    actions?: ReactNode;
    /** Overlay slot — the Dashboard's punch animation lives here. */
    overlay?: ReactNode;
}

export const MatchCard = ({
    match,
    profileMap,
    readOnly = false,
    onScoreChange = () => {},
    actions,
    overlay,
}: MatchCardProps) => {
    const teamPlayers = (team: "red" | "blue") =>
        match.player.filter((p) => p.team === team).sort((a, b) => a.position - b.position);

    const teamScore = (team: "red" | "blue") => match.player.find((p) => p.team === team)?.score ?? 0;

    /** Score that decides where everyone stands: always the serving side's. */
    const serveScore = teamScore(match.serviceSide === "red" ? "red" : "blue");

    const renderSide = (team: "red" | "blue") => {
        const align = team === "red" ? "right" : "left";
        const players = teamPlayers(team);
        const isSingles = players.length === 1;

        /* Singles get both service courts too, with the player moving between
           them — that movement is the whole point of showing the court. */
        const slots: (PlayerDataType | null)[] = isSingles
            ? [0, 1].map((slot) => (slot === singlesSlot(serveScore, team) ? players[0] : null))
            : [players[0] ?? null, players[1] ?? null];

        const servesFromSlot = (slot: number) => {
            if (match.serviceSide !== team) return false;
            return isSingles ? true : isServer(serveScore, slot, team);
        };

        return (
            <Side $align={align}>
                <ScoreStepper
                    team={team}
                    score={teamScore(team)}
                    isDisplay={readOnly}
                    result={readOnly ? resultFor(match, team) : undefined}
                    callback={(score) => onScoreChange(team, score)}
                />
                <CourtHalf $net={align}>
                    {slots.map((p, slot) => (
                        <NameRow key={slot} $align={align} $divided={slot === 0}>
                            {p && (
                                <Plate
                                    key={p.uuid || p.name}
                                    $align={align}
                                    $from={slot === 0 ? "below" : "above"}
                                >
                                    <ChokPlayerName>
                                        {profileMap[p.uuid]?.displayName ? (
                                            <>
                                                {profileMap[p.uuid].displayName} <small>({p.name})</small>
                                            </>
                                        ) : (
                                            p.name
                                        )}
                                    </ChokPlayerName>
                                    {servesFromSlot(slot) && (
                                        <ServeIcon
                                            src={team === "red" ? IconShuttleCockRed : IconShuttleCockBlue}
                                            alt="ฝั่งเสิร์ฟ"
                                            title="ฝั่งเสิร์ฟ"
                                        />
                                    )}
                                </Plate>
                            )}
                        </NameRow>
                    ))}
                </CourtHalf>
            </Side>
        );
    };

    return (
        <Card>
            <CardHead>
                <ChokCaption>{formatDateTime(match.updateDate ?? match.createDate)}</ChokCaption>
                {actions && <Actions>{actions}</Actions>}
            </CardHead>
            <Sides>
                {renderSide("red")}
                <VSLabel size={26} />
                {renderSide("blue")}
            </Sides>
            {overlay}
        </Card>
    );
};
