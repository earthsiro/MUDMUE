import {
    ChokButton,
    ChokEmpty,
    ChokTable,
    ChokTableWrap,
} from "../../mudmue-pick/chok.styles";
import {
    HanHint,
    HanSection,
    HanSectionHead,
    HanSectionTitle,
    HanTotal,
    HanTotalLine,
    HanWarning,
    chok,
} from "../han.styles";
import { QrModal } from "./QrModal";
import { openQrModal } from "./qrModalControls";
import { formatBaht, formatShuttle } from "../../../helpers/hanCalc";

import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

const Totals = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 10px;
    background: ${chok.surfaceAlt};
    border: 1px solid ${chok.line};
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    /* บนมือถือปุ่มสามอันเรียงกันจะกว้างไม่เท่ากันจนดูรก — ให้ยืดเต็มบรรทัดคนละอัน
       และเป็นเป้าแตะที่ใหญ่ขึ้นด้วย */
    @media (max-width: ${breakpoints.mobile}px) {
        > button {
            flex: 1 1 100%;
        }
    }
`;

const Payable = styled.b`
    font-size: 15px;
    font-weight: 700;
`;

const ResetBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: ${chok.ink};
    }
`;

const RESET_MODAL_ID = "han_reset_modal";
const openReset = () => (document.getElementById(RESET_MODAL_ID) as HTMLDialogElement | null)?.showModal();
const closeReset = () => (document.getElementById(RESET_MODAL_ID) as HTMLDialogElement | null)?.close();

/**
 * สรุปผล — breakdown ต่อคน + ยอดรวม + ส่วนต่างจากการปัดขึ้น
 *
 * warning ทุกอันที่ขึ้นตรงนี้เป็นการเตือนล้วน ๆ ไม่ได้ล็อกปุ่มบันทึก เพราะหน้างานจริง
 * ตัวเลขมั่วได้เสมอ (คนจำจำนวนลูกผิด มาสายแล้วบอกชั่วโมงเกิน) แล้วคนจัดก๊วนคือคนที่
 * รู้ดีกว่าโปรแกรมว่าตกลงกันยังไง
 */
export const SummarySection = () => {
    const { result, sessionSaved, saveToHistory, startNewSession } = useHan();
    const hasPeople = result.people.length > 0;

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>🧾</span> สรุปผล
                </HanSectionTitle>
                <HanTotal>
                    ยอดจริง <strong>{formatBaht(result.grandTotal)}</strong>
                </HanTotal>
            </HanSectionHead>

            {result.warnings.length > 0 && (
                <HanWarning role="status">
                    {result.warnings.map((warning) => (
                        <span key={warning}>⚠️ {warning}</span>
                    ))}
                </HanWarning>
            )}

            {!hasPeople ? (
                <ChokEmpty>ยังไม่ได้เลือกคนมาวันนี้ — เลือกคนก่อนถึงจะหารได้</ChokEmpty>
            ) : (
                <ChokTableWrap>
                    <ChokTable>
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th className="optional">ลูก</th>
                                <th>ค่าคอร์ท</th>
                                <th>ค่าลูก</th>
                                <th>ต้องจ่าย</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.people.map((person) => (
                                <tr key={person.profileUuid}>
                                    <td>{person.name}</td>
                                    <td className="optional">{formatShuttle(person.shuttleCount)}</td>
                                    <td>{formatBaht(person.courtShare)}</td>
                                    <td>{formatBaht(person.shuttleCost)}</td>
                                    <td>
                                        <Payable>{formatBaht(person.total)}</Payable>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </ChokTable>
                </ChokTableWrap>
            )}

            <Totals>
                <HanTotalLine>
                    <span>ค่าคอร์ท</span>
                    <b>{formatBaht(result.courtSubtotal)}</b>
                </HanTotalLine>
                <HanTotalLine>
                    <span>ค่าลูก</span>
                    <b>{formatBaht(result.shuttleSubtotal)}</b>
                </HanTotalLine>
                <HanTotalLine>
                    <span>ยอดที่ต้องจ่ายจริง</span>
                    <b>{formatBaht(result.grandTotal)}</b>
                </HanTotalLine>
                <HanTotalLine>
                    <span>เก็บได้จากทุกคน (ปัดขึ้นแล้ว)</span>
                    <b>{formatBaht(result.collectedTotal)}</b>
                </HanTotalLine>
                <HanTotalLine>
                    <span>ส่วนต่างเข้ากองกลาง</span>
                    <b>{formatBaht(result.roundingDiff)}</b>
                </HanTotalLine>
            </Totals>

            {result.roundingDiff < 0 && hasPeople && (
                <HanHint>ส่วนต่างติดลบ = เก็บได้ไม่ครบยอดจริง ลองเช็คจำนวนลูกที่ระบุรายคนอีกที</HanHint>
            )}

            <Actions>
                <ChokButton type="button" $tone="primary" onClick={saveToHistory} disabled={!hasPeople}>
                    {sessionSaved ? "บันทึกแล้ว · บันทึกซ้ำ" : "บันทึกลงประวัติ"}
                </ChokButton>
                <ChokButton type="button" $tone="neutral" onClick={openQrModal}>
                    <span aria-hidden>📱</span> QR รับเงิน
                </ChokButton>
                <ChokButton type="button" $tone="neutral" onClick={openReset}>
                    เริ่มบิลใหม่
                </ChokButton>
            </Actions>

            <QrModal />

            {/* ล้างบิลที่กรอกค้างไว้เป็นการกระทำที่ย้อนกลับไม่ได้ — ถามก่อนเสมอ
                ยิ่งถ้ายังไม่ได้บันทึกลงประวัติ ข้อความจะเตือนแรงขึ้นด้วย */}
            <dialog id={RESET_MODAL_ID} className="modal">
                <div className="modal-box w-11/12 max-w-md" style={{ background: chok.surface }}>
                    <ResetBox>
                        <h3>เริ่มบิลใหม่?</h3>
                        <span>
                            {sessionSaved
                                ? "บิลนี้บันทึกลงประวัติแล้ว เปิดบิลเปล่าใบใหม่ได้เลย"
                                : "บิลนี้ยังไม่ได้บันทึกลงประวัติ — กดแล้วข้อมูลที่กรอกไว้จะหายทั้งหมด"}
                        </span>
                        <Actions style={{ justifyContent: "flex-end" }}>
                            <ChokButton type="button" $tone="neutral" onClick={closeReset}>
                                ยกเลิก
                            </ChokButton>
                            <ChokButton
                                type="button"
                                $tone={sessionSaved ? "primary" : "danger"}
                                onClick={() => {
                                    startNewSession();
                                    closeReset();
                                }}
                            >
                                เริ่มบิลใหม่
                            </ChokButton>
                        </Actions>
                    </ResetBox>
                </div>
            </dialog>
        </HanSection>
    );
};
