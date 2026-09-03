import { HanStepButton } from "../han.styles";
import { NumberField } from "./NumberField";
import styled from "styled-components";

const Wrap = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;

interface CountStepperProps {
    value: number;
    onChange: (value: number) => void;
    /** ชื่อของสิ่งที่นับ ใช้ประกอบ aria-label ของปุ่ม − / + */
    label: string;
    suffix?: string;
    step?: number;
    min?: number;
    width?: string;
}

/**
 * ปุ่ม − / + คู่กับช่องกรอก — จำนวนลูกที่ใช้จริงถูกนับหน้างานทีละลูก การกดปุ่มเร็วกว่า
 * พิมพ์เลข แต่ยังพิมพ์ทับได้ถ้ารู้ยอดรวมอยู่แล้ว
 */
export const CountStepper = ({
    value,
    onChange,
    label,
    suffix,
    step = 1,
    min = 0,
    width = "96px",
}: CountStepperProps) => (
    <Wrap>
        <HanStepButton
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={value <= min}
            aria-label={`ลด${label}`}
        >
            −
        </HanStepButton>
        <NumberField
            value={value}
            onChange={(next) => onChange(Math.max(min, next))}
            ariaLabel={label}
            suffix={suffix}
            step={step}
            width={width}
        />
        <HanStepButton type="button" onClick={() => onChange(value + step)} aria-label={`เพิ่ม${label}`}>
            +
        </HanStepButton>
    </Wrap>
);
