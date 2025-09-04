import styled from "styled-components";

interface VSLabelProps {
    size?: number;
}
const VLabel = styled.span`
    color: var(--color-primary);
    top: -4px;
    left: 0;
    position: absolute;
`;
const SLabel = styled.span`
    color: var(--color-secondary);
    bottom: -4px;
    right: 0;
    position: absolute;
`;
export const VSLabel = (props: VSLabelProps) => {
    const { size = 32 } = props;

    return (
        <div className={`font-noto font-bold text-[${size}px] relative w-10 h-12`}>
            <VLabel>V</VLabel>
            <SLabel>S</SLabel>
        </div>
    );
};
