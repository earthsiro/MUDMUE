import { HanBadge, HanHint, HanSection, HanSectionHead, HanSectionTitle, chok } from "../han.styles";
import { formatBaht, formatShuttle } from "../../../helpers/hanCalc";

import { ChokIconButton } from "../../mudmue-pick/chok.styles";
import { NumberField } from "./NumberField";
import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

/**
 * ปรับจำนวนลูกเฉพาะคน — ช่องเริ่มที่ "ค่าเริ่มต้น" (null) เสมอ
 *
 * แถวไหนไม่แตะเลยก็คือร่วมหารครบทุกลูกตามปกติ ต้องกดปุ่มค่าเริ่มต้นก่อนถึงจะเปิดช่องกรอก
 * ตั้งใจให้ต้องกดเพิ่มหนึ่งที เพื่อไม่ให้เผลอพิมพ์ทับค่ากลางโดยไม่รู้ตัว
 *
 * ค่าคอร์ทไม่มีให้ปรับในเฟสนี้ — ถือว่าทุกคนอยู่ครบทั้งก๊วน คอร์ทจึงหารเท่ากันหมด
 * เคสมาสาย/กลับก่อนรอ phase 2
 */

const Rows = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

/**
 * แถวหนึ่งคน — ใช้ flex-wrap แทน grid ที่หักคอลัมน์ตาม breakpoint ตายตัว
 *
 * เดิมหักเป็นคอลัมน์เดียวตั้งแต่ 900px ทั้งที่แท็บเล็ตแนวนอนยังมีที่เหลือเฟือ
 * แบบนี้ช่องปรับค่าจะหล่นลงบรรทัดใหม่ก็ต่อเมื่อที่ไม่พอจริง ๆ ไม่ผูกกับตัวเลขจอ
 */
const Row = styled.div<{ $adjusted: boolean }>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    padding: 8px 12px;
    border-radius: 10px;
    background: ${({ $adjusted }) => ($adjusted ? chok.primaryTint : chok.surfaceAlt)};
    border: 1px solid ${({ $adjusted }) => ($adjusted ? chok.primary : chok.line)};
`;

const Person = styled.div`
    /* กินที่ที่เหลือทั้งหมด แต่ยุบได้ถึง 150px ก่อนจะดันช่องปรับค่าตกบรรทัด */
    flex: 1 1 150px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;

    strong {
        font-size: 14px;
        font-weight: 600;
        color: ${chok.ink};
        overflow-wrap: anywhere;
    }
`;

const Cell = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;

    /* บนมือถือให้แต่ละช่องกินเต็มบรรทัด ป้ายอยู่ซ้าย ตัวคุมอยู่ขวา — อ่านเป็นคู่ชัดกว่า
       การเบียดสองช่องให้อยู่บรรทัดเดียวกันจนตัวเลขแคบ */
    @media (max-width: ${breakpoints.mobile}px) {
        flex: 1 1 100%;
        justify-content: space-between;
    }
`;

const CellLabel = styled.span`
    font-size: 12px;
    color: ${chok.muted};
    white-space: nowrap;
`;

/** ปุ่มที่บอกว่า "ยังใช้ค่ากลางอยู่" กดแล้วเปลี่ยนเป็นช่องกรอก */
const DefaultButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: ${chok.tap};
    padding: 0 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: ${chok.inkSoft};
    cursor: pointer;
    border-radius: 8px;
    border: 1px dashed #c9c9d6;
    background: ${chok.surface};
    white-space: nowrap;

    &:hover {
        border-style: solid;
        border-color: ${chok.primary};
        color: ${chok.primary};
    }
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

interface OverrideCellProps {
    label: string;
    personName: string;
    value: number | null;
    /** ค่าที่จะได้ถ้าไม่ปรับ — ใช้เป็นค่าตั้งต้นตอนกดเปิดช่องกรอกด้วย */
    fallback: number;
    suffix: string;
    onChange: (value: number | null) => void;
}

const OverrideCell = ({ label, personName, value, fallback, suffix, onChange }: OverrideCellProps) => (
    <Cell>
        <CellLabel>{label}</CellLabel>
        {value === null ? (
            <DefaultButton
                type="button"
                aria-label={`ปรับ${label}ของ ${personName} (ตอนนี้ใช้ค่าเริ่มต้น ${formatShuttle(
                    fallback
                )} ${suffix})`}
                onClick={() => onChange(Math.round(fallback * 100) / 100)}
            >
                ค่าเริ่มต้น · {formatShuttle(fallback)} {suffix}
            </DefaultButton>
        ) : (
            <>
                <NumberField
                    value={value}
                    onChange={(next) => onChange(next)}
                    suffix={suffix}
                    width="104px"
                    ariaLabel={`${label}ของ ${personName}`}
                />
                <ChokIconButton
                    type="button"
                    title={`คืน${label}ของ ${personName} เป็นค่าเริ่มต้น`}
                    aria-label={`คืน${label}ของ ${personName} เป็นค่าเริ่มต้น`}
                    onClick={() => onChange(null)}
                >
                    ↺
                </ChokIconButton>
            </>
        )}
    </Cell>
);

export const AttendeeOverrides = () => {
    const { session, result, setAttendeeShuttle } = useHan();

    if (session.attendees.length === 0) return null;

    /* ค่าเริ่มต้นคือลูกทั้งหมดที่ใช้ไปทั้งวัน เพราะปกติทุกคนร่วมหารเท่ากันหมด
       ใครตีน้อยกว่าคนอื่นจริง ๆ ค่อยกดลดเลขของตัวเองลง ที่เหลือเฉลี่ยกันเอง */
    const breakdownByUuid = new Map(result.people.map((person) => [person.profileUuid, person]));

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>⚖️</span> ปรับจำนวนลูกเฉพาะคน
                </HanSectionTitle>
                <HanHint>ไม่ปรับก็ได้ — ข้ามไปดูสรุปได้เลย</HanHint>
            </HanSectionHead>

            <Rows>
                {session.attendees.map((attendee) => {
                    const person = breakdownByUuid.get(attendee.profileUuid);
                    const adjusted = attendee.shuttleCount !== null;

                    return (
                        <Row key={attendee.profileUuid} $adjusted={adjusted}>
                            <Person>
                                <strong>{attendee.name}</strong>
                                <HanBadge $tone={adjusted ? "active" : "default"}>
                                    {adjusted ? "ปรับแล้ว" : "ค่าเริ่มต้น"}
                                </HanBadge>
                                {person && <CellLabel>{formatBaht(person.total)}</CellLabel>}
                            </Person>

                            <OverrideCell
                                label="จำนวนลูก"
                                personName={attendee.name}
                                value={attendee.shuttleCount}
                                fallback={result.shuttleUsedTotal}
                                suffix="ลูก"
                                onChange={(value) => setAttendeeShuttle(attendee.profileUuid, value)}
                            />
                        </Row>
                    );
                })}
            </Rows>
        </HanSection>
    );
};
