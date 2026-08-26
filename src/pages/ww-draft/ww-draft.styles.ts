import styled, { css } from "styled-components";

import { breakpoints } from "../../styles/breakpoints";

/**
 * ธีมของหน้า WuWa Draft — พื้นเทาอ่อน panel ขาว เพื่อให้กล่องเนื้อหาลอยขึ้นมา
 * จากพื้น (มุมตัดแบบ HUD จะเห็นเป็นรอยบากสีเทาตรงมุม ดู `wwFramed` ด้านล่าง)
 * สีเน้นเดียวยังเป็นทอง/ครีม และเส้นขอบเป็นเส้นผมสีน้ำเงินเหล็กโปร่ง ๆ
 *
 * ไล่ระดับ `neutral*` อ่านว่า 100 = พื้น, 900 = ตัวอักษรเด่นสุด
 *
 * หมายเหตุเรื่องทอง: `accent` เป็น "ทองพื้น" ใช้กับพื้นทึบเท่านั้น (ปุ่ม primary,
 * ป้ายธาตุ) ห้ามเอาไปเป็นสีตัวอักษรบนพื้นสว่าง เพราะได้แค่ 1.9:1 — บทบาทหมึก
 * ให้ใช้ `accent700`/`accent800` ที่เข้มลงมาแทน
 *
 * Scoped to the WW Draft page so the rest of the site keeps the pastel Mudmue look.
 */
export const wwTheme = {
    /** พื้นเพจ — เทาอ่อนกว่า panel เพื่อให้กล่องเนื้อหาแยกตัวออกมา */
    bg: "#f4f6f8",
    /** พื้นของ panel/กล่องลอย */
    surface: "#ffffff",
    text: "#10171e",
    accent: "#d9b878",
    accent2: "#c8d8e2",
    /** เส้นในเนื้อหา (2px) — น้ำเงินเหล็กโปร่งแบบเส้นกรอบในเกม */
    line: "color-mix(in srgb, #3d5a6c 38%, transparent)",
    /** เส้นขอบการ์ด/กล่องเมนู — บางและจางกว่า `line` */
    cardLine: "color-mix(in srgb, #3d5a6c 26%, transparent)",
    /** เส้นขอบปุ่ม — เข้มกว่าเส้นทั่วไป เพราะเป็นของที่กดได้ (ต้องได้ 3:1) */
    lineBright: "color-mix(in srgb, #3d5a6c 70%, transparent)",
    /** พื้นโปร่งแบบกระจกของปุ่ม — ให้เห็นฉากหลังจาง ๆ ทะลุขึ้นมา */
    glass: "color-mix(in srgb, #c6e2f0 7%, transparent)",
    glassHover: "color-mix(in srgb, #c6e2f0 15%, transparent)",
    glassActive: "color-mix(in srgb, #c6e2f0 22%, transparent)",
    /** ตัวอักษรบนพื้นสีเน้น (ทอง/ฟ้า) — ต้องเป็นสีเข้ม ไม่ใช่ขาว */
    onAccent: "#10171e",
    /** ฝ้าคลุมรูปตัวละครที่ถูกแบน — สว่างกว่ารูป เพื่อให้คำว่า BAN เป็นหมึกเข้มทับได้ */
    scrim: "color-mix(in srgb, #f4f6f8 78%, transparent)",

    neutral100: "#eceff3",
    neutral200: "#e4e9ee",
    neutral300: "#d4dce3",
    neutral400: "#a9b6c0",
    neutral500: "#71828f",
    neutral600: "#5b6b79",
    neutral700: "#3a4a58",
    neutral800: "#263542",
    neutral900: "#0e1720",

    accent100: "color-mix(in srgb, #d9b878 12%, transparent)",
    accent200: "color-mix(in srgb, #d9b878 22%, transparent)",
    accent400: "#c2a065",
    accent600: "#e8cd94",
    /** ทองบทบาทหมึก — ใช้บนพื้นทองจาง (`accent100`) ได้ 7.0:1 */
    accent700: "#6b5015",
    accent800: "#5c440f",

    accent2100: "color-mix(in srgb, #c8d8e2 12%, transparent)",
    accent2700: "#dbe7ef",
    accent2800: "#eef4f8",

    /** The two sides have to be told apart from across a room — players watch the
        board too — so they carry the site's two brand hues instead of two shades
        of the same red. น้ำเงินมาจาก --brand-blue-soft ส่วนอีกฝั่งเป็นส้มแดงของหน้านี้

        ค่าคู่นี้ถูกจูนมาสำหรับพื้นมืดและจงใจคงไว้ตอนเปลี่ยนมาพื้นสว่าง เพื่อให้ยัง
        เป็นสีเดิมที่จำได้ ผลคือบนพื้นเทาได้แค่ ~2:1 — ใช้บอก "ฝั่งไหน" ได้ แต่อย่า
        เอาไปแบกข้อความที่ต้องอ่านออกลำพัง ให้มีชื่อ/ไอคอนกำกับคู่กันเสมอ */
    p1: "#7fb8ff",
    p1Soft: "#a9d0ff",
    p1Tint: "color-mix(in srgb, #7fb8ff 14%, transparent)",
    p2: "#ff8a5c",
    p2Soft: "#ffb193",
    p2Tint: "color-mix(in srgb, #ff8a5c 14%, transparent)",

    fontHeading: '"Archivo", "Noto Sans", system-ui, sans-serif',
    fontBody: '"Archivo", "Noto Sans", system-ui, sans-serif',

    /* The Modernist draft specifies radius 0 throughout. We deliberately depart
       from it here so this page sits with the rest of the site, which is
       rounded (daisyUI rounded-box, the 16px home cards, the 4px tab menu). */
    /** คอนโทรลในกระดาน draft (ปุ่ม/แถบเฟส/ป้าย) ใช้มุมคมเกือบฉาก ให้เข้ากับ
        กล่องมุมตัดแบบ HUD ส่วนเมนู/หัวเพจยังมนตามเว็บ */
    radiusHud: "2px",
    radiusSm: "6px",
    radiusMd: "8px",
    radiusLg: "12px",
    radiusFull: "999px",

    /* Role aliases. สถานะเตือน/ผิดพลาดต้องแยกออกจากสีเน้น เพราะสีเน้นเป็นทอง
       ซึ่งอ่านเป็น "ของสำคัญ" ไม่ใช่ "ของผิด" */
    panel: "#ffffff",
    /** พื้นของกล่องซ้อนในกล่อง — เทาจาง ๆ เพื่อแยกตัวจาก panel ที่เป็นขาว */
    panelSoft: "#f1f4f7",
    textDim: "#5b6b79",
    ban: "#c2321f",
    warn: "#9a5b0a",
    ok: "#1c7a4a",
} as const;

/* ------------------------------------------------------------------ */
/* กรอบมุมตัดแบบ HUD ในเกม                                            */
/* ------------------------------------------------------------------ */

/** รูปทรงของกล่องในหน้านี้ — คืนค่าเป็น polygon() ไว้ยัดใส่ clip-path */
export const wwShape = {
    /** ตัดมุมบนซ้าย/ล่างขวา — ลายเซ็นของแผงข้อมูลใน Wuthering Waves */
    cut: (cut: string) =>
        `polygon(${cut} 0, 100% 0, 100% calc(100% - ${cut}), calc(100% - ${cut}) 100%, 0 100%, 0 ${cut})`,
    /** ปลายเฉียงสองข้าง — ทรงปุ่มยืนยันในเกม */
    lozenge: (angle: string) =>
        `polygon(${angle} 0, calc(100% - ${angle}) 0, 100% 50%, calc(100% - ${angle}) 100%, ${angle} 100%, 0 50%)`,
} as const;

/** มุมตัด ใช้กับกล่องที่ไม่ต้องมีเส้นขอบ เช่น รูปย่อ */
export const wwCut = (cut: string) => css`
    clip-path: ${wwShape.cut(cut)};
`;

/**
 * ขีดมุมบาง ๆ ที่มุมขวาบน/ซ้ายล่าง — เหมือนกรอบรูปตัวละครในหน้าจัดทีมของเกม
 * วาดลงบนชั้นพื้น (::after) ด้วย background-image จึงต้องใส่ *หลัง* `wwFramed`
 */
export const wwCornerTicks = (tick = "color-mix(in srgb, #3d5a6c 45%, transparent)") => css`
    &::after {
        background-image: linear-gradient(${tick}, ${tick}), linear-gradient(${tick}, ${tick}),
            linear-gradient(${tick}, ${tick}), linear-gradient(${tick}, ${tick});
        background-repeat: no-repeat;
        background-size: 12px 1px, 1px 12px, 12px 1px, 1px 12px;
        background-position: right 7px top 7px, right 7px top 7px, left 7px bottom 7px, left 7px bottom 7px;
    }
`;

/**
 * กล่องรูปทรงอิสระที่ยังมีเส้นขอบ — `border` ปกติใช้ไม่ได้เพราะ clip-path ตัด
 * เส้นตรงมุมทิ้งไป เลยวาดเป็นสองชั้นแทน: ::before คือสีขอบเต็มกล่อง ::after คือ
 * พื้นที่หดเข้ามาตามความหนาขอบ เหลือขอบโผล่เป็นกรอบรอบ ๆ รวมถึงด้านเฉียง
 *
 * clip-path สร้าง stacking context ให้อยู่แล้ว `z-index: -1` จึงลงไปอยู่ใต้
 * เนื้อหาแต่ยังอยู่ในกล่อง ไม่หลุดไปใต้พื้นหลังของเพจ
 */
export const wwFramedShape = (shape: string, edge: string, fill: string, width = "1px") => css`
    position: relative;
    background: transparent;
    border: none;
    border-radius: 0;
    clip-path: ${shape};

    &::before,
    &::after {
        content: "";
        position: absolute;
        z-index: -1;
        clip-path: inherit;
    }
    &::before {
        inset: 0;
        background: ${edge};
    }
    &::after {
        inset: ${width};
        background: ${fill};
    }
`;

/** กล่องมุมตัด — ทรงที่ใช้บ่อยที่สุด เลยมีตัวช่วยแยกไว้ */
export const wwFramed = (cut: string, edge: string, fill: string, width = "1px") =>
    wwFramedShape(wwShape.cut(cut), edge, fill, width);

/**
 * Root of a themed sub-page. Deliberately borderless: in this system the
 * panels carry the rules, so wrapping them in another box would double the
 * frame. Outer padding comes from the page's <Main>.
 */
export const WWSurface = styled.div`
    width: 100%;
    min-width: 0;
    background: ${wwTheme.bg};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontBody};
    font-size: 15px;
    line-height: 1.55;
`;

/**
 * กล่องเนื้อหาหลัก — พื้นขาวขอบบางแบบ ChokCard แต่มุมตัดแบบแผง HUD ในเกม
 * `$edge` / `$edgeWidth` ไว้เน้นกรอบ เช่น กล่องเตือน หรือฝั่งที่ถึงตาเล่น
 * (กรอบเป็นชั้น ::before ไม่ใช่ border จริง — override ด้วย border-color ไม่ได้)
 */
export const WWPanel = styled.div<{ $edge?: string; $edgeWidth?: string }>`
    ${({ $edge, $edgeWidth }) => wwFramed("14px", $edge ?? wwTheme.cardLine, wwTheme.surface, $edgeWidth ?? "1px")}
    ${wwCornerTicks()}
    padding: 20px;

    @media (max-width: ${breakpoints.mobile}px) {
        padding: 12px;
    }
`;

/**
 * ชื่อแท็บที่กำลังเปิด วางไว้บนสุดของ <Main> — ใหญ่กว่า WWPanelTitle หนึ่งขั้น
 * เพื่อให้ลำดับเป็น ชื่อหน้า > ชื่อแท็บ > ชื่อ panel
 */
export const WWSectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 19px;
    line-height: 1.2;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    /* เส้นจาง ๆ ลากยาวจากชื่อไปจนสุดขอบ แบบหัวข้อในเมนูเกม */
    &::after {
        content: "";
        flex: 1;
        height: 2px;
        background: linear-gradient(to right, ${wwTheme.accent}, transparent);
    }
`;

export const WWPanelTitle = styled.h3`
    margin: 0 0 12px;
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 15px;
    line-height: 1.12;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    /* ขีดเอียงหน้าหัวข้อ — ใช้ currentColor เพื่อให้หัวข้อที่ย้อมสีฝั่ง P1/P2
       ได้ขีดสีเดียวกัน */
    &::before {
        content: "";
        display: inline-block;
        width: 9px;
        height: 12px;
        margin-right: 9px;
        vertical-align: -1px;
        background: currentColor;
        transform: skewX(-20deg);
    }
`;

/** 2px horizontal rule — the system's main separator. */
export const WWRule = styled.div`
    height: 2px;
    background: ${wwTheme.line};
    margin: 12px 0;
`;

export const WWSectionRow = styled.div`
    display: flex;
    gap: 16px;
    align-items: flex-start;

    @media (max-width: ${breakpoints.tablet}px) {
        flex-direction: column;
    }
`;

export const WWButton = styled.button<{ tone?: "primary" | "ghost" | "danger" | "warn"; $active?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 14px;
    line-height: 1.2;
    color: ${wwTheme.text};
    padding: 8px 20px;
    transition: color 0.15s ease, filter 0.15s ease;

    /* ทรงปลายเฉียงแบบปุ่มในเกม — สีขอบอยู่ที่ ::before สีพื้นอยู่ที่ ::after
       เพราะ border/background ปกติจะโดน clip-path เฉือนปลายทิ้ง */
    ${wwFramedShape(wwShape.lozenge("9px"), wwTheme.lineBright, wwTheme.glass)}

    &:hover:not(:disabled)::after {
        background: ${wwTheme.glassHover};
    }
    &:active:not(:disabled)::after {
        background: ${wwTheme.glassActive};
    }
    /* outline โดนมุมเฉียงตัดหาย เลยเน้นด้วยขอบทองกับแสงเรืองแทน */
    &:focus-visible {
        outline: none;
        filter: drop-shadow(0 0 5px color-mix(in srgb, ${wwTheme.accent} 65%, transparent));
    }
    &:focus-visible::before {
        background: ${wwTheme.accent};
    }

    ${({ tone }) =>
        tone === "primary" &&
        css`
            color: ${wwTheme.onAccent};

            &::before {
                background: ${wwTheme.accent};
            }
            &::after {
                background: ${wwTheme.accent};
            }
            &:hover:not(:disabled)::after {
                background: ${wwTheme.accent600};
            }
            &:active:not(:disabled)::after {
                background: ${wwTheme.accent400};
            }
        `}

    ${({ tone }) =>
        tone === "danger" &&
        css`
            color: ${wwTheme.ban};

            &::before {
                background: ${wwTheme.ban};
            }
            &:hover:not(:disabled)::after {
                background: color-mix(in srgb, ${wwTheme.ban} 16%, transparent);
            }
        `}

    ${({ tone }) =>
        tone === "warn" &&
        css`
            color: ${wwTheme.warn};

            &::before {
                background: ${wwTheme.warn};
            }
            &::after {
                background: color-mix(in srgb, ${wwTheme.warn} 12%, transparent);
            }
        `}

    ${({ tone }) =>
        tone === "ghost" &&
        css`
            color: ${wwTheme.accent};

            &::before {
                background: transparent;
            }
            &::after {
                background: transparent;
            }
            &:hover:not(:disabled)::after {
                background: color-mix(in srgb, ${wwTheme.accent} 12%, transparent);
            }
        `}

    ${({ $active }) =>
        $active &&
        css`
            color: ${wwTheme.accent700};

            &::before {
                background: ${wwTheme.accent};
            }
            &::after {
                background: ${wwTheme.accent100};
            }
        `}

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

export const WWBadge = styled.span<{ color?: string; $variant?: "accent" | "neutral" | "outline" }>`
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    letter-spacing: 0.02em;
    padding: 3px 10px;
    border-radius: ${wwTheme.radiusHud};

    ${({ $variant = "accent", color }) => {
        if ($variant === "neutral") {
            return css`
                background: ${wwTheme.neutral100};
                color: ${wwTheme.neutral800};
            `;
        }
        if ($variant === "outline") {
            return css`
                border: 1px solid ${color ?? wwTheme.accent};
                color: ${color ?? wwTheme.accent};
            `;
        }
        return css`
            background: ${wwTheme.accent100};
            color: ${color ?? wwTheme.accent800};
        `;
    }}
`;

/**
 * Segmented control — the phase switcher across the top of the board.
 * ปลายเฉียงเหมือนปุ่ม แต่เป็นแถบเดียวยาว ไม่ใช่เฉียงทีละช่อง
 */
export const WWSeg = styled.div`
    ${wwFramedShape(wwShape.lozenge("10px"), wwTheme.lineBright, wwTheme.glass)}
    display: inline-flex;
    flex-wrap: wrap;
`;

export const WWSegOption = styled.button<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 12px;
    cursor: default;
    border: none;
    border-left: 1px solid ${wwTheme.cardLine};
    background: ${({ $active }) => ($active ? wwTheme.accent : "transparent")};
    color: ${({ $active }) => ($active ? wwTheme.onAccent : wwTheme.text)};

    &:first-child {
        border-left: none;
    }
`;

/** Progress pip for the turn tracker — filled once the turn is spent.
    `$accent` lets the pips take the acting side's colour; falls back to the
    page accent when no side owns them. */
export const WWDot = styled.span<{ $state: "done" | "current" | "pending"; $accent?: string }>`
    width: 9px;
    height: 9px;
    display: inline-block;
    border-radius: 50%;
    background: ${({ $state, $accent }) => ($state === "done" ? ($accent ?? wwTheme.accent) : wwTheme.bg)};
    border: ${({ $state, $accent }) =>
        $state === "current"
            ? `2px solid ${$accent ?? wwTheme.accent}`
            : $state === "pending"
              ? `1px solid ${wwTheme.line}`
              : "none"};
`;

export const WWInput = styled.input`
    width: 100%;
    min-height: 36px;
    padding: 6px 10px;
    font: inherit;
    font-size: 14px;
    color: ${wwTheme.text};
    caret-color: ${wwTheme.accent};
    background: ${wwTheme.surface};
    border: 1px solid ${wwTheme.line};
    border-radius: ${wwTheme.radiusHud};

    &::placeholder {
        color: ${wwTheme.neutral500};
    }
    &:hover {
        border-color: color-mix(in srgb, ${wwTheme.text} 45%, transparent);
    }
    &:focus-visible {
        border-color: ${wwTheme.accent};
        outline: none;
    }
`;

export const WWEmpty = styled.div`
    padding: 24px;
    text-align: center;
    color: ${wwTheme.neutral500};
    font-size: 13px;
`;

/** Heading font helper for the numeric readouts (score, clock). */
export const WWReadout = styled.div`
    font-family: ${wwTheme.fontHeading};
    font-weight: 800;
    font-size: 20px;
    display: flex;
    gap: 8px;
    align-items: baseline;
`;
