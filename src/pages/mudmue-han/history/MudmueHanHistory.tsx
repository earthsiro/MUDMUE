import {
    ChokButton,
    ChokCaption,
    ChokEmpty,
    ChokIconButton,
    ChokTable,
    ChokTableWrap,
    chok,
} from "../../mudmue-pick/chok.styles";
import { HanStack, HanTotalLine } from "../han.styles";
import { deleteSession, isSessionBlank, loadSessions } from "../../../services/hanService";
import { useEffect, useState } from "react";

import type { HanSession } from "../../../types/han";
import { calculateSession, formatBaht } from "../../../helpers/hanCalc";
import { formatDateTime } from "../../../helpers/formatDate";
import styled from "styled-components";
import { useHan } from "../context/hanContext";
import { useNavigate } from "react-router-dom";

const RowActions = styled.div`
    display: flex;
    gap: 6px;
    justify-content: flex-end;
`;

const ModalBox = styled.div`
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

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
`;

const CONFIRM_ID = "han_history_confirm";
const OVERWRITE_ID = "han_history_overwrite";

const dateLabel = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

/**
 * ประวัติบิลที่บันทึกไว้ — เก็บเป็น JSON ล้วน (ไม่มีรูป) ยอดจึงคำนวณใหม่ตอนแสดงผล
 * ข้อดีคือถ้าสูตรถูกแก้ทีหลัง บิลเก่าก็แสดงยอดตามสูตรใหม่ทันที ไม่ต้อง migrate
 */
export const MudmueHanHistory = () => {
    const { loadSessionToDraft, session: draft, sessionSaved } = useHan();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<HanSession[]>([]);
    const [pendingDelete, setPendingDelete] = useState<HanSession | null>(null);
    const [pendingOpen, setPendingOpen] = useState<HanSession | null>(null);

    useEffect(() => {
        setSessions(loadSessions());
    }, []);

    /* ใหม่สุดอยู่บน — ดูจากตอนบันทึก ไม่ใช่วันที่เล่น เพราะบิลย้อนหลังกรอกทีหลังได้ */
    const ordered = [...sessions].sort(
        (a, b) => new Date(b.savedAt ?? b.date).getTime() - new Date(a.savedAt ?? a.date).getTime()
    );

    /**
     * เปิดบิลเก่าขึ้นมาแก้ = เขียนทับบิลที่กรอกค้างอยู่ในหน้าคำนวณ
     * ถ้าบิลที่ค้างอยู่ยังไม่ได้บันทึกและกรอกอะไรไว้แล้ว ต้องถามก่อน —
     * ทางนี้ทำข้อมูลหายได้เหมือนปุ่ม "เริ่มบิลใหม่" ที่มี dialog ยืนยันอยู่แล้ว
     */
    const openSession = (session: HanSession) => {
        loadSessionToDraft(session);
        navigate("/han/calculator");
    };

    const handleOpen = (session: HanSession) => {
        if (sessionSaved || isSessionBlank(draft)) {
            openSession(session);
            return;
        }
        setPendingOpen(session);
        (document.getElementById(OVERWRITE_ID) as HTMLDialogElement | null)?.showModal();
    };

    const handleDelete = () => {
        if (!pendingDelete) return;
        setSessions(deleteSession(pendingDelete.id));
        setPendingDelete(null);
        (document.getElementById(CONFIRM_ID) as HTMLDialogElement | null)?.close();
    };

    return (
        <HanStack>
            {ordered.length === 0 ? (
                <ChokEmpty>ยังไม่มีบิลที่บันทึกไว้ — กด "บันทึกลงประวัติ" ที่หน้าคำนวณ</ChokEmpty>
            ) : (
                <ChokTableWrap>
                    <ChokTable>
                        <thead>
                            <tr>
                                <th>วันที่เล่น</th>
                                <th>ชื่อก๊วน</th>
                                <th>คน</th>
                                <th>ยอดรวม</th>
                                <th className="optional">บันทึกเมื่อ</th>
                                <th aria-label="จัดการ" />
                            </tr>
                        </thead>
                        <tbody>
                            {ordered.map((session) => {
                                const result = calculateSession(session);
                                return (
                                    <tr key={session.id}>
                                        <td>{dateLabel(session.date)}</td>
                                        <td>{session.title || <ChokCaption>ไม่ได้ตั้งชื่อ</ChokCaption>}</td>
                                        <td>{session.attendees.length}</td>
                                        <td>{formatBaht(result.grandTotal)}</td>
                                        <td className="optional">
                                            <ChokCaption>
                                                {session.savedAt ? formatDateTime(session.savedAt) : "-"}
                                            </ChokCaption>
                                        </td>
                                        <td>
                                            <RowActions>
                                                <ChokButton type="button" onClick={() => handleOpen(session)}>
                                                    เปิด
                                                </ChokButton>
                                                <ChokIconButton
                                                    type="button"
                                                    $tone="danger"
                                                    title="ลบบิลนี้"
                                                    aria-label={`ลบบิลวันที่ ${dateLabel(session.date)}`}
                                                    onClick={() => {
                                                        setPendingDelete(session);
                                                        (
                                                            document.getElementById(
                                                                CONFIRM_ID
                                                            ) as HTMLDialogElement | null
                                                        )?.showModal();
                                                    }}
                                                >
                                                    🗑
                                                </ChokIconButton>
                                            </RowActions>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </ChokTable>
                </ChokTableWrap>
            )}

            {ordered.length > 0 && (
                <HanTotalLine>
                    <span>บันทึกไว้ทั้งหมด</span>
                    <b>{ordered.length} บิล</b>
                </HanTotalLine>
            )}

            <dialog id={OVERWRITE_ID} className="modal">
                <div className="modal-box w-11/12 max-w-md" style={{ background: chok.surface }}>
                    <ModalBox>
                        <h3>เปิดบิลนี้ทับของที่กรอกค้างไว้?</h3>
                        <span>
                            บิลที่กำลังกรอกอยู่ตอนนี้ยังไม่ได้บันทึกลงประวัติ — เปิดบิลเก่าขึ้นมาแล้ว
                            สิ่งที่กรอกค้างไว้จะหายทั้งหมด
                        </span>
                        <ModalActions>
                            <ChokButton
                                type="button"
                                $tone="neutral"
                                onClick={() => {
                                    setPendingOpen(null);
                                    (
                                        document.getElementById(OVERWRITE_ID) as HTMLDialogElement | null
                                    )?.close();
                                }}
                            >
                                ยกเลิก
                            </ChokButton>
                            <ChokButton
                                type="button"
                                $tone="danger"
                                onClick={() => {
                                    const target = pendingOpen;
                                    setPendingOpen(null);
                                    (
                                        document.getElementById(OVERWRITE_ID) as HTMLDialogElement | null
                                    )?.close();
                                    if (target) openSession(target);
                                }}
                            >
                                เปิดทับเลย
                            </ChokButton>
                        </ModalActions>
                    </ModalBox>
                </div>
            </dialog>

            <dialog id={CONFIRM_ID} className="modal">
                <div className="modal-box w-11/12 max-w-md" style={{ background: chok.surface }}>
                    <ModalBox>
                        <h3>ลบบิลนี้?</h3>
                        <span>
                            บิลวันที่ <strong>{pendingDelete ? dateLabel(pendingDelete.date) : ""}</strong>{" "}
                            จะหายถาวร — ถ้ามีคนที่ถูกซ่อนไว้เพราะติดบิลนี้ ก็จะลบโปรไฟล์นั้นได้แล้ว
                        </span>
                        <ModalActions>
                            <ChokButton
                                type="button"
                                $tone="neutral"
                                onClick={() =>
                                    (document.getElementById(CONFIRM_ID) as HTMLDialogElement | null)?.close()
                                }
                            >
                                ยกเลิก
                            </ChokButton>
                            <ChokButton type="button" $tone="danger" onClick={handleDelete}>
                                ลบ
                            </ChokButton>
                        </ModalActions>
                    </ModalBox>
                </div>
            </dialog>
        </HanStack>
    );
};
