import { AttendeeEntry, HanSession, RateTier, ShuttleBrand } from "../types/han";
import {
    calculateSession,
    courtCost,
    courtHours,
    formatBaht,
    formatShuttle,
    sessionDurationHours,
    shuttleBrandCost,
    shuttlePricePerPiece,
    tierCost,
} from "./hanCalc";
import { describe, expect, it } from "vitest";

/**
 * สูตรคิดเงินของ MUDMUE Han — จุดที่ผิดแล้วเจ็บที่สุดในเว็บนี้ เพราะมันคือเงินจริง
 * ที่เก็บจากเพื่อน เทสจึงล็อกทั้ง "ยอดออกมาเท่าไหร่" และ "เงินไม่หายไประหว่างทาง"
 */

const tier = (id: string, pricePerHour: number, hours: number): RateTier => ({
    id,
    label: id,
    pricePerHour,
    hours,
});

/** ลูกแบดหนึ่งยี่ห้อ — ราคาต่อหลอดกับจำนวนลูกต่อหลอดคือของที่กรอกจริงในหน้าจอ */
const shuttle = (id: string, pricePerTube: number, piecesPerTube: number, usedCount: number): ShuttleBrand => ({
    id,
    name: id,
    pricePerTube,
    piecesPerTube,
    usedCount,
});

const person = (name: string, shuttleCount: number | null = null): AttendeeEntry => ({
    profileUuid: name,
    name,
    shuttleCount,
});

const session = (patch: Partial<HanSession> = {}): HanSession => ({
    id: "s1",
    date: "2026-09-03T00:00:00.000Z",
    title: "",
    tiers: [],
    courts: [],
    shuttles: [],
    attendees: [],
    ...patch,
});

describe("ยอดของป้ายราคาและคอร์ท", () => {
    it("ยอดป้าย = ราคาต่อ ชม. × จำนวน ชม.", () => {
        expect(tierCost(tier("t1", 120, 1.5))).toBe(180);
    });

    it("ยอดคอร์ท = ผลรวมของทุกป้ายที่แปะบนคอร์ทนั้น", () => {
        const tiers = [tier("first", 120, 1), tier("second", 100, 2)];
        const court = { id: "c1", index: 1, tierIds: ["first", "second"] };

        expect(courtCost(court, tiers)).toBe(320);
        expect(courtHours(court, tiers)).toBe(3);
    });

    it("ป้ายเดิมแปะซ้ำบนคอร์ทเดียวกันคิดซ้ำ (เล่นสองชั่วโมงราคาเดียวกัน)", () => {
        const tiers = [tier("t", 100, 1)];
        const court = { id: "c1", index: 1, tierIds: ["t", "t"] };

        expect(courtCost(court, tiers)).toBe(200);
        expect(courtHours(court, tiers)).toBe(2);
    });

    it("ป้ายที่สร้างไว้แต่ยังไม่ได้แปะลงคอร์ทไหน จะไม่ถูกคิดเงิน", () => {
        const result = calculateSession(
            session({
                tiers: [tier("used", 100, 1), tier("floating", 999, 3)],
                courts: [{ id: "c1", index: 1, tierIds: ["used"] }],
            })
        );

        expect(result.courtSubtotal).toBe(100);
    });

    it("อ้าง tierId ที่ถูกลบไปแล้ว ไม่พังและไม่คิดเงิน", () => {
        const court = { id: "c1", index: 1, tierIds: ["ghost"] };
        expect(courtCost(court, [])).toBe(0);
        expect(courtHours(court, [])).toBe(0);
    });
});

describe("เวลาเต็มของก๊วน", () => {
    it("= คอร์ทที่จองยาวที่สุด ไม่ใช่ผลรวมทุกคอร์ท (คอร์ทเล่นพร้อมกัน)", () => {
        const tiers = [tier("t", 100, 2)];
        const courts = [
            { id: "c1", index: 1, tierIds: ["t"] },
            { id: "c2", index: 2, tierIds: ["t"] },
        ];

        expect(sessionDurationHours(tiers, courts)).toBe(2);
    });

    it("คอร์ทยาวไม่เท่ากัน เอาใบที่ยาวที่สุด", () => {
        const tiers = [tier("a", 100, 1), tier("b", 80, 1)];
        const courts = [
            { id: "c1", index: 1, tierIds: ["a"] },
            { id: "c2", index: 2, tierIds: ["a", "b"] },
        ];

        expect(sessionDurationHours(tiers, courts)).toBe(2);
    });

    it("ยังไม่มีคอร์ทเลย ถอยไปใช้ผลรวมของป้ายราคา (ตอนกำลังตั้งค่า)", () => {
        expect(sessionDurationHours([tier("a", 100, 1), tier("b", 80, 1.5)], [])).toBe(2.5);
    });
});

describe("การหารค่าคอร์ท", () => {
    it("หารเท่ากันทุกคน", () => {
        const result = calculateSession(
            session({
                tiers: [tier("t", 200, 1)],
                courts: [
                    { id: "c1", index: 1, tierIds: ["t"] },
                    { id: "c2", index: 2, tierIds: ["t"] },
                ],
                attendees: [person("A"), person("B")],
            })
        );

        expect(result.courtSubtotal).toBe(400);
        expect(result.people.map((p) => p.courtShare)).toEqual([200, 200]);
    });

    it("ยอดต่อคอร์ทกับชั่วโมงต่อคอร์ทถูกคืนมาแยกใบ (ใช้โชว์บนการ์ด)", () => {
        const result = calculateSession(
            session({
                tiers: [tier("first", 10, 0), tier("second", 200, 1)],
                courts: [
                    { id: "c1", index: 1, tierIds: ["second", "first"] },
                    { id: "c2", index: 2, tierIds: ["first"] },
                ],
                attendees: [person("A")],
            })
        );

        expect(result.courtCostById).toEqual({ c1: 200, c2: 0 });
        expect(result.courtHoursById).toEqual({ c1: 1, c2: 0 });
    });
});

describe("การหารค่าลูก", () => {
    it("ไม่มีใครปรับ = ทุกคนร่วมหารครบทุกลูก ยอดจึงเท่ากัน", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("s", 360, 12, 10)],
                attendees: [person("A"), person("B")],
            })
        );

        expect(result.shuttleSubtotal).toBe(300);
        expect(result.people.map((p) => p.shuttleCost)).toEqual([150, 150]);
        /* ค่าเริ่มต้นที่โชว์ต้องเป็น "ครบทุกลูก" ไม่ใช่ส่วนที่หารแล้ว */
        expect(result.people.map((p) => p.shuttleCount)).toEqual([10, 10]);
    });

    it("คนที่ปรับลด จ่ายน้อยลงตามสัดส่วน ที่เหลือไปเฉลี่ยให้คนอื่นเอง", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("s", 360, 12, 10)],
                attendees: [person("A", 5), person("B")],
            })
        );

        expect(result.people.map((p) => p.shuttleCost)).toEqual([100, 200]);
        expect(result.people[0].shuttleOverridden).toBe(true);
        expect(result.people[1].shuttleOverridden).toBe(false);
    });

    it("ไม่ว่าปรับยังไง ค่าลูกที่แบ่งกันต้องรวมได้เท่ากับค่าลูกจริงเสมอ", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("s", 300, 12, 13)],
                attendees: [person("A", 4), person("B", 7), person("C"), person("D", 1)],
            })
        );

        const shared = result.people.reduce((sum, p) => sum + p.shuttleCost, 0);
        expect(shared).toBeCloseTo(result.shuttleSubtotal, 10);
    });

    it("ทุกคนใส่ 0 ลูก = ยังแบ่งไม่ได้ เตือนแต่ไม่พัง", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("s", 360, 12, 10)],
                attendees: [person("A", 0), person("B", 0)],
            })
        );

        expect(result.people.every((p) => p.shuttleCost === 0)).toBe(true);
        expect(result.warnings).toContain("จำนวนลูกของทุกคนรวมกันเป็น 0 — ค่าลูกยังแบ่งให้ใครไม่ได้");
    });
});

describe("ลูกแบดหลายยี่ห้อ", () => {
    it("ราคาต่อลูก = ราคาต่อหลอด ÷ จำนวนลูกต่อหลอด", () => {
        expect(shuttlePricePerPiece(shuttle("rsl", 520, 12, 7))).toBeCloseTo(43.333, 3);
        expect(shuttleBrandCost(shuttle("rsl", 520, 12, 7))).toBeCloseTo(303.333, 3);
    });

    it("ยังไม่ได้ใส่ลูกต่อหลอด = ยอดยี่ห้อนั้นเป็น 0 ไม่ใช่ Infinity", () => {
        expect(shuttlePricePerPiece(shuttle("x", 520, 0, 7))).toBe(0);
        expect(shuttleBrandCost(shuttle("x", 520, 0, 7))).toBe(0);
    });

    it("ค่าลูกรวม = ทุกยี่ห้อบวกกัน และลูกรวมคือของทุกยี่ห้อ", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("rsl", 520, 12, 7), shuttle("yonex", 1020, 12, 3)],
                attendees: [person("A"), person("B")],
            })
        );

        expect(result.shuttleUsedTotal).toBe(10);
        expect(result.shuttleCostById.rsl).toBeCloseTo(303.333, 3);
        expect(result.shuttleCostById.yonex).toBeCloseTo(255, 10);
        expect(result.shuttleSubtotal).toBeCloseTo(558.333, 3);
        /* คนละครึ่งของยอดรวม ไม่ใช่คนละยี่ห้อ — ทุกคนตีลูกของทุกยี่ห้อปนกัน */
        expect(result.people.map((p) => p.shuttleCost)).toEqual([
            result.shuttleSubtotal / 2,
            result.shuttleSubtotal / 2,
        ]);
    });

    it("คนที่ปรับลดจำนวนลูก หารจากยอดลูกรวมทุกยี่ห้อ เงินไม่หาย", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("rsl", 520, 12, 7), shuttle("yonex", 1020, 12, 3)],
                attendees: [person("A", 4), person("B"), person("C", 2)],
            })
        );

        /* ค่าเริ่มต้นของ B คือลูกรวมทุกยี่ห้อ = 10 */
        expect(result.people.map((p) => p.shuttleCount)).toEqual([4, 10, 2]);
        const shared = result.people.reduce((sum, p) => sum + p.shuttleCost, 0);
        expect(shared).toBeCloseTo(result.shuttleSubtotal, 10);
    });

    it("ใช้ลูกไปแล้วแต่ยังไม่ใส่ลูกต่อหลอด = เตือน แต่ยังสรุปให้", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("rsl", 520, 0, 7)],
                attendees: [person("A")],
            })
        );

        expect(result.shuttleSubtotal).toBe(0);
        expect(result.warnings.some((w) => w.includes("จำนวนลูกต่อหลอด"))).toBe(true);
    });
});

describe("ยอดสุดท้ายและการปัดขึ้น", () => {
    it("ปัดขึ้นเฉพาะยอดต่อคน ส่วนที่เกินไปโผล่ที่ยอดเข้ากองกลาง", () => {
        const result = calculateSession(
            session({
                tiers: [tier("t", 100, 1)],
                courts: [{ id: "c1", index: 1, tierIds: ["t"] }],
                attendees: [person("A"), person("B"), person("C")],
            })
        );

        expect(result.grandTotal).toBe(100);
        expect(result.people.map((p) => p.total)).toEqual([34, 34, 34]);
        expect(result.collectedTotal).toBe(102);
        expect(result.roundingDiff).toBe(2);
    });

    it("ยอดที่ยังไม่ปัดถูกเก็บไว้ด้วย เพื่อให้ส่วนต่างตรวจย้อนได้", () => {
        const result = calculateSession(
            session({
                tiers: [tier("t", 100, 1)],
                courts: [{ id: "c1", index: 1, tierIds: ["t"] }],
                attendees: [person("A"), person("B"), person("C")],
            })
        );

        const raw = result.people.reduce((sum, p) => sum + p.rawTotal, 0);
        expect(raw).toBeCloseTo(result.grandTotal, 10);
    });

    it("เก็บได้ไม่น้อยกว่ายอดจริงเสมอ เมื่อทุกคนยังใช้ค่าเริ่มต้น", () => {
        const result = calculateSession(
            session({
                tiers: [tier("t", 333, 1)],
                courts: [{ id: "c1", index: 1, tierIds: ["t"] }],
                shuttles: [shuttle("s", 324, 12, 7)],
                attendees: [person("A"), person("B"), person("C"), person("D"), person("E"), person("F")],
            })
        );

        expect(result.roundingDiff).toBeGreaterThanOrEqual(0);
        expect(result.collectedTotal).toBe(result.people.reduce((sum, p) => sum + p.total, 0));
    });
});

describe("เคสขอบและคำเตือน", () => {
    it("ยังไม่ได้เลือกคน = ไม่หาร แต่ยอดจริงยังคำนวณให้ดู", () => {
        const result = calculateSession(
            session({
                tiers: [tier("t", 200, 1)],
                courts: [{ id: "c1", index: 1, tierIds: ["t"] }],
                shuttles: [shuttle("s", 360, 12, 10)],
            })
        );

        expect(result.grandTotal).toBe(500);
        expect(result.people).toEqual([]);
        expect(result.collectedTotal).toBe(0);
        expect(result.roundingDiff).toBe(-500);
        expect(result.warnings).toContain("ยังไม่ได้เลือกคนที่มาวันนี้ — ยอดยังหารไม่ได้");
    });

    it("บิลเปล่าสนิท ไม่เตือนอะไรเลย", () => {
        expect(calculateSession(session()).warnings).toEqual([]);
    });

    it("ใส่จำนวนลูกมากกว่าที่ใช้จริงทั้งวัน = เตือน แต่ยังสรุปให้", () => {
        const result = calculateSession(
            session({
                shuttles: [shuttle("s", 360, 12, 10)],
                attendees: [person("A", 12), person("B")],
            })
        );

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain("A");
        expect(result.warnings[0]).toContain("มากกว่าที่ใช้จริงทั้งวัน");
        expect(result.people[0].total).toBeGreaterThan(0);
    });
});

describe("การแสดงผลตัวเลข", () => {
    it("เงินมี ฿ นำหน้าและตัดทศนิยมเหลือ 2 ตำแหน่ง", () => {
        expect(formatBaht(1234.5)).toBe("฿1,234.5");
        expect(formatBaht(33.333333)).toBe("฿33.33");
        expect(formatBaht(0)).toBe("฿0");
    });

    it("จำนวนลูกโชว์ทศนิยมได้ แต่ไม่มีสัญลักษณ์เงิน", () => {
        expect(formatShuttle(2.5)).toBe("2.5");
        expect(formatShuttle(3)).toBe("3");
    });
});
