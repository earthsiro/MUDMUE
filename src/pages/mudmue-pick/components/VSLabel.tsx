import { chok } from "../chok.styles";
import styled from "styled-components";

interface VSLabelProps {
    size?: number;
}

/** Staggered V / S mark between the two sides, in the two team colours: V blue,
    S red. (It used to reference `--color-primary` / `--color-secondary`, which
    the project never defines, so both letters fell back to inherited text
    colour.) */
/* Scales with the viewport so the net mark doesn't eat the court's width on a
   phone — the two halves stay side by side at every size. */
const Mark = styled.div<{ $size: number }>`
    position: relative;
    flex-shrink: 0;
    width: ${({ $size }) => `clamp(${Math.round($size * 0.7)}px, 5vw, ${Math.round($size * 1.25)}px)`};
    height: ${({ $size }) => `clamp(${Math.round($size * 0.9)}px, 7vw, ${Math.round($size * 1.5)}px)`};
    font-size: ${({ $size }) => `clamp(${Math.round($size * 0.6)}px, 4.4vw, ${$size}px)`};
    font-weight: 700;
    line-height: 1;
`;

const VLabel = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    color: ${chok.teamBlue};
`;

const SLabel = styled.span`
    position: absolute;
    bottom: 0;
    right: 0;
    color: ${chok.teamRed};
`;

export const VSLabel = (props: VSLabelProps) => {
    const { size = 32 } = props;

    return (
        <Mark $size={size} aria-label="VS" role="img">
            <VLabel aria-hidden="true">V</VLabel>
            <SLabel aria-hidden="true">S</SLabel>
        </Mark>
    );
};
