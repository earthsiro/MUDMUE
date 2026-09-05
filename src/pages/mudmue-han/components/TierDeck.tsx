import { HanBadge, HanHint, HanStepButton, HanUnderlineField, chok } from "../han.styles";

import { IconClock } from "../../../components/icons";
import { breakpoints } from "../../../styles/breakpoints";
import { formatBaht } from "../../../helpers/hanCalc";
import styled from "styled-components";
import { useDraftNumber } from "./useDraftNumber";
import { useHan } from "../context/hanContext";
import { useRef, useState } from "react";

/**
 * "การ์ด ชม." — ป้ายราคาแยกชิ้นที่ยังไม่ผูกกับคอร์ทใด สร้างไว้ก่อนแล้วค่อยเอาไปแปะ
 *
 * เอาไปแปะคอร์ทได้สองทาง ใช้ได้ทั้งเมาส์และนิ้ว:
 * - ลาก: เมาส์ลากจากที่ไหนของการ์ดก็ได้ ส่วนนิ้วจับที่ปุ่ม ⠿ (ที่อื่นสงวนไว้ให้เลื่อนหน้าจอ)
 * - แตะ: แตะการ์ดหนึ่งครั้งเพื่อเลือก แล้วไปแตะคอร์ท
 *
 * ทั้งสองทางเดินบน Pointer Events ชุดเดียวกัน ไม่ใช่ HTML5 drag-and-drop ซึ่งไม่ยิง
 * event ให้เลยบนทัช (เป็นสาเหตุที่การ์ดลากไม่ได้บนแท็บเล็ตมาก่อนหน้านี้)
 */

/** การ์ดใบเล็กเรียงต่อกันเป็นแถว ไม่ใช่แถวยาวเต็มความกว้าง — ป้ายราคาปกติมีแค่ 2-3 ใบ
    แถวยาวทั้งบรรทัดเลยเหลือที่ว่างด้านขวาเปล่า ๆ */
const Deck = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
    gap: 8px;

    @media (max-width: ${breakpoints.mobile}px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Card = styled.div<{ $picked: boolean }>`
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 36px;
    grid-template-areas:
        "grip label remove"
        "controls controls controls";
    align-items: center;
    column-gap: 4px;
    row-gap: 2px;
    padding: 2px 4px 6px;
    cursor: grab;
    border-radius: 12px;
    /* ลากด้วยเมาส์แล้วอย่าไปลากเลือกตัวหนังสือบนการ์ด — ในช่องกรอกยังเลือกได้ตามปกติ */
    user-select: none;
    background: ${({ $picked }) => ($picked ? chok.primaryTint : chok.surface)};
    border: 1px solid ${({ $picked }) => ($picked ? chok.primary : chok.line)};
    transition: background 0.15s ease, border-color 0.15s ease;

    &:active {
        cursor: grabbing;
    }

    input {
        user-select: text;
    }
`;

/**
 * ปุ่ม grip — 44px เต็มตามมาตรฐานการแตะ แต่จุดที่มองเห็นเล็กกว่านั้น เพราะการ์ดใบนี้
 * ต้องดูเบา ไม่ใช่การ์ดที่มีปุ่มใหญ่สี่ห้าปุ่มเรียงกัน
 */
const Grip = styled.div<{ $picked: boolean }>`
    grid-area: grip;
    justify-self: center;
    width: ${chok.tap};
    height: ${chok.tap};
    margin: 0 -4px;
    display: grid;
    place-items: center;
    font-size: 14px;
    line-height: 1;
    letter-spacing: -2px;
    user-select: none;
    cursor: grab;
    /* จับที่นี่แล้วลากด้วยนิ้วได้ ไม่ถูกเบราว์เซอร์แย่งไปเลื่อนหน้าจอ */
    touch-action: none;
    color: ${({ $picked }) => ($picked ? chok.primary : chok.subtle)};
    transition: color 0.15s ease;

    span {
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: ${({ $picked }) => ($picked ? chok.primary : "transparent")};
        color: ${({ $picked }) => ($picked ? "#ffffff" : "inherit")};
        transition: background 0.15s ease, color 0.15s ease;
    }

    &:hover span {
        background: ${({ $picked }) => ($picked ? chok.primary : chok.hover)};
        color: ${({ $picked }) => ($picked ? "#ffffff" : chok.primary)};
    }
    &:focus-visible {
        outline: none;
    }
    &:focus-visible span {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

const LabelCell = styled.div`
    grid-area: label;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
`;

const LabelInput = styled.input`
    flex: 1;
    min-width: 0;
    height: 34px;
    padding: 0 6px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    color: ${chok.ink};
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    transition: border-color 0.15s ease, background 0.15s ease;

    &:hover {
        border-color: ${chok.line};
        background: ${chok.surfaceAlt};
    }
    &:focus-visible {
        outline: none;
        background: ${chok.surface};
        border-color: ${chok.primary};
        box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.18);
    }
    &::placeholder {
        color: ${chok.subtle};
        font-weight: 400;
    }
`;

const Controls = styled.div`
    grid-area: controls;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 8px;
    padding: 0 2px 0 6px;
`;

const HoursGroup = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 2px;
`;

/** ตัวเลขชั่วโมงตรงกลาง stepper — พิมพ์ทับได้ เพราะ 1.5 ชม. เป็นเรื่องปกติ */
const HoursValue = styled.input`
    width: 34px;
    height: 30px;
    padding: 0;
    text-align: center;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    color: ${chok.ink};
    font-variant-numeric: tabular-nums;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;

    &:hover {
        border-bottom-color: ${chok.line};
    }
    &:focus-visible {
        outline: none;
        border-bottom-color: ${chok.primary};
    }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
    }
    appearance: textfield;
`;

const Unit = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    color: ${chok.muted};
`;

/** ยอดของป้ายใบนี้ — โผล่เฉพาะตอนที่ชั่วโมงไม่ใช่ 1 ซึ่งเป็นตอนที่คูณแล้วไม่ตรงกับราคาที่กรอก */
const TierTotal = styled.span`
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: ${chok.inkSoft};
`;

const RemoveTier = styled.button`
    grid-area: remove;
    justify-self: center;
    width: ${chok.tap};
    height: ${chok.tap};
    margin: 0 -4px;
    display: grid;
    place-items: center;
    padding: 0;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    border: none;
    background: transparent;
    color: ${chok.subtle};

    span {
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        transition: background 0.15s ease, color 0.15s ease;
    }

    &:hover span {
        background: ${chok.dangerTint};
        color: ${chok.dangerInk};
    }
    &:focus-visible {
        outline: none;
    }
    &:focus-visible span {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/**
 * ป้ายจำลองที่ลอยตามนิ้ว/เมาส์ระหว่างลาก
 *
 * ต้อง `pointer-events: none` เพราะระหว่างลากเราหาคอร์ทปลายทางด้วย
 * `document.elementFromPoint` — ถ้าตัวนี้รับ event ก็จะเจอแต่ตัวเองทุกครั้ง
 */
const DragGhost = styled.div`
    position: fixed;
    z-index: 60;
    transform: translate(-50%, -150%);
    pointer-events: none;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    color: #ffffff;
    background: ${chok.primary};
    box-shadow: 0 6px 16px rgba(0, 0, 60, 0.28);
`;

/** ปุ่มเพิ่มแบบตัวหนังสือ ไม่ใช่กล่องเส้นประ — การ์ดคอร์ทข้างบนใช้กล่องเส้นประไปแล้ว */
const AddTier = styled.button`
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: ${chok.tap};
    padding: 0 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: ${chok.primary};
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background: transparent;

    &:hover {
        background: ${chok.primaryTint};
    }
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }
`;

/** คอร์ทที่อยู่ใต้จุดนี้ — การ์ดคอร์ทติด `data-court-id` ไว้ให้หาเจอ */
const courtIdAt = (x: number, y: number): string | null =>
    (document.elementFromPoint(x, y) as HTMLElement | null)?.closest("[data-court-id]")?.getAttribute(
        "data-court-id"
    ) ?? null;

/** ระยะที่ถือว่า "ลาก" ไม่ใช่ "แตะ" — นิ้วสั่นไม่กี่พิกเซลยังต้องนับเป็นแตะอยู่ */
const DRAG_THRESHOLD = 8;

const TierRow = ({ tierId }: { tierId: string }) => {
    const { session, updateTier, removeTier, pickedTierId, setPickedTierId, attachTier, setDragOverCourtId } =
        useHan();
    const tier = session.tiers.find((item) => item.id === tierId);
    const price = useDraftNumber((value) => updateTier(tierId, { pricePerHour: value }));
    const hours = useDraftNumber((value) => updateTier(tierId, { hours: value }));
    /** ข้อมูลของการลากที่กำลังเกิดอยู่ — เก็บใน ref เพราะอ่าน/เขียนทุก pointermove */
    const drag = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);
    const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
    /** เบราว์เซอร์ยิง click ตามหลังการปล่อยลากด้วย — กันไม่ให้ไปสลับสถานะเลือกซ้ำ */
    const justDragged = useRef(false);

    if (!tier) return null;

    const name = tier.label || "ป้ายราคา";
    const picked = pickedTierId === tier.id;
    /** จำนวนจุดที่ป้ายนี้ถูกแปะอยู่ — ป้ายเดียวแปะหลายคอร์ทได้ และซ้ำบนคอร์ทเดียวกันได้ */
    const used = session.courts.reduce(
        (sum, court) => sum + court.tierIds.filter((id) => id === tier.id).length,
        0
    );

    /**
     * ลากด้วย Pointer Events ไม่ใช่ HTML5 drag-and-drop
     *
     * HTML5 drag ไม่ยิง event ให้เลยบนทัช การ์ดจึงลากไม่ได้ทั้งบนแท็บเล็ตและมือถือ
     * ทางนี้เมาส์/นิ้ว/ปากกาเดินโค้ดชุดเดียวกัน โดยนิ้วต้องจับที่ปุ่ม ⠿ เพื่อไม่ให้
     * แย่งการเลื่อนหน้าจอ ส่วนเมาส์ลากจากที่ไหนของการ์ดก็ได้เหมือนเดิม
     */
    const endDrag = (x: number, y: number) => {
        const state = drag.current;
        drag.current = null;
        setGhost(null);
        setDragOverCourtId(null);
        if (!state?.moved) return;
        justDragged.current = true;

        const courtId = courtIdAt(x, y);
        if (courtId) {
            attachTier(courtId, tier.id);
            setPickedTierId(null);
        }
    };

    return (
        <Card
            $picked={picked}
            onPointerDown={(e) => {
                /* กดในช่องกรอกหรือปุ่ม = ตั้งใจพิมพ์/กดปุ่ม ไม่ใช่ลากการ์ด */
                if ((e.target as HTMLElement).closest("input, button")) return;
                /* นิ้วลากได้เฉพาะจากปุ่ม ⠿ ที่อื่นปล่อยให้เลื่อนหน้าจอตามปกติ */
                if (e.pointerType === "touch" && !(e.target as HTMLElement).closest("[data-grip]")) return;
                drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false };
                e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
                const state = drag.current;
                if (!state || state.pointerId !== e.pointerId) return;

                if (!state.moved) {
                    const far = Math.hypot(e.clientX - state.startX, e.clientY - state.startY);
                    if (far < DRAG_THRESHOLD) return;
                    state.moved = true;
                    setPickedTierId(tier.id);
                }
                setGhost({ x: e.clientX, y: e.clientY });
                setDragOverCourtId(courtIdAt(e.clientX, e.clientY));
            }}
            onPointerUp={(e) => endDrag(e.clientX, e.clientY)}
            onPointerCancel={() => endDrag(-1, -1)}
            onClick={(e) => {
                /* ปล่อยหลังลาก ไม่ใช่การแตะเลือก และการกดในช่องกรอก/ปุ่มก็ไม่ใช่ */
                if (justDragged.current) {
                    justDragged.current = false;
                    return;
                }
                if ((e.target as HTMLElement).closest("input, button")) return;
                setPickedTierId(picked ? null : tier.id);
            }}
        >
            {ghost && (
                <DragGhost style={{ left: ghost.x, top: ghost.y }} aria-hidden>
                    {name}
                </DragGhost>
            )}
            <Grip
                role="button"
                tabIndex={0}
                data-grip
                $picked={picked}
                title={picked ? `ยกเลิกการเลือก ${name}` : `ลาก ${name} ไปวางบนคอร์ท หรือแตะเพื่อเลือก`}
                aria-label={picked ? `ยกเลิกการเลือก ${name}` : `เลือกช่วงราคา ${name}`}
                aria-pressed={picked}
                onClick={(e) => {
                    /* การ์ดที่ครอบอยู่ก็สลับสถานะเลือกเหมือนกัน ปล่อยทะลุไปจะกลายเป็นสลับสองครั้ง */
                    e.stopPropagation();
                    if (justDragged.current) {
                        justDragged.current = false;
                        return;
                    }
                    setPickedTierId(picked ? null : tier.id);
                }}
                onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    setPickedTierId(picked ? null : tier.id);
                }}
            >
                <span aria-hidden>⠿</span>
            </Grip>

            <LabelCell>
                <LabelInput
                    type="text"
                    value={tier.label}
                    maxLength={20}
                    placeholder="ชื่อช่วงเวลา"
                    aria-label={`ชื่อช่วงราคาของ ${name}`}
                    onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                />
                {used > 0 && <HanBadge $tone="active">{used} จุด</HanBadge>}
            </LabelCell>

            <Controls>
                <HanUnderlineField $width="58px">
                    <span className="prefix">฿</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={price.draft ?? String(tier.pricePerHour)}
                        aria-label={`ราคาต่อชั่วโมงของ ${name} (บาท)`}
                        onChange={(e) => price.onChange(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={price.onBlur}
                    />
                    <span className="suffix">/ชม.</span>
                </HanUnderlineField>

                <HoursGroup>
                    <HanStepButton
                        type="button"
                        $shape="circle"
                        $size="sm"
                        disabled={tier.hours <= 0}
                        aria-label={`ลดชั่วโมงของ ${name}`}
                        onClick={() => updateTier(tier.id, { hours: Math.max(0, tier.hours - 0.5) })}
                    >
                        −
                    </HanStepButton>
                    <HoursValue
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        value={hours.draft ?? String(tier.hours)}
                        aria-label={`จำนวนชั่วโมงของ ${name}`}
                        onChange={(e) => hours.onChange(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={hours.onBlur}
                    />
                    <HanStepButton
                        type="button"
                        $shape="circle"
                        $tone="filled"
                        $size="sm"
                        aria-label={`เพิ่มชั่วโมงของ ${name}`}
                        onClick={() => updateTier(tier.id, { hours: tier.hours + 0.5 })}
                    >
                        ＋
                    </HanStepButton>
                    <Unit>
                        <IconClock size={14} />
                        ชม.
                    </Unit>
                </HoursGroup>

                {tier.hours !== 1 && <TierTotal>= {formatBaht(tier.pricePerHour * tier.hours)}</TierTotal>}
            </Controls>

            <RemoveTier
                type="button"
                title={`ลบป้าย ${name}`}
                aria-label={`ลบป้ายราคา ${name}`}
                onClick={() => removeTier(tier.id)}
            >
                <span aria-hidden>✕</span>
            </RemoveTier>
        </Card>
    );
};

export const TierDeck = () => {
    const { session, addTier } = useHan();

    return (
        <>
            <Deck>
                {session.tiers.map((tier) => (
                    <TierRow key={tier.id} tierId={tier.id} />
                ))}
            </Deck>

            <AddTier type="button" onClick={addTier} aria-label="เพิ่มช่วงราคา">
                <span aria-hidden>＋</span>
                เพิ่มช่วงราคา
            </AddTier>

            {session.tiers.length === 0 && (
                <HanHint>ยังไม่มีป้ายราคา — กด "เพิ่มช่วงราคา" แล้วลากไปแปะบนคอร์ทที่ใช้ช่วงราคานั้น</HanHint>
            )}
        </>
    );
};
