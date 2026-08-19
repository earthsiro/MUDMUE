import {
    PHASE_LABELS,
    PHASE_ORDER,
    getCurrentTurn,
    getJustSkippedBoss,
    getRemainingInTurn,
    getTurnTable,
} from "../../../helpers/wwDraftEngine";
import { WWDot, WWSeg, WWSegOption, wwFramed, wwTheme } from "../ww-draft.styles";

import type { DraftState } from "../../../types/wwDraft";
import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";

/**
 * The whole-turn banner. Players watch this board as well as the caster, so
 * whose turn it is has to be the loudest thing on the page: a fat bar in the
 * acting side's colour, their name at 30px, and the action spelled out.
 */
const Banner = styled.div<{ $accent: string; $tint: string }>`
    ${({ $accent, $tint }) => wwFramed("16px", $accent, $tint, "2px")}
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    padding: 14px 20px 14px 32px;
    transition: background 0.2s ease;

    /* แถบหนาฝั่งซ้ายในสีของฝั่งที่ถึงตา — หดพื้นเข้ามา 14px แทนการใช้
       border-left ที่โดนมุมตัดของ clip-path เฉือนหาย */
    &::after {
        inset: 2px 2px 2px 14px;
    }

    @media (max-width: ${breakpoints.mobile}px) {
        gap: 12px;
        padding: 10px 14px 10px 24px;

        &::after {
            inset: 2px 2px 2px 10px;
        }
    }
`;

const Who = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

const Eyebrow = styled.div<{ $accent: string }>`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${({ $accent }) => $accent};
`;

const BigName = styled.div<{ $accent: string }>`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: 0.01em;
    color: ${({ $accent }) => $accent};
    overflow-wrap: anywhere;

    @media (max-width: ${breakpoints.mobile}px) {
        font-size: 22px;
    }
`;

const What = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const Action = styled.div`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${wwTheme.neutral900};
`;

const Instruction = styled.div`
    font-size: 13px;
    color: ${wwTheme.neutral700};
`;

const Right = styled.div`
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    @media (max-width: ${breakpoints.tablet}px) {
        margin-left: 0;
        align-items: flex-start;
    }
`;

const Dots = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
`;

const TurnCount = styled.div`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 12px;
    color: ${wwTheme.neutral600};
    letter-spacing: 0.08em;
`;

/** Flattened turn table: one pip per character taken in the phase, not per turn. */
const buildDots = (match: DraftState) => {
    const table = getTurnTable(match.phase);
    if (!table.length) return { dots: [] as ("done" | "current" | "pending")[], index: 0, total: 0 };

    const total = table.reduce((sum, turn) => sum + turn.count, 0);
    const spent = table.slice(0, match.turnIndex).reduce((sum, turn) => sum + turn.count, 0) + match.turnProgress;

    return {
        dots: Array.from({ length: total }, (_, i) =>
            i < spent ? ("done" as const) : i === spent ? ("current" as const) : ("pending" as const)
        ),
        index: spent,
        total,
    };
};

export const PhaseSeg = ({ phase }: { phase: DraftState["phase"] }) => (
    <WWSeg>
        {PHASE_ORDER.filter((p) => p !== "done").map((p) => (
            <WWSegOption key={p} type="button" $active={p === phase} disabled>
                {PHASE_LABELS[p]}
            </WWSegOption>
        ))}
    </WWSeg>
);

export const PhaseHeader = ({ match }: { match: DraftState }) => {
    const turn = getCurrentTurn(match);
    const remaining = getRemainingInTurn(match);
    const { dots, index, total } = buildDots(match);
    const isBanPhase = match.phase === "ban1" || match.phase === "ban2" || match.phase === "lastban";
    const skipped = match.phase === "battle" ? getJustSkippedBoss(match) : null;

    /* Phases with no turn table (boss roll, battle, done) fall back to a neutral
       banner — there is no side to colour it with. A boss nobody cleared is the
       same: it belongs to neither side, so it takes ink rather than either
       player's hue, which would read as "that side did something". */
    const accent =
        skipped !== null ? wwTheme.text : turn ? (turn.player === "P1" ? wwTheme.p1 : wwTheme.p2) : wwTheme.neutral500;
    const tint =
        skipped !== null
            ? wwTheme.neutral200
            : turn
              ? turn.player === "P1"
                  ? wwTheme.p1Tint
                  : wwTheme.p2Tint
              : wwTheme.neutral100;
    const actingName = turn ? (turn.player === "P1" ? match.playerNames[0] : match.playerNames[1]) : null;

    const instruction = (() => {
        if (skipped !== null)
            return "ทั้งสองฝั่งลองครบ 3 ครั้งแล้วไม่มีใครผ่าน — ไม่มีใครได้แต้ม และคืนจำนวนครั้งที่ใช้ตัวละครให้ทั้งคู่";
        if (match.phase === "lastban" && turn) {
            const target = turn.player === "P1" ? match.playerNames[1] : match.playerNames[0];
            return `แบนจาก roster ฝั่ง ${target}`;
        }
        if (turn) return `เหลืออีก ${remaining} ${isBanPhase ? "ban" : "pick"} ในเทิร์นนี้`;
        if (match.phase === "bossroll") return "สุ่มบอส 5 ตัวเพื่อเริ่มการต่อสู้";
        if (match.phase === "battle") return "บันทึกผลการตีบอส";
        return "จบแมตช์แล้ว";
    })();

    const eyebrow = skipped !== null ? `บอสตัวที่ ${skipped + 1}` : actingName ? "ตาของ" : "เฟสปัจจุบัน";
    const headline = skipped !== null ? "⚠ แพ้ทั้งคู่" : (actingName ?? PHASE_LABELS[match.phase]);
    const action =
        skipped !== null ? `ข้ามไปบอสตัวที่ ${skipped + 2}` : actingName ? PHASE_LABELS[match.phase] : null;

    return (
        <Banner $accent={accent} $tint={tint}>
            <Who>
                <Eyebrow $accent={accent}>{eyebrow}</Eyebrow>
                <BigName $accent={actingName && skipped === null ? accent : wwTheme.text}>{headline}</BigName>
            </Who>

            <What>
                {action && <Action>{action}</Action>}
                <Instruction>{instruction}</Instruction>
            </What>

            {total > 0 && (
                <Right>
                    <Dots>
                        {dots.map((state, i) => (
                            <WWDot key={i} $state={state} $accent={accent} />
                        ))}
                    </Dots>
                    <TurnCount>
                        TURN {Math.min(index + 1, total)}/{total}
                    </TurnCount>
                </Right>
            )}
        </Banner>
    );
};
