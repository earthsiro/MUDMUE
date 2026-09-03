import { ChokButton, ChokIconButton, chok } from "../../mudmue-pick/chok.styles";

import { HanHint } from "../han.styles";
import { QR_MODAL_ID, closeQrModal } from "./qrModalControls";
import styled from "styled-components";
import { useHan } from "../context/hanContext";
import { useNavigate } from "react-router-dom";

const Box = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
`;

const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: ${chok.ink};
    }
`;

const QrImage = styled.img`
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    border-radius: 12px;
    border: 1px solid ${chok.line};
    background: ${chok.surface};
`;

/**
 * โชว์รูป QR พร้อมเพย์ที่ตั้งไว้ล่วงหน้าในหน้าตั้งค่า (MVP เป็นรูปนิ่ง ไม่ฝังยอดเงิน)
 * ยอดต่อคนยังต้องพิมพ์เองในแอปธนาคาร — การฝังยอดลง QR เป็นงานเฟสถัดไป
 */
export const QrModal = () => {
    const { settings } = useHan();
    const navigate = useNavigate();

    return (
        <dialog id={QR_MODAL_ID} className="modal">
            <div className="modal-box w-11/12 max-w-sm" style={{ background: chok.surface }}>
                <Box>
                    <Head>
                        <h3>QR รับเงิน</h3>
                        <ChokIconButton type="button" title="ปิด" aria-label="ปิดหน้าต่าง QR" onClick={closeQrModal}>
                            ✕
                        </ChokIconButton>
                    </Head>

                    {settings.paymentQrImage ? (
                        <>
                            <QrImage src={settings.paymentQrImage} alt="QR พร้อมเพย์สำหรับรับเงินค่าแบด" />
                            <HanHint>สแกนแล้วพิมพ์ยอดของแต่ละคนเอง — QR ใบนี้ยังไม่ได้ฝังจำนวนเงิน</HanHint>
                        </>
                    ) : (
                        <>
                            <HanHint>ยังไม่ได้อัปโหลดรูป QR — ไปตั้งค่าได้ที่แท็บ "ตั้งค่า"</HanHint>
                            <ChokButton
                                type="button"
                                $tone="primary"
                                onClick={() => {
                                    closeQrModal();
                                    navigate("/han/settings");
                                }}
                            >
                                ไปหน้าตั้งค่า
                            </ChokButton>
                        </>
                    )}
                </Box>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button aria-label="ปิดหน้าต่าง QR">close</button>
            </form>
        </dialog>
    );
};
