import styled, { keyframes } from "styled-components";

import IconMinusBlue from "../../../../assets/icon-minus-blue.png";
import IconMinusRed from "../../../../assets/icon-minus-red.png";
import IconPlusBlue from "../../../../assets/icon-plus-blue.png";
import IconPlusRed from "../../../../assets/icon-plus-red.png";
import IconTrophy from "../../../../assets/trophy.png";

const ScoreStepperContainer = styled.div<{ trophy: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    justify-content: center;
    ${({ trophy }) => (trophy ? "width:135px" : "width:135px")};
`;
const TrophyContainer = styled.div`
    position: absolute;
    top: 62%;
    left: 0%;
    z-index: 0;
    transform: translate(0%, -50%);
    @media (max-width: 1200px) {
        display: none;
    }
    @media (max-width: 900px) {
        display: none;
    }
`;
const trophyGrow = keyframes`
  0% { transform: scale(0.8); }
  35% { transform: scale(1.2); }
  100% { transform: scale(0.8); }
`;

const AnimatedTrophy = styled.img<{ faded?: boolean }>`
    animation: ${trophyGrow} 1.2s ease infinite;
    position: relative;
    width: 129px;
    height: 129px;
    opacity: ${({ faded }) => (faded ? 0.35 : 1)};
`;

interface ScoreStepperProps {
    team: "blue" | "red";
    score: number;
    callback: (score: number) => void;
    isDisplay?: boolean;
    className?: string;
    showTrophy?: boolean;
}

export const ScoreStepper = (props: ScoreStepperProps) => {
    const { team = "blue", score = 0, callback = () => {}, isDisplay = false, className, showTrophy = false } = props;
    const handleIncrement = () => {
        callback(score + 1);
    };
    const handleDecrement = () => {
        if (score > 0) {
            callback(score - 1);
        }
    };
    return (
        <ScoreStepperContainer className={className} trophy={showTrophy}>
            {!isDisplay && (
                <button className="btn btn-sm btn-square btn-circle btn-ghost right-2 top-2 " onClick={handleIncrement}>
                    <img src={team === "blue" ? IconPlusBlue : IconPlusRed} alt="plus-blue"></img>
                </button>
            )}
            <div className="font-not text-[32px]">
                <span className="relative z-[2] ">{score}</span>
                {showTrophy && (
                    <TrophyContainer>
                        <AnimatedTrophy src={IconTrophy} alt="trophy" faded={isDisplay} />
                    </TrophyContainer>
                )}
            </div>
            {!isDisplay && (
                <button className="btn btn-sm btn-square btn-circle btn-ghost right-2 top-2 " onClick={handleDecrement}>
                    <img src={team === "blue" ? IconMinusBlue : IconMinusRed} alt="plus-blue"></img>
                </button>
            )}
        </ScoreStepperContainer>
    );
};
