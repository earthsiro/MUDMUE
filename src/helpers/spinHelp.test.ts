import { describe, expect, it } from "vitest";

import type { PlayerProps } from "../types/player";
import { shuffle, spinRoundsWithCarryOver } from "./spinHelp";

/**
 * การสุ่มจับคู่ของ MUDMUE Chok — สุ่มก็จริงแต่มีข้อตกลงที่ต้องจริงทุกครั้ง:
 * ทุกกลุ่มต้องได้คนครบ ห้ามมีชื่อซ้ำในกลุ่มเดียวกัน และคนที่เหลือไม่ครบทีมของ
 * รอบก่อนต้องได้ลงรอบถัดไป (ไม่งั้นบางคนนั่งยาวทั้งเย็น)
 */

const pool = (count: number): PlayerProps[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `p${i}`,
        hide: false,
        uuid: `u${i}`,
    }));

/** คนที่พิมพ์ชื่อเพิ่มหน้างาน — ยังไม่มีโปรไฟล์ `uuid` จึงเป็น "" เหมือนกันทุกคน */
const tempPool = (count: number): PlayerProps[] =>
    Array.from({ length: count }, (_, i) => ({ id: i, name: `p${i}`, hide: false, uuid: "" }));

const uuidsOf = (group: PlayerProps[]) => group.map((p) => p.uuid);

const idsOf = (group: PlayerProps[]) => group.map((p) => p.id);

describe("spinRoundsWithCarryOver", () => {
    it("คืนกลุ่มครบตามจำนวนรอบที่ขอ", () => {
        expect(spinRoundsWithCarryOver(pool(8), 4, 3)).toHaveLength(3);
    });

    it("ทุกกลุ่มได้คนครบตามจำนวนผู้เล่นต่อแมตช์", () => {
        const groups = spinRoundsWithCarryOver(pool(7), 4, 5);
        groups.forEach((group) => expect(group).toHaveLength(4));
    });

    it("ไม่มีใครถูกเรียกซ้ำในกลุ่มเดียวกัน", () => {
        const groups = spinRoundsWithCarryOver(pool(6), 4, 6);
        groups.forEach((group) => {
            expect(new Set(uuidsOf(group)).size).toBe(group.length);
        });
    });

    it("หยิบเฉพาะคนที่อยู่ใน pool ที่ส่งเข้าไป", () => {
        const players = pool(5);
        const allowed = new Set(uuidsOf(players));

        spinRoundsWithCarryOver(players, 2, 4)
            .flat()
            .forEach((player) => expect(allowed.has(player.uuid)).toBe(true));
    });

    it("คนที่เหลือไม่ครบทีมของรอบก่อน ได้ลงเป็นคนแรกของรอบถัดไป", () => {
        /* 5 คน ต่อแมตช์ 4 คน → รอบแรกเหลือ 1 คน คนนั้นต้องอยู่ในรอบที่สอง */
        const [first, second] = spinRoundsWithCarryOver(pool(5), 4, 2);
        const leftOver = pool(5).find((player) => !uuidsOf(first).includes(player.uuid));

        expect(leftOver).toBeDefined();
        expect(uuidsOf(second)).toContain(leftOver!.uuid);
    });

    it("จำนวนคนหารลงตัวพอดี รอบถัดไปเริ่มสับใหม่ทั้ง pool", () => {
        const groups = spinRoundsWithCarryOver(pool(4), 4, 2);

        expect(uuidsOf(groups[0]).sort()).toEqual(uuidsOf(groups[1]).sort());
    });

    it("คนที่เพิ่มหน้างาน (ไม่มี uuid) ยังนับเป็นคนละคน", () => {
        /* 5 คน ต่อแมตช์ 4 คน สุ่ม 2 รอบ — ของเดิมเทียบด้วย uuid ที่ว่างเหมือนกันหมด
           ทั้งก๊วนเลยถูกมองเป็นคนเดียว รอบสองจึงได้แค่คนที่ยกมาจากรอบแรกคนเดียว */
        const groups = spinRoundsWithCarryOver(tempPool(5), 4, 2);

        groups.forEach((group) => {
            expect(group).toHaveLength(4);
            expect(new Set(idsOf(group)).size).toBe(4);
        });
    });

    it("คนที่ซ่อนไว้ไม่ถูกดึงมา ตราบใดที่คนพร้อมสุ่มยังตั้งทีมได้", () => {
        const visible = pool(4);
        const hidden = [{ id: 99, name: "ซ่อนไว้", hide: true, uuid: "u99" }];

        const drawn = spinRoundsWithCarryOver(visible, 4, 5, hidden).flat();

        expect(drawn.some((player) => player.id === 99)).toBe(false);
    });

    it("คนพร้อมสุ่มไม่พอตั้งทีม ดึงคนที่ซ่อนไว้กลับมาเติมจนครบ", () => {
        /* เคสหลังติ๊ก "ซ่อนคนที่สุ่มได้" จนเหลือคนพร้อมสุ่มคนเดียว */
        const visible = pool(1);
        const hidden = pool(4).map((player) => ({ ...player, id: player.id + 10, hide: true }));

        const [group] = spinRoundsWithCarryOver(visible, 4, 1, hidden);

        expect(group).toHaveLength(4);
        expect(new Set(idsOf(group)).size).toBe(4);
        /* คนที่ยังไม่ได้ลงต้องได้ลงก่อนคนที่เพิ่งลงไป */
        expect(idsOf(group)).toContain(visible[0].id);
    });

    it("ขอ 0 รอบ ได้ลิสต์ว่าง", () => {
        expect(spinRoundsWithCarryOver(pool(8), 4, 0)).toEqual([]);
    });

    it("ไม่แก้ไข pool ต้นฉบับที่ส่งเข้ามา", () => {
        const players = pool(6);
        const before = uuidsOf(players);

        spinRoundsWithCarryOver(players, 4, 3);

        expect(uuidsOf(players)).toEqual(before);
    });
});

describe("shuffle", () => {
    it("คืนสมาชิกครบชุดเดิม ไม่หายไม่งอก", () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8];

        expect(shuffle(input).sort((a, b) => a - b)).toEqual(input);
    });

    it("ไม่แก้ array เดิม", () => {
        const input = [1, 2, 3, 4, 5];
        const copy = [...input];

        shuffle(input);

        expect(input).toEqual(copy);
    });

    it("ลิสต์ว่างกับลิสต์คนเดียวก็ไม่พัง", () => {
        expect(shuffle([])).toEqual([]);
        expect(shuffle(["a"])).toEqual(["a"]);
    });

    /**
     * ตัวเดิมใช้ `sort(() => Math.random() - 0.5)` ซึ่งเอนไปทางเดิมอย่างเป็นระบบ —
     * ของ V8 ไพ่ใบแรกมีโอกาสอยู่ที่เดิมสูงกว่าที่ควรมาก เทสนี้จับตรงนั้น
     * ด้วยการนับว่าสมาชิกตัวแรกอยู่ที่เดิมกี่ครั้งจาก 3000 รอบ
     */
    it("กระจายพอ ๆ กันทุกตำแหน่ง ไม่ค้างที่เดิมบ่อยผิดปกติ", () => {
        const size = 8;
        const rounds = 3000;
        const list = Array.from({ length: size }, (_, i) => i);

        let stayed = 0;
        for (let i = 0; i < rounds; i++) {
            if (shuffle(list)[0] === 0) stayed++;
        }

        const rate = stayed / rounds;
        /* ค่าที่ถูกต้องคือ 1/8 = 0.125 เผื่อความคลาดจากการสุ่มไว้กว้าง ๆ */
        expect(rate).toBeGreaterThan(0.09);
        expect(rate).toBeLessThan(0.17);
    });
});
