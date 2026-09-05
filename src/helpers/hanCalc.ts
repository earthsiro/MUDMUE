import {
    AttendeeEntry,
    HanCalcResult,
    HanCourt,
    HanSession,
    PersonBreakdown,
    RateTier,
    ShuttleBrand,
} from "../types/han";

/**
 * เครื่องคิดเลขของ MUDMUE Han — pure functions ล้วน ไม่แตะ localStorage และไม่รู้จัก React
 * สูตรทั้งหมดตาม `public/.claude/mudmue-han-badminton-cost-splitter-plan.md` (section 4)
 *
 * กติกาที่ยึดตลอดไฟล์นี้:
 * - ปัดขึ้นเฉพาะ "ยอดสุดท้ายต่อคน" เท่านั้น ยอดกลางทางไม่ปัด เพื่อไม่ให้เศษบวกกันมั่ว
 * - ค่าที่ผิดปกติ (ระบุลูกเกินที่ใช้จริง ฯลฯ) คืนเป็น `warnings` ไม่ throw และไม่บล็อก
 *
 * ขอบเขตของเฟสนี้: ถือว่าทุกคนอยู่ครบทั้งก๊วน — ค่าคอร์ทจึงหารเท่ากันหมด
 * เคสมาสาย/กลับก่อน (ชั่วโมงรายคน) ยกไป phase 2
 */

/** ยอดของป้ายราคาหนึ่งใบ */
export const tierCost = (tier: RateTier): number => tier.pricePerHour * tier.hours;

/** ยอดรวมของคอร์ทหนึ่ง = ทุกป้ายที่แปะอยู่บนคอร์ทนั้นบวกกัน */
export const courtCost = (court: HanCourt, tiers: RateTier[]): number => {
    const byId = new Map(tiers.map((tier) => [tier.id, tier]));
    return court.tierIds.reduce((sum, tierId) => {
        const tier = byId.get(tierId);
        return tier ? sum + tierCost(tier) : sum;
    }, 0);
};

/** ชั่วโมงที่คอร์ทหนึ่งถูกจอง = ชั่วโมงของทุกป้ายที่แปะอยู่บนคอร์ทนั้นบวกกัน */
export const courtHours = (court: HanCourt, tiers: RateTier[]): number => {
    const byId = new Map(tiers.map((tier) => [tier.id, tier]));
    return court.tierIds.reduce((sum, tierId) => sum + (byId.get(tierId)?.hours ?? 0), 0);
};

/**
 * เวลาเต็มของทั้ง session = คอร์ทที่จองยาวที่สุด (ค่าเริ่มต้นของทุกคน)
 *
 * ไม่ใช่ผลรวมของทุกป้าย เพราะหลายคอร์ทเล่นพร้อมกัน เวลาจึงไม่บวกกัน —
 * 2 คอร์ท คอร์ทละ 2 ชม. ก็ยังเป็นก๊วน 2 ชม. ไม่ใช่ 4 ชม.
 * ถ้ายังไม่ได้แปะป้ายลงคอร์ทเลย ค่อยถอยไปใช้ผลรวมของป้าย เพื่อให้ตอนตั้งค่ายังเห็นตัวเลข
 */
export const sessionDurationHours = (tiers: RateTier[], courts: HanCourt[]): number =>
    courts.length > 0
        ? courts.reduce((max, court) => Math.max(max, courtHours(court, tiers)), 0)
        : tiers.reduce((sum, tier) => sum + tier.hours, 0);

/**
 * ราคาต่อลูกของยี่ห้อหนึ่ง = ราคาต่อหลอด ÷ จำนวนลูกต่อหลอด
 *
 * ยังไม่ได้ใส่จำนวนลูกต่อหลอด (0) ก็คืน 0 ไม่ใช่ Infinity — ค่ายังกรอกไม่ครบ
 * ไม่ควรทำให้ยอดทั้งบิลกลายเป็น NaN
 */
export const shuttlePricePerPiece = (brand: ShuttleBrand): number =>
    brand.piecesPerTube > 0 ? brand.pricePerTube / brand.piecesPerTube : 0;

/** ยอดของลูกยี่ห้อหนึ่ง = ราคาต่อลูก × จำนวนที่ใช้ของยี่ห้อนั้น */
export const shuttleBrandCost = (brand: ShuttleBrand): number =>
    shuttlePricePerPiece(brand) * brand.usedCount;

/** จำนวนลูกที่ใช้จริงทั้งวัน รวมทุกยี่ห้อ */
export const totalShuttlesUsed = (shuttles: ShuttleBrand[]): number =>
    shuttles.reduce((sum, brand) => sum + brand.usedCount, 0);

/** จำนวนลูกที่ใช้คิดจริงของคนหนึ่งคน — null = ร่วมหารลูกทั้งหมดของวันนั้น */
export const effectiveShuttles = (attendee: AttendeeEntry, shuttleUsedTotal: number): number =>
    attendee.shuttleCount ?? shuttleUsedTotal;

const formatNumber = (value: number): string => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toLocaleString("th-TH", { maximumFractionDigits: 2 });
};

/** เลขเงินพร้อมสัญลักษณ์ ฿ ติดหน้า — UI ทุกจุดที่โชว์ยอดใช้ตัวนี้ */
export const formatBaht = (value: number): string => `฿${formatNumber(value)}`;

/** เลขลูกแบด — เศษจากการหารเท่าโชว์ทศนิยมได้ */
export const formatShuttle = (value: number): string => formatNumber(value);

export const calculateSession = (session: HanSession): HanCalcResult => {
    const { tiers, courts, attendees, shuttles } = session;

    /* ---- ค่าคอร์ท: คิดแยกทีละคอร์ทจากป้ายที่แปะอยู่บนคอร์ทนั้น แล้วค่อยรวม ---- */
    const courtCostById: Record<string, number> = {};
    const courtHoursById: Record<string, number> = {};
    courts.forEach((court) => {
        courtCostById[court.id] = courtCost(court, tiers);
        courtHoursById[court.id] = courtHours(court, tiers);
    });
    const courtSubtotal = courts.reduce((sum, court) => sum + courtCostById[court.id], 0);

    /* ---- ค่าลูก: คิดแยกทีละยี่ห้อ (ราคาต่อหลอดของแต่ละยี่ห้อไม่เท่ากัน) แล้วค่อยรวม ---- */
    const shuttleCostById: Record<string, number> = {};
    shuttles.forEach((brand) => {
        shuttleCostById[brand.id] = shuttleBrandCost(brand);
    });
    const shuttleSubtotal = shuttles.reduce((sum, brand) => sum + shuttleCostById[brand.id], 0);
    const shuttleUsedTotal = totalShuttlesUsed(shuttles);
    const grandTotal = courtSubtotal + shuttleSubtotal;

    const durationHours = sessionDurationHours(tiers, courts);
    const warnings: string[] = [];

    /* ใช้ลูกไปแล้วแต่ยังไม่บอกว่าหลอดหนึ่งมีกี่ลูก = หารไม่ได้ ยอดยี่ห้อนั้นเลยเป็น 0 เงียบ ๆ */
    const missingPieces = shuttles.filter((brand) => brand.usedCount > 0 && brand.piecesPerTube <= 0);
    if (missingPieces.length > 0) {
        warnings.push(
            `${missingPieces
                .map((brand) => brand.name.trim() || "ลูกแบดที่ยังไม่ได้ตั้งชื่อ")
                .join(", ")} ยังไม่ได้ใส่จำนวนลูกต่อหลอด — ยังคิดราคาต่อลูกไม่ได้`
        );
    }

    if (attendees.length === 0) {
        return {
            courtCostById,
            courtHoursById,
            shuttleCostById,
            shuttleUsedTotal,
            courtSubtotal,
            shuttleSubtotal,
            grandTotal,
            sessionDurationHours: durationHours,
            totalShuttleShares: 0,
            people: [],
            collectedTotal: 0,
            roundingDiff: -grandTotal,
            warnings: grandTotal > 0 ? [...warnings, "ยังไม่ได้เลือกคนที่มาวันนี้ — ยอดยังหารไม่ได้"] : warnings,
        };
    }

    /* ---- ส่วนแบ่งค่าคอร์ท: ยอดรวมทุกคอร์ทหารเท่ากันทุกคน ----
       เฟสนี้ถือว่าทุกคนอยู่ครบทั้งก๊วน คอร์ทเป็นของที่จองไว้ทั้งวันอยู่แล้ว
       ใครมาไม่ครบเวลาค่อยว่ากันใน phase 2 */
    const courtSharePerHead = courtSubtotal / attendees.length;

    /* ---- ส่วนแบ่งค่าลูก: ตามสัดส่วนจำนวนลูกที่ร่วมหาร ----
       ค่าเริ่มต้นของทุกคนคือ "ร่วมหารครบทุกลูก" ยอดจึงเท่ากันทุกคนตามปกติ
       คนที่ตีน้อยกว่าคนอื่นค่อยลดเลขของตัวเองลง ที่เหลือจะไปเฉลี่ยกันเองอัตโนมัติ */
    const totalShuttleShares = attendees.reduce((sum, a) => sum + effectiveShuttles(a, shuttleUsedTotal), 0);
    if (totalShuttleShares <= 0 && shuttleSubtotal > 0) {
        warnings.push("จำนวนลูกของทุกคนรวมกันเป็น 0 — ค่าลูกยังแบ่งให้ใครไม่ได้");
    }
    const overShuttle = attendees.filter((a) => a.shuttleCount !== null && a.shuttleCount > shuttleUsedTotal);
    if (overShuttle.length > 0 && shuttleUsedTotal > 0) {
        warnings.push(
            `${overShuttle.map((a) => a.name).join(", ")} ใส่จำนวนลูกมากกว่าที่ใช้จริงทั้งวัน (${formatNumber(
                shuttleUsedTotal
            )} ลูก)`
        );
    }

    /* ---- ยอดต่อคน ---- */
    const people: PersonBreakdown[] = attendees.map((attendee) => {
        const courtShare = courtSharePerHead;
        const shuttleCount = effectiveShuttles(attendee, shuttleUsedTotal);
        const shuttleCost =
            totalShuttleShares > 0 ? (shuttleCount / totalShuttleShares) * shuttleSubtotal : 0;
        const rawTotal = courtShare + shuttleCost;

        return {
            profileUuid: attendee.profileUuid,
            name: attendee.name,
            shuttleCount,
            shuttleOverridden: attendee.shuttleCount !== null,
            courtShare,
            shuttleCost,
            rawTotal,
            total: Math.ceil(rawTotal),
        };
    });

    const collectedTotal = people.reduce((sum, person) => sum + person.total, 0);

    return {
        courtCostById,
        courtHoursById,
        shuttleCostById,
        shuttleUsedTotal,
        courtSubtotal,
        shuttleSubtotal,
        grandTotal,
        sessionDurationHours: durationHours,
        totalShuttleShares,
        people,
        collectedTotal,
        roundingDiff: collectedTotal - grandTotal,
        warnings,
    };
};
