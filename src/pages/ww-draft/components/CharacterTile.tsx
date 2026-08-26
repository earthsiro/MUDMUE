import styled, { css } from "styled-components";

import type { WWCharacter } from "../../../types/wwDraft";
import { wwTheme } from "../ww-draft.styles";

export type TileState = "available" | "disabled" | "banned" | "picked";

const SIZES = { sm: 36, md: 56, lg: 84 } as const;

const Tile = styled.button<{ $state: TileState; $dimmed: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
    cursor: ${({ $state }) => ($state === "available" ? "pointer" : "not-allowed")};
    transition: opacity 0.15s ease;
    opacity: ${({ $state, $dimmed }) =>
        $state === "banned" ? 0.4 : $state === "disabled" ? 0.45 : $dimmed ? 0.6 : 1};

    ${({ $state }) =>
        $state === "available" &&
        css`
            &:hover [data-avatar] {
                border-color: ${wwTheme.accent};
            }
        `}
`;

const AvatarWrap = styled.span`
    position: relative;
    display: inline-flex;
`;

/** Circular portrait with a 2px rule.
    Selected: a 3px ring in the side's colour plus a lifted shadow. The rest of
    this system uses rules rather than shadows, but the battle grid shows both
    rosters at once and the picked characters have to pop off a wall of similar
    portraits — so the shadow earns its keep here. */
const Avatar = styled.span<{ $size: keyof typeof SIZES; $selected: boolean; $accent: string }>`
    width: ${({ $size }) => SIZES[$size]}px;
    height: ${({ $size }) => SIZES[$size]}px;
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: ${wwTheme.neutral200};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: ${({ $size }) => Math.round(SIZES[$size] * 0.36)}px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    border: ${({ $selected, $accent }) => ($selected ? `3px solid ${$accent}` : `2px solid ${wwTheme.line}`)};
    box-shadow: ${({ $selected, $accent }) =>
        $selected
            ? `0 0 0 3px color-mix(in srgb, ${$accent} 22%, transparent), 0 6px 14px -6px color-mix(in srgb, ${$accent} 70%, transparent)`
            : "none"};

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
`;

/* Pulled in slightly from the corner — a circle's edge sits inside the box. */
const ElementBadge = styled.span`
    position: absolute;
    top: -2px;
    right: -2px;
    font-family: ${wwTheme.fontHeading};
    font-size: 8px;
    font-weight: 800;
    line-height: 1.3;
    background: ${wwTheme.accent};
    color: ${wwTheme.onAccent};
    padding: 1px 4px;
    border-radius: ${wwTheme.radiusFull};
    border: 1px solid ${wwTheme.surface};
`;

const BanOverlay = styled.span<{ $size: keyof typeof SIZES }>`
    position: absolute;
    left: 0;
    top: 0;
    width: ${({ $size }) => SIZES[$size]}px;
    height: ${({ $size }) => SIZES[$size]}px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${wwTheme.scrim};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.06em;
    pointer-events: none;
`;

/** Pick order, bottom-right of the portrait — says *which* slot the character
    took, not just that it was taken. */
const OrderBadge = styled.span<{ $accent: string }>`
    position: absolute;
    right: -3px;
    bottom: -3px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: ${wwTheme.radiusFull};
    background: ${({ $accent }) => $accent};
    color: ${wwTheme.onAccent};
    border: 2px solid ${wwTheme.surface};
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 10px;
    line-height: 1;
    pointer-events: none;
`;

const Label = styled.span<{ $banned: boolean; $selected: boolean; $accent: string }>`
    font-size: 11px;
    text-align: center;
    font-weight: ${({ $selected }) => ($selected ? 800 : 600)};
    color: ${({ $selected, $accent }) => ($selected ? $accent : "inherit")};
    line-height: 1.1;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: ${({ $banned }) => ($banned ? "line-through" : "none")};
`;

const Lives = styled.span<{ $out: boolean }>`
    display: inline-flex;
    gap: 2px;
`;

const Pip = styled.span<{ $filled: boolean; $out: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $filled, $out }) => ($filled ? ($out ? wwTheme.neutral400 : wwTheme.accent) : wwTheme.surface)};
    border: 1px solid ${({ $filled }) => ($filled ? "transparent" : wwTheme.line)};
`;

const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

/** Two-letter element code, matching the design's badge (Sp, Ae, El, Fu, Gl, Ha). */
const elementCode = (element?: string) => (element ? element.slice(0, 2) : "");

export const CharacterTile = ({
    character,
    state = "available",
    size = "md",
    selected = false,
    selectionIndex,
    dimmed = false,
    accent = wwTheme.accent,
    lives,
    showName = true,
    showElement = false,
    onClick,
    title,
}: {
    character?: WWCharacter;
    state?: TileState;
    size?: keyof typeof SIZES;
    selected?: boolean;
    /** 1-based pick order — implies `selected` and renders the order badge */
    selectionIndex?: number;
    /** faded back because something else in the same group is selected */
    dimmed?: boolean;
    accent?: string;
    /** remaining lives — rendered as square pips under the portrait when provided */
    lives?: number;
    showName?: boolean;
    showElement?: boolean;
    onClick?: () => void;
    title?: string;
}) => {
    const name = character?.name ?? "unknown";
    const isBanned = state === "banned";
    const isSelected = selected || selectionIndex !== undefined;

    return (
        <Tile
            type="button"
            $state={state}
            $dimmed={dimmed && !isSelected}
            disabled={state !== "available"}
            onClick={onClick}
            title={title ?? name}
        >
            <AvatarWrap>
                <Avatar data-avatar $size={size} $selected={isSelected} $accent={accent}>
                    {character?.imageUrl ? (
                        <img src={character.imageUrl} alt={name} loading="lazy" />
                    ) : (
                        initials(name)
                    )}
                </Avatar>
                {showElement && character?.element && <ElementBadge>{elementCode(character.element)}</ElementBadge>}
                {isBanned && <BanOverlay $size={size}>BAN</BanOverlay>}
                {selectionIndex !== undefined && <OrderBadge $accent={accent}>{selectionIndex}</OrderBadge>}
            </AvatarWrap>

            {showName && (
                <Label $banned={isBanned} $selected={isSelected} $accent={accent}>
                    {name}
                </Label>
            )}

            {lives !== undefined && (
                <Lives $out={lives <= 0}>
                    {[0, 1, 2].map((index) => (
                        <Pip key={index} $filled={index < lives} $out={lives <= 0} />
                    ))}
                </Lives>
            )}
        </Tile>
    );
};
