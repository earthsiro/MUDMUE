import { useState } from "react";

/**
 * ค่าที่พิมพ์ค้างไว้ระหว่างโฟกัส เก็บเป็น string ให้ลบจนว่างหรือพิมพ์ "1." ค้างไว้ได้
 * โดยไม่เด้งกลับเป็น 0 ทุกคีย์ — พอเบลอค่อยดึงค่าที่ parse ได้กลับมาแสดง
 *
 * ใช้กับช่องกรอกที่วาดเอง (การ์ดป้ายราคา / การ์ดลูกแบด) ส่วนช่องที่เป็นกล่องเต็มใบ
 * ใช้ `NumberField` ซึ่งมีตรรกะเดียวกันอยู่ข้างในแล้ว
 */
export const useDraftNumber = (commit: (value: number) => void) => {
    const [draft, setDraft] = useState<string | null>(null);

    return {
        draft,
        onChange: (raw: string) => {
            setDraft(raw);
            if (raw === "") return;
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) commit(Math.max(0, parsed));
        },
        onBlur: () => {
            if (draft !== null && (draft === "" || !Number.isFinite(Number(draft)))) commit(0);
            setDraft(null);
        },
    };
};
