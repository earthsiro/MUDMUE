import {
    HanHint,
    HanSection,
    HanSectionHead,
    HanSectionTitle,
    HanStepButton,
    HanTotal,
    HanUnderlineField,
    chok,
} from "../han.styles";
import { formatBaht, formatShuttle, shuttleBrandCost, shuttlePricePerPiece } from "../../../helpers/hanCalc";

import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";
import { useDraftNumber } from "./useDraftNumber";
import { useHan } from "../context/hanContext";

/** การ์ดใบเล็กเรียงต่อกัน หน้าตาชุดเดียวกับการ์ดป้ายราคา ชม. ที่อยู่ข้างบนในหน้าเดียวกัน */
const Deck = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 10px;

    @media (max-width: ${breakpoints.mobile}px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Card = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px 8px;
    border-radius: 12px;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
`;

const Head = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

/** ชื่อยี่ห้อ — ไม่มีกรอบจนกว่าจะ hover เหมือนช่องชื่อป้ายราคา ไม่งั้นการ์ดจะดูหนัก */
const NameInput = styled.input`
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

/** ยอดของยี่ห้อนี้ — ตัวเลขที่หนักที่สุดในการ์ด */
const BrandCost = styled.span`
    font-size: 13.5px;
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: ${chok.ink};
`;

const RemoveShuttle = styled.button`
    flex-shrink: 0;
    width: ${chok.tap};
    height: ${chok.tap};
    margin: -5px -6px -5px 0;
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

const Controls = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 10px;
    padding-left: 6px;
`;

/** เครื่องหมายหาร — บอกว่าสองช่องข้าง ๆ กำลังถูกหารกันอยู่ ไม่ใช่ช่องคนละเรื่อง */
const Divide = styled.span`
    font-size: 14px;
    color: ${chok.subtle};
`;

const UsedGroup = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
`;

/** จำนวนลูกที่ใช้ — พิมพ์ทับได้ถ้ารู้ยอดอยู่แล้ว ไม่ต้องกด + ทีละลูก */
const UsedValue = styled.input`
    width: 38px;
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
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    color: ${chok.muted};
`;

/** บรรทัดโชว์ที่มาของราคาต่อลูก — เลขที่หารได้ไม่ใช่เลขที่กรอก จึงต้องเห็นว่ามาจากไหน */
const BrandMath = styled.p`
    margin: 0;
    padding-left: 6px;
    font-size: 12px;
    color: ${chok.muted};
    font-variant-numeric: tabular-nums;
`;

/** ปุ่มเพิ่มแบบตัวหนังสือ ชุดเดียวกับ "เพิ่มช่วงราคา" ของการ์ดป้ายราคา */
const AddShuttle = styled.button`
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

const ShuttleCard = ({ shuttleId }: { shuttleId: string }) => {
    const { session, updateShuttle, removeShuttle } = useHan();
    const brand = session.shuttles.find((item) => item.id === shuttleId);
    const price = useDraftNumber((value) => updateShuttle(shuttleId, { pricePerTube: value }));
    const pieces = useDraftNumber((value) => updateShuttle(shuttleId, { piecesPerTube: value }));
    const used = useDraftNumber((value) => updateShuttle(shuttleId, { usedCount: value }));

    if (!brand) return null;

    const name = brand.name.trim() || "ลูกแบด";
    const perPiece = shuttlePricePerPiece(brand);

    return (
        <Card>
            <Head>
                <NameInput
                    type="text"
                    value={brand.name}
                    maxLength={24}
                    placeholder="ยี่ห้อ / รุ่น"
                    aria-label="ยี่ห้อลูกแบด"
                    onChange={(e) => updateShuttle(shuttleId, { name: e.target.value })}
                />
                {brand.usedCount > 0 && <BrandCost>{formatBaht(shuttleBrandCost(brand))}</BrandCost>}
                <RemoveShuttle
                    type="button"
                    title={`ลบ ${name}`}
                    aria-label={`ลบลูกแบด ${name}`}
                    onClick={() => removeShuttle(shuttleId)}
                >
                    <span aria-hidden>✕</span>
                </RemoveShuttle>
            </Head>

            <Controls>
                <HanUnderlineField $width="62px">
                    <span className="prefix">฿</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={price.draft ?? String(brand.pricePerTube)}
                        aria-label={`ราคาต่อหลอดของ ${name} (บาท)`}
                        onChange={(e) => price.onChange(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={price.onBlur}
                    />
                    <span className="suffix">/หลอด</span>
                </HanUnderlineField>

                <Divide aria-hidden>÷</Divide>

                <HanUnderlineField $width="38px">
                    <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={pieces.draft ?? String(brand.piecesPerTube)}
                        aria-label={`จำนวนลูกต่อหลอดของ ${name}`}
                        onChange={(e) => pieces.onChange(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={pieces.onBlur}
                    />
                    <span className="suffix">ลูก/หลอด</span>
                </HanUnderlineField>

                <UsedGroup>
                    <HanStepButton
                        type="button"
                        $shape="circle"
                        $size="sm"
                        disabled={brand.usedCount <= 0}
                        aria-label={`ลดจำนวนลูกที่ใช้ของ ${name}`}
                        onClick={() => updateShuttle(shuttleId, { usedCount: brand.usedCount - 1 })}
                    >
                        −
                    </HanStepButton>
                    <UsedValue
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={used.draft ?? String(brand.usedCount)}
                        aria-label={`จำนวนลูกที่ใช้ของ ${name}`}
                        onChange={(e) => used.onChange(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={used.onBlur}
                    />
                    <HanStepButton
                        type="button"
                        $shape="circle"
                        $tone="filled"
                        $size="sm"
                        aria-label={`เพิ่มจำนวนลูกที่ใช้ของ ${name}`}
                        onClick={() => updateShuttle(shuttleId, { usedCount: brand.usedCount + 1 })}
                    >
                        ＋
                    </HanStepButton>
                    <Unit>ลูก</Unit>
                </UsedGroup>
            </Controls>

            {/* โผล่ทันทีที่กรอกราคาต่อหลอด ยังไม่ต้องรอนับลูก — จะได้เช็คได้เลยว่าหารถูกหลอดไหม */}
            {perPiece > 0 && (
                <BrandMath>
                    {formatBaht(perPiece)}/ลูก
                    {brand.usedCount > 0 && ` × ${formatShuttle(brand.usedCount)} ลูก`}
                </BrandMath>
            )}
        </Card>
    );
};

/**
 * ค่าลูกแบด — ส่วนที่รู้ยอดได้ก็ต่อเมื่อเล่นจบแล้วเท่านั้น (ต้องนับลูกจริง)
 *
 * ก๊วนหนึ่งใช้ลูกหลายยี่ห้อพร้อมกันได้ ราคาต่อลูกจึงไม่ใช่ค่าเดียวทั้งบิล — คิดแยก
 * ทีละยี่ห้อจาก "ราคาต่อหลอด ÷ ลูกต่อหลอด" แล้วคูณจำนวนที่ใช้ของยี่ห้อนั้น
 * ส่วนการหารรายคนยังอิงยอดลูกรวมทุกยี่ห้อเหมือนเดิม
 */
export const ShuttleSection = () => {
    const { session, result, addShuttle } = useHan();

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>🏸</span> ค่าลูกแบด
                </HanSectionTitle>
                <HanTotal>
                    {result.shuttleUsedTotal > 0 && `${formatShuttle(result.shuttleUsedTotal)} ลูก ·`} รวม{" "}
                    <strong>{formatBaht(result.shuttleSubtotal)}</strong>
                </HanTotal>
            </HanSectionHead>

            <Deck>
                {session.shuttles.map((brand) => (
                    <ShuttleCard key={brand.id} shuttleId={brand.id} />
                ))}
            </Deck>

            <AddShuttle type="button" onClick={addShuttle} aria-label="เพิ่มยี่ห้อลูกแบด">
                <span aria-hidden>＋</span>
                เพิ่มยี่ห้อลูกแบด
            </AddShuttle>

            <HanHint>
                {session.shuttles.length === 0
                    ? 'ยังไม่มีลูกแบดในบิลนี้ — กด "เพิ่มยี่ห้อลูกแบด" แล้วกรอกราคาต่อหลอดกับจำนวนที่ใช้'
                    : result.shuttleUsedTotal > 0
                      ? `รวม ${formatShuttle(result.shuttleUsedTotal)} ลูก = ${formatBaht(
                            result.shuttleSubtotal
                        )} — ทุกคนเริ่มที่ร่วมหารครบ ${formatShuttle(
                            result.shuttleUsedTotal
                        )} ลูก ปรับลดรายคนได้ถ้ามาไม่ครบ`
                      : "กรอกหลังเล่นจบ — ค่าลูกรู้ได้ก็ต่อเมื่อนับลูกที่ใช้จริงแล้ว ใช้หลายยี่ห้อก็เพิ่มการ์ดได้"}
            </HanHint>
        </HanSection>
    );
};
