import { HanBadge, HanFloatingClose, HanHint, HanTierChip, chok, han } from "../han.styles";

import type { HanCourt } from "../../../types/han";
import { IconClock } from "../../../components/icons";
import { breakpoints } from "../../../styles/breakpoints";
import { formatBaht, formatShuttle } from "../../../helpers/hanCalc";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

/**
 * แถวการ์ดคอร์ท — เป็นจุดวาง (drop target) ของป้ายราคา
 *
 * การ์ดเป็นพื้นขาวเหมือน section อื่นของเว็บ มีแค่ตัวสนามที่เป็นเขียว
 *
 * รับป้ายได้สองทางเสมอตามสเปก: ลากมาวาง และ "แตะป้ายเพื่อเลือกแล้วแตะคอร์ท"
 * ทางหลังไม่ใช่ของสำรองที่ทำขอไปที — หน้างานจริงคือมือเปียกเหงื่อกลางแดด
 *
 * การลากใช้ Pointer Events (ดู `TierDeck`) ตัวการ์ดจึงไม่ต้องมี handler ของ HTML5
 * drag แล้ว แค่ติด `data-court-id` ไว้ให้ฝั่งที่ลากหาเจอด้วย `elementFromPoint`
 */

const Scroller = styled.div`
    display: flex;
    align-items: stretch;
    gap: 14px;
    overflow-x: auto;
    /* เผื่อที่ด้านบนให้ปุ่ม ✕ ที่ลอยพ้นขอบการ์ด ไม่ให้โดน overflow ตัดหัว */
    padding: 18px 4px 10px;

    /* กันการ์ดถูกบีบให้แคบลงเมื่อคอร์ทเยอะ — ให้เลื่อนแนวนอนแทน */
    > * {
        flex: 0 0 auto;
    }

    /* บนจอที่ต้องปัดจริง (มือถือ/แท็บเล็ต) ให้หยุดตรงขอบการ์ดพอดี ไม่ค้างครึ่งใบ */
    @media (max-width: ${breakpoints.tablet}px) {
        scroll-snap-type: x proximity;
        scroll-padding-left: 4px;

        > * {
            scroll-snap-align: start;
        }
    }

    @media (max-width: ${breakpoints.mobile}px) {
        gap: 10px;
        padding: 16px 2px 8px;
    }
`;

const TileWrap = styled.div`
    position: relative;
    display: flex;
`;

const Tile = styled.div<{ $armed: boolean; $over: boolean }>`
    width: 172px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 12px 14px;
    border-radius: 18px;
    cursor: ${({ $armed }) => ($armed ? "copy" : "default")};
    background: ${({ $over }) => ($over ? chok.primaryTint : chok.surface)};
    border: 1px solid ${({ $armed, $over }) => ($over || $armed ? chok.primary : chok.line)};
    box-shadow: ${({ $over }) => ($over ? `0 0 0 2px ${chok.primary}` : "none")};
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

    @media (max-width: ${breakpoints.mobile}px) {
        width: 154px;
    }
`;

/**
 * กรอบของสนาม — ตัวที่รับโฟกัสคีย์บอร์ด ส่วน <svg> ข้างในเป็นภาพล้วน (aria-hidden)
 * แยกกันเพราะการโฟกัส <svg> ตรง ๆ ยังมีเบราว์เซอร์ที่ทำได้ไม่เหมือนกัน
 */
const CourtFrame = styled.div`
    display: inline-flex;
    border-radius: 4px;

    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 3px;
    }
`;

/**
 * สนามแบดตีเส้นตามสัดส่วนจริง — viewBox เป็นหน่วยเดซิเมตรของคอร์ทมาตรฐาน
 * (13.4 × 6.1 ม. = 134 × 61) เส้นทุกเส้นจึงอยู่ตำแหน่งเดียวกับคอร์ทจริงเป๊ะ:
 *
 *   - เส้นเขตนอก = เขตคู่ (doubles)
 *   - เส้นข้างเดี่ยว เว้นเข้ามาข้างละ 0.46 ม.
 *   - เส้นเสิร์ฟหลังของคู่ ห่างจากเส้นหลัง 0.76 ม.
 *   - เส้นเสิร์ฟสั้น ห่างจากตาข่าย 1.98 ม.
 *   - เส้นกลาง มีเฉพาะช่วงเส้นเสิร์ฟสั้น → เส้นหลัง (ไม่ลากผ่านกลางสนาม)
 *
 * `vector-effect: non-scaling-stroke` ทำให้เส้นหนา 1px คงที่ ไม่บางลงตอนย่อบนมือถือ
 */
const CourtSvg = styled.svg<{ $over: boolean }>`
    display: block;
    width: 62px;
    height: 136px;
    /* ให้ตาข่ายยื่นพ้นขอบสนามได้เหมือนเสาตาข่ายจริง */
    overflow: visible;

    .floor {
        fill: ${({ $over }) => ($over ? han.courtSurfaceOver : han.courtSurface)};
        transition: fill 0.15s ease;
    }
    .line {
        fill: none;
        stroke: ${han.courtLineOnGreen};
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
    }
    .net {
        stroke: ${han.courtNetOnGreen};
        stroke-width: 2;
        stroke-dasharray: 3.5 2.5;
        vector-effect: non-scaling-stroke;
    }

    @media (max-width: ${breakpoints.mobile}px) {
        width: 54px;
        height: 118px;
    }
`;

/** วาดครั้งเดียว ใช้ซ้ำทุกคอร์ท — ตัวเลขทั้งหมดเป็นเดซิเมตรของคอร์ทจริง */
const CourtMarkings = () => (
    <>
        <rect className="floor" x="0" y="0" width="61" height="134" rx="1" />
        {/* เขตนอก = เขตคู่ */}
        <rect className="line" x="0.5" y="0.5" width="60" height="133" />
        {/* เส้นข้างของประเภทเดี่ยว */}
        <line className="line" x1="4.6" y1="0.5" x2="4.6" y2="133.5" />
        <line className="line" x1="56.4" y1="0.5" x2="56.4" y2="133.5" />
        {/* เส้นเสิร์ฟหลังของประเภทคู่ */}
        <line className="line" x1="0.5" y1="7.6" x2="60.5" y2="7.6" />
        <line className="line" x1="0.5" y1="126.4" x2="60.5" y2="126.4" />
        {/* เส้นเสิร์ฟสั้น */}
        <line className="line" x1="0.5" y1="47.2" x2="60.5" y2="47.2" />
        <line className="line" x1="0.5" y1="86.8" x2="60.5" y2="86.8" />
        {/* เส้นกลาง — เฉพาะช่วงเส้นเสิร์ฟสั้นถึงเส้นหลัง */}
        <line className="line" x1="30.5" y1="0.5" x2="30.5" y2="47.2" />
        <line className="line" x1="30.5" y1="86.8" x2="30.5" y2="133.5" />
        {/* ตาข่าย */}
        <line className="net" x1="-3" y1="67" x2="64" y2="67" />
    </>
);

const CourtName = styled.span`
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    color: ${chok.ink};
`;

/** ป้ายที่แปะอยู่ — เรียงลงมาใต้ชื่อคอร์ท แตะเพื่อเอาออกจากคอร์ทนี้ */
const ChipStack = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 100%;
`;

const EmptyChip = styled.span`
    white-space: pre-line;
    font-size: 11px;
    line-height: 1.4;
    text-align: center;
    color: ${chok.subtle};
`;

/** ชั่วโมงที่คอร์ทใบนี้ถูกจอง — ผลรวมชั่วโมงของป้ายที่แปะอยู่ ให้เห็นที่มาของยอดข้างล่าง */
const TileHours = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: ${chok.muted};
`;

const TileTotal = styled.b`
    font-size: 17px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: ${chok.ink};
`;

const AddCourt = styled.button`
    width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 12px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: ${chok.muted};
    cursor: pointer;
    border-radius: 18px;
    border: 2px dashed ${chok.line};
    background: ${chok.surface};
    transition: border-color 0.15s ease, color 0.15s ease;

    .plus {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: ${chok.hover};
        font-size: 22px;
        line-height: 1;
        color: ${chok.inkSoft};
        transition: background 0.15s ease, color 0.15s ease;
    }

    &:hover {
        border-color: ${chok.primary};
        color: ${chok.primary};
    }
    &:hover .plus {
        background: ${chok.primaryTint};
        color: ${chok.primary};
    }
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: 2px;
    }

    @media (max-width: ${breakpoints.mobile}px) {
        width: 124px;
    }
`;

export const CourtBoard = () => {
    const {
        session,
        result,
        pickedTierId,
        setPickedTierId,
        attachTier,
        detachTierAt,
        addCourt,
        removeCourt,
        dragOverCourtId,
    } = useHan();

    const tierById = new Map(session.tiers.map((tier) => [tier.id, tier]));
    const pickedTier = pickedTierId ? tierById.get(pickedTierId) : undefined;
    const armed = Boolean(pickedTier);

    /** แตะการ์ดตอนที่มีป้ายถูกเลือกอยู่ = แปะป้ายนั้น แล้วปล่อยการเลือก */
    const handleCourtClick = (court: HanCourt) => {
        if (!pickedTierId) return;
        attachTier(court.id, pickedTierId);
        setPickedTierId(null);
    };

    return (
        <>
            {armed && (
                <HanHint>
                    เลือก <strong>{pickedTier?.label || "ป้ายราคา"}</strong> ไว้แล้ว — แตะคอร์ทที่ต้องการเพื่อแปะ
                </HanHint>
            )}

            <Scroller>
                {session.courts.map((court) => {
                    const cost = result.courtCostById[court.id] ?? 0;
                    const hours = result.courtHoursById[court.id] ?? 0;
                    const courtLabel = `คอร์ท ${court.index}`;
                    const over = dragOverCourtId === court.id;

                    return (
                        <TileWrap key={court.id}>
                            <HanFloatingClose
                                type="button"
                                title={`ลบ${courtLabel}`}
                                aria-label={`ลบ${courtLabel}`}
                                disabled={session.courts.length <= 1}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeCourt(court.id);
                                }}
                            >
                                <span aria-hidden>✕</span>
                            </HanFloatingClose>

                            {/* ทั้งการ์ดคือจุดวาง ไม่ใช่แค่รูปสนาม — ตอนลากเล็งง่ายกว่ามาก
                                ส่วนคีย์บอร์ด/screen reader ใช้รูปสนามที่เป็น role="button" ข้างใน */}
                            <Tile
                                data-court-id={court.id}
                                $armed={armed}
                                $over={over}
                                onClick={() => handleCourtClick(court)}
                            >
                                <CourtFrame
                                    role="button"
                                    tabIndex={0}
                                    aria-label={
                                        armed
                                            ? `แปะ ${pickedTier?.label || "ป้ายราคา"} ลง${courtLabel}`
                                            : `${courtLabel} — จุดวางป้ายราคา`
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key !== "Enter" && e.key !== " ") return;
                                        e.preventDefault();
                                        handleCourtClick(court);
                                    }}
                                >
                                    <CourtSvg $over={over} viewBox="0 0 61 134" aria-hidden>
                                        <CourtMarkings />
                                    </CourtSvg>
                                </CourtFrame>

                                <CourtName>{courtLabel}</CourtName>

                                <ChipStack>
                                    {court.tierIds.length === 0 ? (
                                        <EmptyChip>ลากป้ายราคามาวาง{"\n"}หรือแตะป้ายแล้วแตะที่นี่</EmptyChip>
                                    ) : (
                                        court.tierIds.map((tierId, position) => {
                                            const tier = tierById.get(tierId);
                                            if (!tier) return null;
                                            const chipLabel = tier.label || "ไม่มีชื่อ";
                                            return (
                                                <HanTierChip
                                                    key={`${court.id}-${tierId}-${position}`}
                                                    type="button"
                                                    title={`เอา ${chipLabel} ออกจาก${courtLabel}`}
                                                    aria-label={`เอา ${chipLabel} ออกจาก${courtLabel}`}
                                                    onClick={(e) => {
                                                        /* ไม่ให้ทะลุไปโดน onClick ของการ์ดที่ครอบอยู่ */
                                                        e.stopPropagation();
                                                        detachTierAt(court.id, position);
                                                    }}
                                                >
                                                    {chipLabel}
                                                    <span aria-hidden>✕</span>
                                                </HanTierChip>
                                            );
                                        })
                                    )}
                                </ChipStack>

                                {hours > 0 && (
                                    <TileHours>
                                        <IconClock size={13} />
                                        {formatShuttle(hours)} ชม.
                                    </TileHours>
                                )}
                                <TileTotal>{formatBaht(cost)}</TileTotal>
                            </Tile>
                        </TileWrap>
                    );
                })}

                <AddCourt type="button" onClick={addCourt} aria-label="เพิ่มคอร์ท">
                    <span className="plus" aria-hidden>
                        ＋
                    </span>
                    เพิ่มคอร์ท
                </AddCourt>
            </Scroller>

            {session.courts.every((court) => court.tierIds.length === 0) && (
                <HanBadge>ยังไม่มีป้ายราคาบนคอร์ทไหนเลย — ค่าคอร์ทจะเป็น ฿0</HanBadge>
            )}
        </>
    );
};
