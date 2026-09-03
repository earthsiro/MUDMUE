import { HanHint, HanSection, HanSectionHead, HanSectionTitle, HanTotal } from "../han.styles";

import { ChokLabel } from "../../mudmue-pick/chok.styles";
import { CountStepper } from "./CountStepper";
import { NumberField } from "./NumberField";
import { breakpoints } from "../../../styles/breakpoints";
import { formatBaht } from "../../../helpers/hanCalc";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

const Fields = styled.div`
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 14px 24px;
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    /* จอแคบ ๆ (360px) ราคาต่อลูกกับ stepper อยู่บรรทัดเดียวกันไม่พอ — ให้แยกบรรทัด
       แล้วยืดเต็มความกว้างไปเลย ดีกว่าปล่อยให้ stepper ถูกเบียดจนกดพลาด */
    @media (max-width: ${breakpoints.mobile}px) {
        flex: 1 1 100%;
    }
`;

/**
 * ค่าลูกแบด — ส่วนที่รู้ยอดได้ก็ต่อเมื่อเล่นจบแล้วเท่านั้น (ต้องนับลูกจริง)
 * จำนวนลูกจึงเป็น stepper เป็นหลัก คนกรอกมักนับทีละลูกจากกองลูกที่ใช้ไป
 */
export const ShuttleSection = () => {
    const { session, result, setShuttlePrice, setShuttleCount } = useHan();

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>🏸</span> ค่าลูกแบด
                </HanSectionTitle>
                <HanTotal>
                    รวม <strong>{formatBaht(result.shuttleSubtotal)}</strong>
                </HanTotal>
            </HanSectionHead>

            <Fields>
                <Field>
                    <ChokLabel>ราคาต่อลูก</ChokLabel>
                    <NumberField
                        value={session.shuttlePricePerPiece}
                        onChange={setShuttlePrice}
                        prefix="฿"
                        suffix="/ลูก"
                        width="136px"
                        ariaLabel="ราคาลูกแบดต่อลูก (บาท)"
                    />
                </Field>

                <Field>
                    <ChokLabel>ใช้ไปทั้งหมด</ChokLabel>
                    <CountStepper
                        value={session.shuttleUsedCount}
                        onChange={setShuttleCount}
                        label="จำนวนลูกที่ใช้"
                        suffix="ลูก"
                    />
                </Field>
            </Fields>

            <HanHint>
                {session.shuttleUsedCount > 0 && session.shuttlePricePerPiece > 0
                    ? `${session.shuttleUsedCount} ลูก × ${formatBaht(session.shuttlePricePerPiece)} = ${formatBaht(
                          result.shuttleSubtotal
                      )} — ทุกคนเริ่มที่ร่วมหารครบ ${session.shuttleUsedCount} ลูก ปรับลดรายคนได้ถ้ามาไม่ครบ`
                    : "กรอกหลังเล่นจบ — ค่าลูกรู้ได้ก็ต่อเมื่อนับลูกที่ใช้จริงแล้ว"}
            </HanHint>
        </HanSection>
    );
};
