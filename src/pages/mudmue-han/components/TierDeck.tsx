import { HanBadge, HanHint, HanStepButton, HanUnderlineField, chok } from "../han.styles";

import { IconClock } from "../../../components/icons";
import { breakpoints } from "../../../styles/breakpoints";
import { formatBaht } from "../../../helpers/hanCalc";
import styled from "styled-components";
import { useHan } from "../context/hanContext";
import { useState } from "react";

/**
 * "การ์ด ชม." — ป้ายราคาแยกชิ้นที่ยังไม่ผูกกับคอร์ทใด สร้างไว้ก่อนแล้วค่อยเอาไปแปะ
 *
 * ลากได้ทั้งใบ ไม่ต้องจับที่ grip — ยกเว้นตอนที่เริ่มลากจากในช่องกรอกหรือปุ่ม ซึ่ง
 * `onDragStart` จะยกเลิกให้ เพื่อให้ลากเลือกตัวเลขในช่องได้ตามปกติ
 * ส่วนปุ่ม grip ยังอยู่ในฐานะ "แตะเพื่อเลือกแล้วไปแตะคอร์ท" ซึ่งเป็นทางเดียวที่ใช้ได้
 * บนมือถือ (HTML5 drag ไม่ทำงานบนทัชเลย)
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
    background: ${({ $picked }) => ($picked ? chok.primaryTint : chok.surface)};
    border: 1px solid ${({ $picked }) => ($picked ? chok.primary : chok.line)};
    transition: background 0.15s ease, border-color 0.15s ease;

    &:active {
        cursor: grabbing;
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

/** ค่าที่พิมพ์ค้างไว้ระหว่างโฟกัส เก็บเป็น string ให้ลบจนว่างได้โดยไม่เด้งเป็น 0 */
const useDraftNumber = (commit: (value: number) => void) => {
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

const TierRow = ({ tierId }: { tierId: string }) => {
    const { session, updateTier, removeTier, pickedTierId, setPickedTierId } = useHan();
    const tier = session.tiers.find((item) => item.id === tierId);
    const price = useDraftNumber((value) => updateTier(tierId, { pricePerHour: value }));
    const hours = useDraftNumber((value) => updateTier(tierId, { hours: value }));

    if (!tier) return null;

    const name = tier.label || "ป้ายราคา";
    const picked = pickedTierId === tier.id;
    /** จำนวนจุดที่ป้ายนี้ถูกแปะอยู่ — ป้ายเดียวแปะหลายคอร์ทได้ และซ้ำบนคอร์ทเดียวกันได้ */
    const used = session.courts.reduce(
        (sum, court) => sum + court.tierIds.filter((id) => id === tier.id).length,
        0
    );

    return (
        <Card
            $picked={picked}
            draggable
            onDragStart={(e) => {
                /* เริ่มลากจากในช่องกรอกหรือปุ่ม = ผู้ใช้ตั้งใจลากเลือกข้อความ/กดปุ่ม ไม่ใช่ลากการ์ด */
                if ((e.target as HTMLElement).closest("input, button")) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData("text/plain", tier.id);
                e.dataTransfer.effectAllowed = "copy";
                setPickedTierId(tier.id);
            }}
            onDragEnd={() => setPickedTierId(null)}
        >
            <Grip
                role="button"
                tabIndex={0}
                $picked={picked}
                title={picked ? `ยกเลิกการเลือก ${name}` : `เลือก ${name} เพื่อไปแตะคอร์ท`}
                aria-label={picked ? `ยกเลิกการเลือก ${name}` : `เลือกช่วงราคา ${name}`}
                aria-pressed={picked}
                onClick={() => setPickedTierId(picked ? null : tier.id)}
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
