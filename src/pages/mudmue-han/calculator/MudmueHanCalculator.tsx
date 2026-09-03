import { ChokInput, ChokLabel } from "../../mudmue-pick/chok.styles";
import { HanSection, HanStack } from "../han.styles";

import { AttendeeOverrides } from "../components/AttendeeOverrides";
import { CourtSection } from "../components/CourtSection";
import { PeopleSection } from "../components/PeopleSection";
import { ShuttleSection } from "../components/ShuttleSection";
import { SummarySection } from "../components/SummarySection";
import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

const HeadFields = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 12px;

    @media (max-width: ${breakpoints.mobile}px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
`;

/** ISO ที่เก็บใน session → ค่าที่ <input type="date"> ใช้ได้ (ตามเวลาเครื่อง ไม่ใช่ UTC) */
const toDateInputValue = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * หน้าคำนวณ — ไล่จากบนลงล่างตามลำดับที่เกิดขึ้นจริงหน้างาน
 * ค่าคอร์ท (รู้ตั้งแต่จอง) → ค่าลูก (รู้ตอนเล่นจบ) → ใครมาบ้าง → ใครพิเศษ → สรุป
 */
export const MudmueHanCalculator = () => {
    const { session, setTitle, setDate } = useHan();

    return (
        <HanStack $gap={14}>
            <HanSection>
                <HeadFields>
                    <Field>
                        <ChokLabel>ชื่อก๊วน</ChokLabel>
                        <ChokInput
                            type="text"
                            value={session.title}
                            maxLength={40}
                            placeholder="เช่น แบดวันเสาร์"
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <ChokLabel>วันที่เล่น</ChokLabel>
                        <ChokInput
                            type="date"
                            value={toDateInputValue(session.date)}
                            onChange={(e) => {
                                const picked = new Date(`${e.target.value}T00:00:00`);
                                if (!Number.isNaN(picked.getTime())) setDate(picked.toISOString());
                            }}
                        />
                    </Field>
                </HeadFields>
            </HanSection>

            <CourtSection />
            <ShuttleSection />
            <PeopleSection />
            <AttendeeOverrides />
            <SummarySection />
        </HanStack>
    );
};
