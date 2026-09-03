import styled, { css } from "styled-components";

import { breakpoints } from "../../styles/breakpoints";
import { chok } from "../mudmue-pick/chok.styles";

/**
 * Primitives ของ MUDMUE Han (route `/han`)
 *
 * ไม่ได้สร้างชุดสีใหม่ — ยืม token ของ Chok มาทั้งชุด (`chok.*`) เพราะสองแอปนี้
 * เป็นเรื่องแบดเหมือนกันและอยู่ในเว็บเดียวกัน สีน้ำเงิน = แอ็กชันหลัก, ชมพู = ลบ,
 * เทา = โครงสร้าง เหมือนกันทุกหน้า ที่เพิ่มเข้ามาคือของที่ Chok ไม่มี:
 * ป้ายราคา (tier chip), ไอคอนคอร์ทที่เป็นจุดวาง, ช่องกรอกเงินที่มี ฿ ติดอยู่,
 * แถบเตือนแบบไม่บล็อก และบรรทัดยอดรวม
 *
 * สเปก: `public/.claude/mudmue-han-badminton-cost-splitter-plan.md`
 */

export { chok } from "../mudmue-pick/chok.styles";

/**
 * สีเสริมเฉพาะ Han
 *
 * การ์ดทุกใบในหน้านี้เป็นพื้นขาวเหมือน section อื่นของเว็บ — มีแค่ "ตัวสนาม" เท่านั้น
 * ที่เป็นเขียว เพราะเขียวคือสีของพื้นคอร์ทแบดจริง ไม่ได้ยืมความหมายจากสีแอ็กชัน
 * (น้ำเงิน) หรือสีลบ (ชมพู) ของเว็บ
 */
export const han = {
    warnBg: "#fff8e6",
    warnLine: "#f0d089",
    warnInk: "#7a5a10",

    /* --- ตัวสนามในการ์ดคอร์ท ------------------------------------------ */
    courtSurface: "#1f7350",
    /** ตอนลากป้ายมาลอยเหนือคอร์ท — พื้นสนามสว่างขึ้น */
    courtSurfaceOver: "#26895f",
    /** เส้นสนาม — ขาวโปร่ง ไม่ใช่ขาวทึบ จะได้ไม่แย่งสายตาไปจากป้ายราคา */
    courtLineOnGreen: "rgba(255, 255, 255, 0.62)",
    /** ตาข่าย — ขาวชัดกว่าเส้นอื่นเพราะเป็นตัวบอกว่ามองจากด้านบน */
    courtNetOnGreen: "rgba(255, 255, 255, 0.94)",

    /** สีเส้นคอร์ทโทนสว่าง เก็บไว้เผื่อจุดอื่นที่อยู่บนพื้นขาว */
    courtNet: chok.courtNet,
    courtLine: chok.courtLine,
} as const;

const focusRing = css`
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/* ------------------------------------------------------------------ */
/* Layout                                                             */
/* ------------------------------------------------------------------ */

export const HanStack = styled.div<{ $gap?: number }>`
    display: flex;
    flex-direction: column;
    gap: ${({ $gap = 12 }) => $gap}px;
    min-width: 0;
`;

/** กล่องหนึ่ง section ของหน้าคำนวณ (ค่าคอร์ท / ค่าลูก / คน / สรุป) */
export const HanSection = styled.section`
    width: 100%;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
    border-radius: 12px;
    padding: 18px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;

    @media (max-width: ${breakpoints.mobile}px) {
        padding: 14px;
        gap: 12px;
    }
`;

export const HanSectionHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

export const HanSectionTitle = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: ${chok.ink};
`;

export const HanHint = styled.p`
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: ${chok.muted};
`;

export const HanRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

/* ------------------------------------------------------------------ */
/* Money & numbers                                                    */
/* ------------------------------------------------------------------ */

/** ยอดรวมของหนึ่ง section — ตัวเลขหนาที่สุดในกล่องนั้น */
export const HanTotal = styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12.5px;
    color: ${chok.muted};

    strong {
        font-size: clamp(19px, 4.5vw, 24px);
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: ${chok.ink};
    }
`;

/** บรรทัดยอดย่อย เช่น "ค่าคอร์ท ... ฿400" */
export const HanTotalLine = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
    color: ${chok.inkSoft};

    b {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        color: ${chok.ink};
    }
`;

export const HanWarning = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 10px;
    background: ${han.warnBg};
    border: 1px solid ${han.warnLine};
    color: ${han.warnInk};
    font-size: 13px;
    line-height: 1.5;
`;

/* ------------------------------------------------------------------ */
/* Chips & badges                                                     */
/* ------------------------------------------------------------------ */

/**
 * ป้ายราคาใบเล็กที่แปะอยู่บนคอร์ท — แตะเพื่อเอาออกจากคอร์ทนั้น (ไม่ได้ลบป้ายต้นฉบับ)
 * สูง 28px ซึ่งต่ำกว่า 44px ที่เป็นมาตรฐาน จึงต้องมีระยะห่างรอบตัวเป็นตัวช่วย และ
 * มีทางลบอีกทางที่หน้าการ์ดป้ายราคาโดยตรง
 */
export const HanTierChip = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 26px;
    max-width: 100%;
    padding: 0 10px;
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 999px;
    border: 1px solid ${chok.primary};
    background: ${chok.primaryTint};
    color: ${chok.primary};
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
        background: ${chok.dangerTint};
        border-color: ${chok.danger};
        color: ${chok.dangerInk};
    }

    ${focusRing}
`;

export const HanBadge = styled.span<{ $tone?: "default" | "active" }>`
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
    background: ${({ $tone }) => ($tone === "active" ? chok.primaryTint : chok.disabledBg)};
    color: ${({ $tone }) => ($tone === "active" ? chok.primary : chok.muted)};
`;

/* ------------------------------------------------------------------ */
/* Inputs                                                             */
/* ------------------------------------------------------------------ */

/**
 * กรอบช่องกรอกที่มีหน่วยติดอยู่ (฿ ข้างหน้า หรือ "ชม." / "ลูก" ข้างหลัง)
 * ทำเป็นกรอบครอบแทนการใส่หน่วยลงใน placeholder เพราะ placeholder หายไปตอนพิมพ์
 * ส่วนหน่วยต้องอยู่ให้เห็นตลอด
 */
export const HanUnitField = styled.div<{ $width?: string; $invalid?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: ${chok.tap};
    width: ${({ $width }) => $width ?? "auto"};
    padding: 0 12px;
    border-radius: 8px;
    background: ${chok.surface};
    border: 1px solid ${({ $invalid }) => ($invalid ? chok.danger : "#c9c9d6")};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        border-color: ${({ $invalid }) => ($invalid ? chok.danger : chok.ink)};
    }
    &:focus-within {
        border-color: ${chok.primary};
        box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.18);
    }

    input {
        min-width: 0;
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-family: inherit;
        font-size: 14px;
        color: ${chok.ink};
        font-variant-numeric: tabular-nums;

        &::placeholder {
            color: ${chok.subtle};
        }
        /* ลูกศร spinner ของ number ตัวเล็กเกินจะกดบนมือถือ — ใช้ปุ่ม stepper แทน */
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            appearance: none;
            margin: 0;
        }
        appearance: textfield;
    }

    /* หน่วย — ต้องอ่านออกแต่ไม่แย่งสายตาไปจากตัวเลข */
    .unit {
        flex-shrink: 0;
        font-size: 13px;
        font-weight: 600;
        color: ${chok.muted};
    }
`;

/**
 * ปุ่ม − / + ของ stepper ขนาดเต็ม 44px
 *
 * `$shape="circle"` + `$tone="filled"` คือคู่ปุ่มแบบในแบบร่าง (− วงกลมโปร่ง / + วงกลมทึบ)
 * ค่าเริ่มต้นยังเป็นปุ่มสี่เหลี่ยมมนแบบเดิม เพราะ stepper ของค่าลูกใช้อยู่
 */
export const HanStepButton = styled.button<{
    $shape?: "square" | "circle";
    $tone?: "outline" | "filled";
    $size?: "md" | "sm";
}>`
    width: ${chok.tap};
    height: ${chok.tap};
    flex-shrink: 0;
    display: grid;
    place-items: center;
    padding: 0;
    font-family: inherit;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    border-radius: ${({ $shape }) => ($shape === "circle" ? "999px" : "8px")};
    border: 1px solid ${({ $tone }) => ($tone === "filled" ? chok.primary : "#c9c9d6")};
    background: ${({ $tone }) => ($tone === "filled" ? chok.primary : chok.surface)};
    color: ${({ $tone }) => ($tone === "filled" ? "#ffffff" : chok.ink)};
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

    &:hover:not(:disabled) {
        border-color: ${chok.primary};
        background: ${({ $tone }) => ($tone === "filled" ? chok.primaryHover : chok.primaryTint)};
        color: ${({ $tone }) => ($tone === "filled" ? "#ffffff" : chok.primary)};
    }
    &:active:not(:disabled) {
        transform: translateY(1px);
    }
    &:disabled {
        background: ${chok.disabledBg};
        color: ${chok.disabledInk};
        border-color: transparent;
        cursor: not-allowed;
    }

    /**
     * ตัวเล็ก — พื้นที่แตะยังเต็ม 44px เหมือนเดิม แต่วงกลมที่มองเห็นเหลือ 28px
     * ทำด้วยขอบโปร่งใส 8px แล้วให้พื้นหลังหยุดที่ padding box ส่วนเส้นขอบวงกลม
     * วาดด้วย inset shadow ซึ่งอิงกับ padding box พอดี
     */
    ${({ $size, $tone }) =>
        $size === "sm" &&
        css`
            border: 8px solid transparent;
            background-clip: padding-box;
            font-size: 15px;
            box-shadow: ${$tone === "filled" ? "none" : `inset 0 0 0 1px #c9c9d6`};

            &:hover:not(:disabled) {
                box-shadow: ${$tone === "filled" ? "none" : `inset 0 0 0 1px ${chok.primary}`};
            }
            &:disabled {
                background: transparent;
                box-shadow: inset 0 0 0 1px ${chok.line};
            }
        `}

    ${focusRing}
`;

/**
 * ช่องกรอกแบบขีดเส้นใต้ (฿ 120 /ชม.) — ใช้ในการ์ดป้ายราคาที่มีของเรียงกันหลายชิ้น
 * กรอบเต็มใบทำให้แถวดูแน่นเกินไป เส้นใต้บอกได้ว่า "ตรงนี้พิมพ์ได้" พอ ๆ กัน
 */
export const HanUnderlineField = styled.div<{ $width?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: ${chok.tap};

    .prefix {
        flex-shrink: 0;
        font-size: 15px;
        font-weight: 700;
        color: ${chok.ink};
    }
    .suffix {
        flex-shrink: 0;
        font-size: 13px;
        font-weight: 500;
        color: ${chok.muted};
    }

    input {
        width: ${({ $width }) => $width ?? "84px"};
        min-width: 0;
        height: 32px;
        padding: 0 2px;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        color: ${chok.ink};
        font-variant-numeric: tabular-nums;
        background: transparent;
        border: none;
        border-bottom: 1px solid #c9c9d6;
        border-radius: 0;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &:hover {
            border-bottom-color: ${chok.ink};
        }
        &:focus-visible {
            outline: none;
            border-bottom-color: ${chok.primary};
            box-shadow: 0 1px 0 0 ${chok.primary};
        }
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            appearance: none;
            margin: 0;
        }
        appearance: textfield;
    }
`;

/**
 * ปุ่ม ✕ วงกลมที่ลอยอยู่มุมการ์ด — พื้นที่แตะเต็ม 44px ตามมาตรฐาน แต่วงกลมที่มองเห็น
 * เล็กกว่านั้น ไม่งั้นจะไปบังมุมการ์ดคอร์ทจนดูหนัก
 */
export const HanFloatingClose = styled.button`
    position: absolute;
    top: -14px;
    right: -14px;
    z-index: 2;
    width: ${chok.tap};
    height: ${chok.tap};
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;

    span {
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: ${chok.surface};
        border: 1px solid ${chok.line};
        box-shadow: 0 2px 6px -2px rgba(20, 20, 40, 0.45);
        font-size: 13px;
        line-height: 1;
        color: ${chok.inkSoft};
        transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    &:hover:not(:disabled) span {
        background: ${chok.dangerTint};
        border-color: ${chok.danger};
        color: ${chok.dangerInk};
    }
    &:disabled {
        cursor: not-allowed;
    }
    &:disabled span {
        opacity: 0.4;
    }

    &:focus-visible {
        outline: none;
    }
    &:focus-visible span {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/** แถวเลือกคน — ทั้งแถวคือเป้าแตะ ไม่ใช่แค่ช่องติ๊ก */
export const HanPersonToggle = styled.button<{ $selected: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: ${chok.tap};
    max-width: 100%;
    padding: 0 16px;
    font-family: inherit;
    font-size: 14px;
    font-weight: ${({ $selected }) => ($selected ? 600 : 500)};
    cursor: pointer;
    border-radius: 999px;
    border: 1px solid ${({ $selected }) => ($selected ? chok.primary : "#c9c9d6")};
    background: ${({ $selected }) => ($selected ? chok.primaryTint : chok.surface)};
    color: ${({ $selected }) => ($selected ? chok.primary : chok.inkSoft)};
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    &:hover {
        border-color: ${chok.primary};
        background: ${({ $selected }) => ($selected ? chok.primaryTintStrong : chok.hover)};
    }

    ${focusRing}
`;
