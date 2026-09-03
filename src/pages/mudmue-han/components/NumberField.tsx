import { HanUnitField } from "../han.styles";
import { useState } from "react";

interface NumberFieldProps {
    value: number;
    onChange: (value: number) => void;
    /** หน่วยหน้าเลข — ราคาทุกช่องส่ง "฿" ตามมาตรฐานของแอป */
    prefix?: string;
    /** หน่วยหลังเลข เช่น "ชม." / "ลูก" */
    suffix?: string;
    /** บังคับ เพราะช่องพวกนี้ไม่มี label ที่มองเห็นได้ทุกจุด */
    ariaLabel: string;
    width?: string;
    placeholder?: string;
    /** ให้กรอกทศนิยมได้ (ชั่วโมง 1.5) — ราคาลูก/ชม. ก็ใช้ได้ */
    step?: number;
    disabled?: boolean;
    invalid?: boolean;
}

/**
 * ช่องกรอกตัวเลขที่มีหน่วยติดอยู่
 *
 * เก็บค่าที่พิมพ์เป็น string ระหว่างโฟกัส เพื่อให้ลบจนว่างหรือพิมพ์ "1." ค้างไว้ได้
 * โดยไม่โดนเด้งกลับเป็น 0 ทุกคีย์ — พอเบลอค่อยดึงค่าที่ parse ได้กลับมาแสดง
 */
export const NumberField = ({
    value,
    onChange,
    prefix,
    suffix,
    ariaLabel,
    width = "132px",
    placeholder,
    step,
    disabled,
    invalid,
}: NumberFieldProps) => {
    const [draft, setDraft] = useState<string | null>(null);

    const handleChange = (raw: string) => {
        setDraft(raw);
        if (raw === "") return;
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) onChange(parsed);
    };

    const handleBlur = () => {
        if (draft !== null && (draft === "" || !Number.isFinite(Number(draft)))) onChange(0);
        setDraft(null);
    };

    return (
        <HanUnitField $width={width} $invalid={invalid}>
            {prefix && <span className="unit">{prefix}</span>}
            <input
                type="number"
                inputMode="decimal"
                min={0}
                step={step ?? 1}
                value={draft ?? String(value)}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={handleBlur}
                aria-label={ariaLabel}
                placeholder={placeholder}
                disabled={disabled}
            />
            {suffix && <span className="unit">{suffix}</span>}
        </HanUnitField>
    );
};
