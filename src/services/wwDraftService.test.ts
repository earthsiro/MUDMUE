import { describe, expect, it } from "vitest";
import { mergeBosses, mergeCharacters } from "./wwDraftService";

import type { WWBoss, WWCharacter } from "../types/wwDraft";

/**
 * การรวมพูลตอนนำเข้า Excel แบบ "เพิ่มต่อท้าย"
 *
 * แถวในไฟล์ที่ไม่ได้ใส่ id (เทมเพลตที่ระบบแจกก็เว้นว่างมาให้) จะได้ id ใหม่ทุกครั้ง
 * ที่นำเข้า ถ้าเทียบแค่ id การนำเข้าไฟล์เดิมซ้ำจะได้ตัวละครซ้ำทั้งชุด
 */

const character = (id: string, name: string, extra: Partial<WWCharacter> = {}): WWCharacter => ({
    id,
    name,
    imageUrl: "",
    ...extra,
});

const boss = (id: string, name: string): WWBoss => ({ id, name, imageUrl: "" });

describe("mergeCharacters", () => {
    it("เจอ id เดิมแล้วอัปเดตทับ ไม่เพิ่มแถวใหม่", () => {
        const existing = [character("char_a", "Jinhsi", { element: "Spectro" })];

        const merged = mergeCharacters(existing, [character("char_a", "Jinhsi", { element: "Havoc" })]);

        expect(merged).toHaveLength(1);
        expect(merged[0].element).toBe("Havoc");
    });

    it("id ไม่ตรงแต่ชื่อตรง ถือว่าคนเดียวกัน — นำเข้าไฟล์เดิมซ้ำต้องไม่ได้ของซ้ำ", () => {
        const existing = [character("char_a", "Jinhsi"), character("char_b", "Changli")];

        const merged = mergeCharacters(existing, [
            character("char_zzz", "Jinhsi"),
            character("char_yyy", "Changli"),
        ]);

        expect(merged).toHaveLength(2);
        expect(merged.map((c) => c.name)).toEqual(["Jinhsi", "Changli"]);
    });

    it("เจอด้วยชื่อแล้วต้องรักษา id เดิมไว้ เพราะแมตช์ที่ค้างอยู่อ้างถึงด้วย id", () => {
        const existing = [character("char_a", "Jinhsi")];

        const merged = mergeCharacters(existing, [character("char_zzz", "Jinhsi", { rarity: 5 })]);

        expect(merged[0].id).toBe("char_a");
        expect(merged[0].rarity).toBe(5);
    });

    it("เทียบชื่อโดยไม่สนตัวพิมพ์และช่องว่างหัวท้าย", () => {
        const existing = [character("char_a", "Jinhsi")];

        const merged = mergeCharacters(existing, [character("char_zzz", "  jinhsi ")]);

        expect(merged).toHaveLength(1);
    });

    it("ชื่อใหม่จริง ๆ ถึงจะต่อท้ายเข้าไป", () => {
        const existing = [character("char_a", "Jinhsi")];

        const merged = mergeCharacters(existing, [character("char_b", "Camellya")]);

        expect(merged.map((c) => c.name)).toEqual(["Jinhsi", "Camellya"]);
    });

    it("ไม่แก้ลิสต์เดิม", () => {
        const existing = [character("char_a", "Jinhsi")];

        mergeCharacters(existing, [character("char_b", "Camellya")]);

        expect(existing).toHaveLength(1);
    });
});

describe("mergeBosses", () => {
    it("ใช้กติกาเดียวกับตัวละคร — ชื่อซ้ำคือตัวเดิม", () => {
        const merged = mergeBosses(
            [boss("boss_a", "Dreamless")],
            [boss("boss_zzz", "Dreamless"), boss("boss_yyy", "Crownless")]
        );

        expect(merged).toHaveLength(2);
        expect(merged[0].id).toBe("boss_a");
    });
});
