import IconMinusBlue from "../../../../assets/icon-minus-blue.png";
import IconMinusRed from "../../../../assets/icon-minus-red.png";
import IconPlusBlue from "../../../../assets/icon-plus-blue.png";
import IconPlusRed from "../../../../assets/icon-plus-red.png";
import React from "react";
import styled from "styled-components";

const ScoreStepperContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

interface ScoreStepperProps {
    team: "blue" | "red";
    score: number;
    callback: (score: number) => void;
    isDisplay?: boolean;
}

export const ScoreStepper = (props: ScoreStepperProps) => {
    const { team = "blue", score = 0, callback = () => {}, isDisplay = false } = props;
    const handleIncrement = () => {
        callback(score + 1);
    };
    const handleDecrement = () => {
        if (score > 0) {
            callback(score - 1);
        }
    };
    return (
        <ScoreStepperContainer>
            {!isDisplay && (
                <button className="btn btn-sm btn-square btn-circle btn-ghost right-2 top-2 " onClick={handleIncrement}>
                    <img src={team === "blue" ? IconPlusBlue : IconPlusRed} alt="plus-blue"></img>
                </button>
            )}
            <div className="font-not text-[32px]">{score}</div>
            {!isDisplay && (
                <button className="btn btn-sm btn-square btn-circle btn-ghost right-2 top-2 " onClick={handleDecrement}>
                    <img src={team === "blue" ? IconMinusBlue : IconMinusRed} alt="plus-blue"></img>
                </button>
            )}
        </ScoreStepperContainer>
    );
};
