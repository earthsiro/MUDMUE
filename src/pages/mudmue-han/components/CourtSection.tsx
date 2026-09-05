import { HanHint, HanSection, HanSectionHead, HanSectionTitle, HanTotal, chok } from "../han.styles";

import { CourtBoard } from "./CourtBoard";
import { breakpoints } from "../../../styles/breakpoints";
import { TierDeck } from "./TierDeck";
import { formatBaht, formatShuttle } from "../../../helpers/hanCalc";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

/** คำอธิบายวิธีใช้ตัวใหญ่กว่า hint ปกติ — เป็นบรรทัดเดียวที่บอกกลไกทั้งหมดของ section นี้ */
const Lead = styled.p`
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: ${chok.inkSoft};

    @media (max-width: ${breakpoints.mobile}px) {
        font-size: 13.5px;
    }
`;

/**
 * ค่าคอร์ท — ป้ายราคาเป็นของแยกชิ้นจากคอร์ท
 *
 * เรียงคอร์ทไว้บน ป้ายราคาไว้ล่าง เพราะทิศทางการใช้งานคือ "หยิบป้ายข้างล่าง ขึ้นไปแปะ
 * บนคอร์ทข้างบน" ป้ายใบเดียวแปะได้หลายคอร์ท (คอร์ทที่เล่นพร้อมกันชั่วโมงเดียวกัน)
 * และคอร์ทเดียวแปะได้หลายป้าย (เล่นข้ามชั่วโมงที่ราคาต่างกัน)
 */
export const CourtSection = () => {
    const { result } = useHan();

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>🏟️</span> ค่าคอร์ท
                </HanSectionTitle>
                <HanTotal>
                    รวม <strong>{formatBaht(result.courtSubtotal)}</strong>
                </HanTotal>
            </HanSectionHead>

            <Lead>
                ลากการ์ด “ชม.” ด้านล่างไปวางบนคอร์ทที่ใช้ช่วงราคานั้น — บนมือถือ/แท็บเล็ตจับที่ปุ่ม ⠿ แล้วลาก
                หรือแตะการ์ดหนึ่งครั้งแล้วแตะคอร์ทก็ได้
            </Lead>

            <CourtBoard />
            <TierDeck />

            <HanHint>
                แต่ละคอร์ทคิดจากป้ายที่แปะอยู่บนคอร์ทนั้นเอง แล้วรวมทุกคอร์ทหารเท่ากันทุกคน
                {result.sessionDurationHours > 0 &&
                    ` — คอร์ทที่จองยาวที่สุด ${formatShuttle(result.sessionDurationHours)} ชม.`}
            </HanHint>
        </HanSection>
    );
};
