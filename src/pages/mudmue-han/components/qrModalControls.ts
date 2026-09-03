/** ตัวคุม <dialog> ของ QR — แยกจากไฟล์คอมโพเนนต์เพื่อไม่ให้ Fast Refresh สะดุด
    (แบบเดียวกับ `bannedListModalControls.ts` ของ WuWa MudMue) */
export const QR_MODAL_ID = "han_qr_modal";

export const openQrModal = () => (document.getElementById(QR_MODAL_ID) as HTMLDialogElement | null)?.showModal();

export const closeQrModal = () => (document.getElementById(QR_MODAL_ID) as HTMLDialogElement | null)?.close();
