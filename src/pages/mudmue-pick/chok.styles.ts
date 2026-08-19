import styled, { css } from "styled-components";

import { breakpoints } from "../../styles/breakpoints";

/**
 * Design tokens + primitives for MUDMUE Chok (route `/chok`).
 *
 * Spec: `public/.claude/Mudmue Chok - UX Design Review (standalone).html`.
 *
 * Keeps the pastel Mudmue palette from `index.css` but gives every colour a
 * single job, which the page didn't have before: brand blue was doing table
 * headers, rules and secondary buttons while brand pink — the destructive
 * colour — was on the page's main action.
 *
 * Scoped to this page. `MudmueButton` and the daisyUI classes stay untouched
 * because Chim and the Story Book still use them.
 */
export const chok = {
    /* --- action roles ------------------------------------------------ */
    /** Main action + the one accent. Nothing decorative may use it. */
    primary: "#0000ff",
    primaryHover: "#1a1aff",
    primaryActive: "#0000cc",
    primaryTint: "#e9e9ff",
    primaryTintStrong: "#d5d5ff",
    /** Destructive only: delete profile, remove player. */
    danger: "#ff1493",
    /** Pink is too light to read as text on white; this is its ink pair. */
    dangerInk: "#c00d70",
    dangerTint: "#fdeaf3",

    /* --- team identity (data colours, never actions) ------------------ */
    teamRed: "#d81f4a",
    teamBlue: "#0000ff",

    /* --- neutral ramp: structure, labels, meta ----------------------- */
    ink: "#1e1e28",
    inkSoft: "#3a3849",
    muted: "#6f6d7d",
    subtle: "#8c8a99",
    line: "#e2e0ea",
    lineSoft: "#f0eef5",
    surface: "#ffffff",
    surfaceAlt: "#fbfbfd",
    hover: "#f4f4f8",
    pressed: "#eceaf2",
    disabledBg: "#f1f0f5",
    disabledInk: "#a9a7ba",

    /* --- court motif -------------------------------------------------- */
    /** The name plates are drawn as the two halves of a badminton court: a
        thicker net line facing the middle, thin boundary lines around, a short
        service line inset from the net, and the centre line between doubles
        partners. Decorative and deliberately low-contrast, so it reads as court
        markings rather than competing with the blue action colour. */
    courtNet: "rgba(0, 0, 255, 0.3)",
    courtLine: "rgba(0, 0, 255, 0.16)",
    courtTint: "rgba(0, 0, 255, 0.025)",

    /** Smallest comfortable tap target on a tablet. */
    tap: "44px",
} as const;

/** Focus ring used by every interactive primitive here. */
const focusRing = css`
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/* ------------------------------------------------------------------ */
/* Typography — six roles that differ in size *and* weight            */
/* ------------------------------------------------------------------ */

export const ChokPageTitle = styled.h1`
    margin: 0;
    font-size: clamp(20px, 4vw, 26px);
    font-weight: 800;
    letter-spacing: -0.015em;
    line-height: 1.15;
    color: ${chok.ink};
`;

export const ChokSectionTitle = styled.h2`
    margin: 0;
    font-size: clamp(17px, 2.4vw, 19px);
    font-weight: 700;
    line-height: 1.25;
    color: ${chok.ink};
`;

/** Uppercase micro-label above a control or table column. */
export const ChokLabel = styled.span`
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: ${chok.muted};
`;

export const ChokBody = styled.span`
    font-size: 14px;
    font-weight: 400;
    color: ${chok.ink};
`;

export const ChokCaption = styled.span`
    font-size: 12px;
    font-weight: 400;
    color: ${chok.muted};
`;

/** Score / clock: the heaviest thing in a match card, on purpose. */
export const ChokReadout = styled.div<{ $team?: "red" | "blue" }>`
    font-size: clamp(20px, 5.5vw, 30px);
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: ${({ $team }) => ($team === "red" ? chok.teamRed : $team === "blue" ? chok.teamBlue : chok.ink)};
`;

/** Player name — deliberately lighter than the score it sits next to. */
export const ChokPlayerName = styled.div`
    font-size: clamp(13px, 3.2vw, 18px);
    font-weight: 600;
    line-height: 1.3;
    color: ${chok.ink};
    min-width: 0;
    overflow-wrap: anywhere;

    small {
        font-size: clamp(10px, 2.4vw, 11.5px);
        font-weight: 400;
        color: ${chok.muted};
    }
`;

/* ------------------------------------------------------------------ */
/* Surfaces                                                           */
/* ------------------------------------------------------------------ */

export const ChokCard = styled.div`
    width: 100%;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
    border-radius: 12px;
    padding: 20px;

    @media (max-width: ${breakpoints.mobile}px) {
        padding: 14px;
    }
`;

export const ChokRule = styled.div`
    width: 100%;
    height: 1px;
    background: ${chok.line};
`;

export const ChokEmpty = styled.div`
    width: 100%;
    padding: 48px 24px;
    text-align: center;
    font-size: 14px;
    color: ${chok.muted};
`;

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

export const ChokButton = styled.button<{ $tone?: "primary" | "neutral" | "danger"; $size?: "md" | "lg" }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: ${chok.tap};
    padding: ${({ $size }) => ($size === "lg" ? "0 32px" : "0 20px")};
    font-family: inherit;
    font-size: ${({ $size }) => ($size === "lg" ? "16px" : "14px")};
    font-weight: 600;
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;
    background: ${chok.surface};
    color: ${chok.ink};
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

    ${({ $tone = "neutral" }) =>
        $tone === "primary" &&
        css`
            background: ${chok.primary};
            border-color: ${chok.primary};
            color: #ffffff;

            &:hover:not(:disabled) {
                background: ${chok.primaryHover};
                box-shadow: 0 0 0 4px rgba(0, 0, 255, 0.16);
            }
            &:active:not(:disabled) {
                background: ${chok.primaryActive};
                transform: translateY(1px);
            }
        `}

    ${({ $tone = "neutral" }) =>
        $tone === "neutral" &&
        css`
            border-color: #c9c9d6;

            &:hover:not(:disabled) {
                border-color: ${chok.ink};
                background: ${chok.hover};
            }
            &:active:not(:disabled) {
                background: ${chok.pressed};
                transform: translateY(1px);
            }
        `}

    ${({ $tone = "neutral" }) =>
        $tone === "danger" &&
        css`
            border-color: ${chok.danger};
            color: ${chok.dangerInk};

            &:hover:not(:disabled) {
                background: ${chok.dangerTint};
            }
            &:active:not(:disabled) {
                background: #fbd9e9;
                transform: translateY(1px);
            }
        `}

    ${focusRing}

    &:disabled {
        background: ${chok.disabledBg};
        border-color: transparent;
        color: ${chok.disabledInk};
        cursor: not-allowed;
        box-shadow: none;
    }
`;

/**
 * Square 44px target for an icon. Replaces the bare `<img onClick>` the page
 * used for eye / trash / replay / complete, which had no focus state and was
 * unreachable by keyboard.
 */
export const ChokIconButton = styled.button<{ $tone?: "neutral" | "danger" | "primary" }>`
    width: ${chok.tap};
    height: ${chok.tap};
    flex-shrink: 0;
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 999px;
    border: 1px solid ${({ $tone }) => ($tone === "danger" ? chok.danger : chok.line)};
    background: ${chok.surface};
    color: ${({ $tone }) => ($tone === "danger" ? chok.dangerInk : chok.ink)};
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

    &:hover:not(:disabled) {
        background: ${({ $tone }) => ($tone === "danger" ? chok.dangerTint : chok.primaryTint)};
        border-color: ${({ $tone }) => ($tone === "danger" ? chok.danger : chok.primary)};
    }
    &:active:not(:disabled) {
        background: ${({ $tone }) => ($tone === "danger" ? "#fbd9e9" : chok.primaryTintStrong)};
        transform: translateY(1px);
    }

    ${focusRing}

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    img {
        width: 22px;
        height: 22px;
        object-fit: contain;
        pointer-events: none;
    }
`;

/* ------------------------------------------------------------------ */
/* Result badge — replaces the 129px animated trophy PNG              */
/* ------------------------------------------------------------------ */

export type ChokResult = "win" | "lose" | "draw";

/**
 * Ink rather than the blue accent: the badge sits right beside a score that
 * already carries its team's colour, and a blue "WIN" next to a red team's
 * score reads as "blue won". Swap `background` to `chok.primary` to follow the
 * accent literally.
 */
export const ChokResultBadge = styled.span<{ $result: ChokResult }>`
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;

    ${({ $result }) => {
        if ($result === "win") {
            return css`
                background: ${chok.ink};
                color: #ffffff;
            `;
        }
        if ($result === "draw") {
            return css`
                background: ${chok.surface};
                color: ${chok.muted};
                border: 1px solid #d5d3de;
            `;
        }
        return css`
            background: ${chok.disabledBg};
            color: ${chok.muted};
        `;
    }}
`;

export const chokResultLabel: Record<ChokResult, string> = {
    win: "WIN",
    lose: "LOSE",
    draw: "DRAW",
};

/* ------------------------------------------------------------------ */
/* Level chip + legend                                                */
/* ------------------------------------------------------------------ */

export const ChokLevelChip = styled.span`
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    background: ${chok.disabledBg};
    border: 1px solid ${chok.line};
    color: ${chok.inkSoft};
    cursor: help;
`;

export const ChokLegend = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 12px;
    color: ${chok.muted};

    b {
        display: inline-flex;
        padding: 2px 7px;
        border-radius: 5px;
        background: ${chok.disabledBg};
        color: ${chok.inkSoft};
        font-size: 11.5px;
        font-weight: 700;
    }
`;

/* ------------------------------------------------------------------ */
/* Form controls — native inputs had 13–16px targets and no hover     */
/* ------------------------------------------------------------------ */

/** Segmented control (2 Player / 4 Player). Wraps radios, so arrow keys work. */
export const ChokSegmented = styled.div`
    display: inline-flex;
    border: 1px solid #c9c9d6;
    border-radius: 999px;
    overflow: hidden;
    background: ${chok.surface};
`;

export const ChokSegment = styled.label<{ $active: boolean }>`
    position: relative; /* contains the visually-hidden radio */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: ${chok.tap};
    padding: 0 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    border-left: 1px solid ${chok.line};
    background: ${({ $active }) => ($active ? chok.primary : "transparent")};
    color: ${({ $active }) => ($active ? "#ffffff" : chok.inkSoft)};
    transition: background 0.15s ease, color 0.15s ease;

    &:first-of-type {
        border-left: none;
    }
    &:hover {
        background: ${({ $active }) => ($active ? chok.primaryHover : chok.hover)};
    }

    input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    &:has(input:focus-visible) {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/** Checkbox row — the whole 44px-tall row is the target, not a 13px box. */
export const ChokCheckRow = styled.label`
    position: relative; /* contains the visually-hidden checkbox */
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: ${chok.tap};
    width: fit-content;
    max-width: 100%;
    padding: 0 12px 0 6px;
    border-radius: 8px;
    font-size: 14px;
    color: ${chok.ink};
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: ${chok.hover};
    }
    &:active {
        background: ${chok.pressed};
    }

    input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    /* The tick: a rotated L drawn with borders, scaled in when checked. */
    .mark {
        position: relative;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border: 2px solid ${chok.disabledInk};
        border-radius: 6px;
        transition: background 0.12s ease, border-color 0.12s ease;
    }
    .mark::after {
        content: "";
        width: 10px;
        height: 6px;
        margin-top: -2px;
        border-left: 2.5px solid #ffffff;
        border-bottom: 2.5px solid #ffffff;
        transform: rotate(-45deg) scale(0);
        transition: transform 0.12s ease;
    }

    input:checked + .mark {
        background: ${chok.primary};
        border-color: ${chok.primary};
    }
    input:checked + .mark::after {
        transform: rotate(-45deg) scale(1);
    }
    input:focus-visible + .mark {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
    input:disabled + .mark {
        border-color: ${chok.line};
        background: ${chok.disabledBg};
    }
    &:has(input:disabled) {
        color: ${chok.disabledInk};
        cursor: not-allowed;
        background: transparent;
    }
`;

export const ChokField = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
`;

const controlBase = css`
    width: 100%;
    height: ${chok.tap};
    padding: 0 12px;
    font-family: inherit;
    font-size: 14px;
    color: ${chok.ink};
    background: ${chok.surface};
    border: 1px solid #c9c9d6;
    border-radius: 8px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover:not(:disabled) {
        border-color: ${chok.ink};
    }
    &:focus-visible {
        outline: none;
        border-color: ${chok.primary};
        box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.18);
    }
    &:disabled {
        background: ${chok.disabledBg};
        color: ${chok.disabledInk};
        cursor: not-allowed;
    }
    &::placeholder {
        color: ${chok.subtle};
    }
`;

export const ChokInput = styled.input`
    ${controlBase}
`;

/** Own chevron drawn in CSS — the native one can't be recoloured. */
export const ChokSelect = styled.select`
    ${controlBase}
    appearance: none;
    padding-right: 34px;
    background-image: linear-gradient(45deg, transparent 50%, ${chok.muted} 50%),
        linear-gradient(135deg, ${chok.muted} 50%, transparent 50%);
    background-position: calc(100% - 18px) calc(50% + 1px), calc(100% - 12px) calc(50% + 1px);
    background-size: 6px 6px, 6px 6px;
    background-repeat: no-repeat;
`;

/* ------------------------------------------------------------------ */
/* Table — neutral structure instead of blue headers / pink row nos.  */
/* ------------------------------------------------------------------ */

export const ChokTableWrap = styled.div`
    width: 100%;
    overflow-x: auto;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
    border-radius: 12px;
`;

export const ChokTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th {
        text-align: left;
        padding: 12px 14px;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: ${chok.muted};
        white-space: nowrap;
        border-bottom: 1px solid ${chok.line};
    }

    td {
        padding: 12px 14px;
        border-bottom: 1px solid ${chok.lineSoft};
        color: ${chok.ink};
        font-variant-numeric: tabular-nums;
        vertical-align: middle;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr:hover {
        background: ${chok.surfaceAlt};
    }

    /* Row number: ordering info, not an action — so it stays grey. */
    td.row-index {
        color: ${chok.subtle};
        font-size: 12px;
        width: 44px;
    }

    /* Secondary columns. Seven columns can't fit a phone without a sideways
       scroll that hides the row actions, so these drop out instead. */
    th.optional,
    td.optional {
        @media (max-width: ${breakpoints.mobile}px) {
            display: none;
        }
    }

    @media (max-width: ${breakpoints.mobile}px) {
        th,
        td {
            padding: 10px 8px;
        }
    }
`;
