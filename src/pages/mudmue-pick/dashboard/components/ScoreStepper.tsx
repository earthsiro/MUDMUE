import {
    ChokIconButton,
    ChokReadout,
    ChokResult,
    ChokResultBadge,
    chokResultLabel,
} from "../../chok.styles";

import IconMinusBlue from "../../../../assets/icon-minus-blue.png";
import IconMinusRed from "../../../../assets/icon-minus-red.png";
import IconPlusBlue from "../../../../assets/icon-plus-blue.png";
import IconPlusRed from "../../../../assets/icon-plus-red.png";
import styled from "styled-components";

const ScoreStepperContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    /* Never narrower than the 44px buttons it holds; on a phone the court gets
       the rest of the row. */
    min-width: 44px;
`;

interface ScoreStepperProps {
    team: "blue" | "red";
    score: number;
    callback: (score: number) => void;
    /** Read-only: hides the +/- buttons (History). */
    isDisplay?: boolean;
    className?: string;
    /**
     * Finished-match outcome for this side. Shown as a badge under the score —
     * it replaced a 129px animated trophy PNG that overlapped the number and
     * was hidden below 1200px, so on a tablet nobody could tell who won.
     */
    result?: ChokResult;
}

export const ScoreStepper = (props: ScoreStepperProps) => {
    const { team = "blue", score = 0, callback = () => {}, isDisplay = false, className, result } = props;
    const sideLabel = team === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน";

    const handleIncrement = () => {
        callback(score + 1);
    };
    const handleDecrement = () => {
        if (score > 0) {
            callback(score - 1);
        }
    };

    return (
        <ScoreStepperContainer className={className}>
            {!isDisplay && (
                <ChokIconButton type="button" onClick={handleIncrement} aria-label={`เพิ่มคะแนน${sideLabel}`}>
                    <img src={team === "blue" ? IconPlusBlue : IconPlusRed} alt="" />
                </ChokIconButton>
            )}

            <ChokReadout $team={team} aria-label={`คะแนน${sideLabel} ${score}`}>
                {score}
            </ChokReadout>

            {result && <ChokResultBadge $result={result}>{chokResultLabel[result]}</ChokResultBadge>}

            {!isDisplay && (
                <ChokIconButton
                    type="button"
                    onClick={handleDecrement}
                    disabled={score === 0}
                    aria-label={`ลดคะแนน${sideLabel}`}
                >
                    <img src={team === "blue" ? IconMinusBlue : IconMinusRed} alt="" />
                </ChokIconButton>
            )}
        </ScoreStepperContainer>
    );
};
