import {
    TIED,
    countUnfinishedMatchesWithProfile,
    createMatch,
    loadHistories,
    updateMatch,
    updateMatchProgress,
} from "./matchService";
import { describe, expect, it } from "vitest";
import { loadProfiles, saveProfiles } from "./profileService";

import type { PlayerDataType } from "./matchService";
import type { PlayerProfile } from "./profileService";

/**
 * ประวัติแมตช์ของ MUDMUE Chok
 *
 * จุดที่เทสชุดนี้กันไว้เป็นหลักคือ "จบแมตช์ซ้ำ" — สถิติ win/lose ของโปรไฟล์
 * ที่บวกเกินย้อนกลับไม่ได้ เพราะไม่มีที่ไหนเก็บว่าแต้มไหนมาจากแมตช์อะไร
 */

const profile = (uuid: string, id: number): PlayerProfile => ({
    id,
    name: uuid,
    uuid,
    displayName: uuid,
    level: "",
    win: 0,
    lose: 0,
    createDate: "2026-01-01T00:00:00.000Z",
    updateDate: "2026-01-01T00:00:00.000Z",
});

const lineup = (): PlayerDataType[] => [
    { name: "r1", uuid: "r1", team: "red", score: 0, position: 0 },
    { name: "b1", uuid: "b1", team: "blue", score: 0, position: 0 },
];

const scored = (red: number, blue: number): PlayerDataType[] => [
    { name: "r1", uuid: "r1", team: "red", score: red, position: 0 },
    { name: "b1", uuid: "b1", team: "blue", score: blue, position: 0 },
];

const seed = () => {
    saveProfiles([profile("r1", 1), profile("b1", 2)]);
    createMatch(lineup(), "red");
    return loadHistories()[0].id;
};

const statsOf = (uuid: string) => {
    const found = loadProfiles().find((p) => p.uuid === uuid);
    return { win: found?.win ?? 0, lose: found?.lose ?? 0 };
};

describe("updateMatch", () => {
    it("บวก win ให้ฝั่งชนะและ lose ให้ฝั่งแพ้ครั้งเดียว", () => {
        const id = seed();

        updateMatch(id, scored(21, 15), "red", "red");

        expect(statsOf("r1")).toEqual({ win: 1, lose: 0 });
        expect(statsOf("b1")).toEqual({ win: 0, lose: 1 });
    });

    it("กดจบแมตช์เดิมซ้ำ ต้องไม่บวกสถิติเพิ่มอีกรอบ", () => {
        const id = seed();

        updateMatch(id, scored(21, 15), "red", "red");
        updateMatch(id, scored(21, 15), "red", "red");
        updateMatch(id, scored(21, 15), "red", "red");

        expect(statsOf("r1")).toEqual({ win: 1, lose: 0 });
        expect(statsOf("b1")).toEqual({ win: 0, lose: 1 });
    });

    it("เสมอแล้วไม่แตะสถิติของใคร แต่ยังปิดแมตช์", () => {
        const id = seed();

        updateMatch(id, scored(20, 20), "red", TIED);

        expect(statsOf("r1")).toEqual({ win: 0, lose: 0 });
        expect(loadHistories()[0].winner).toBe(TIED);
        expect(loadHistories()[0].finishedDate).toBeTruthy();
    });

    it("เก็บคะแนนสุดท้ายไว้ในประวัติ", () => {
        const id = seed();

        updateMatch(id, scored(21, 15), "red", "red");

        expect(loadHistories()[0].player.find((p) => p.team === "red")?.score).toBe(21);
    });
});

describe("updateMatchProgress", () => {
    it("เก็บคะแนนระหว่างแข่งโดยไม่ปิดแมตช์และไม่แตะสถิติ", () => {
        const id = seed();

        updateMatchProgress(id, scored(5, 3), "blue");

        const saved = loadHistories()[0];
        expect(saved.winner).toBeUndefined();
        expect(saved.serviceSide).toBe("blue");
        expect(saved.player.find((p) => p.team === "red")?.score).toBe(5);
        expect(statsOf("r1")).toEqual({ win: 0, lose: 0 });
    });

    it("ไม่แตะแมตช์ที่จบไปแล้ว", () => {
        const id = seed();
        updateMatch(id, scored(21, 15), "red", "red");

        updateMatchProgress(id, scored(0, 0), "blue");

        const saved = loadHistories()[0];
        expect(saved.winner).toBe("red");
        expect(saved.player.find((p) => p.team === "red")?.score).toBe(21);
    });

    it("ไม่ขยับ updateDate — การ์ดหน้า Dashboard เอาไปโชว์เป็นเวลาของแมตช์", () => {
        const id = seed();
        const before = loadHistories()[0].updateDate;

        updateMatchProgress(id, scored(7, 7), "red");

        expect(loadHistories()[0].updateDate).toBe(before);
    });
});

describe("countUnfinishedMatchesWithProfile", () => {
    it("นับเฉพาะแมตช์ที่ยังไม่จบและมีคนนี้อยู่", () => {
        const id = seed();
        createMatch(lineup(), "blue");

        expect(countUnfinishedMatchesWithProfile("r1")).toBe(2);

        updateMatch(id, scored(21, 10), "red", "red");

        expect(countUnfinishedMatchesWithProfile("r1")).toBe(1);
        expect(countUnfinishedMatchesWithProfile("ไม่มีคนนี้")).toBe(0);
    });
});
