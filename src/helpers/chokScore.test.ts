import { applyScoreChange } from "./chokScore";
import { describe, expect, it } from "vitest";

import type { MatchDataType } from "../services/matchService";

/**
 * กติกาเสิร์ฟของ MUDMUE Chok
 *
 * ประเด็นหลักที่เทสชุดนี้กัน: ปุ่มลบคะแนนต้องเป็น "undo" ไม่ใช่การเล่นอีกหนึ่งแต้ม
 * ของเดิมถือว่าทุกการเปลี่ยนคะแนนคือการได้แต้ม กดลบให้ฝั่งที่ไม่ได้เสิร์ฟเลยกลายเป็น
 * การโอนสิทธิ์เสิร์ฟให้ฝั่งนั้นทั้งที่ไม่มีใครตีอะไรเลย
 */

const doubles = (serviceSide: string, redScore = 0, blueScore = 0): MatchDataType => ({
    id: 1,
    serviceSide,
    createDate: "2026-01-01T00:00:00.000Z",
    updateDate: "2026-01-01T00:00:00.000Z",
    player: [
        { name: "r1", uuid: "r1", team: "red", score: redScore, position: 0 },
        { name: "r2", uuid: "r2", team: "red", score: redScore, position: 1 },
        { name: "b1", uuid: "b1", team: "blue", score: blueScore, position: 0 },
        { name: "b2", uuid: "b2", team: "blue", score: blueScore, position: 1 },
    ],
});

const positionsOf = (players: MatchDataType["player"], team: string) =>
    players.filter((p) => p.team === team).map((p) => `${p.uuid}:${p.position}`);

describe("applyScoreChange", () => {
    it("คะแนนเดินทั้งทีม ไม่ใช่เฉพาะคนใดคนหนึ่ง", () => {
        const result = applyScoreChange(doubles("red"), "red", 1);

        expect(result.player.filter((p) => p.team === "red").map((p) => p.score)).toEqual([1, 1]);
        expect(result.player.filter((p) => p.team === "blue").map((p) => p.score)).toEqual([0, 0]);
    });

    it("ฝั่งที่เสิร์ฟอยู่ได้แต้ม — คู่ของฝั่งนั้นสลับคอร์ท สิทธิ์เสิร์ฟอยู่ที่เดิม", () => {
        const result = applyScoreChange(doubles("red"), "red", 1);

        expect(result.serviceSide).toBe("red");
        expect(positionsOf(result.player, "red")).toEqual(["r1:1", "r2:0"]);
        expect(positionsOf(result.player, "blue")).toEqual(["b1:0", "b2:1"]);
    });

    it("ฝั่งรับได้แต้ม — ชิงสิทธิ์เสิร์ฟมา และไม่มีใครสลับคอร์ท", () => {
        const result = applyScoreChange(doubles("red"), "blue", 1);

        expect(result.serviceSide).toBe("blue");
        expect(positionsOf(result.player, "red")).toEqual(["r1:0", "r2:1"]);
        expect(positionsOf(result.player, "blue")).toEqual(["b1:0", "b2:1"]);
    });

    it("กดเพิ่มแล้วกดลบให้ฝั่งเดิม ได้สถานะเดิมเป๊ะ — ปุ่มลบต้องเป็น undo", () => {
        const start = doubles("red");
        const scored = applyScoreChange(start, "red", 1);
        const undone = applyScoreChange({ ...start, ...scored }, "red", 0);

        expect(undone.serviceSide).toBe(start.serviceSide);
        expect(undone.player).toEqual(start.player);
    });

    it("ฝั่งรับกดลบคะแนน — เป็นการแก้เลขที่กดผิด ต้องไม่ชิงสิทธิ์เสิร์ฟ", () => {
        const match = doubles("red", 0, 3);

        const result = applyScoreChange(match, "blue", 2);

        expect(result.serviceSide).toBe("red");
        expect(positionsOf(result.player, "blue")).toEqual(["b1:0", "b2:1"]);
    });

    it("คะแนนเท่าเดิม ไม่ขยับอะไรเลย", () => {
        const match = doubles("red", 5, 2);

        const result = applyScoreChange(match, "red", 5);

        expect(result.serviceSide).toBe("red");
        expect(result.player).toEqual(match.player);
    });

    it("กันคะแนนติดลบ", () => {
        const result = applyScoreChange(doubles("blue", 0, 0), "red", -3);

        expect(result.player.filter((p) => p.team === "red").every((p) => p.score === 0)).toBe(true);
    });

    it("เดี่ยว (คนเดียวต่อฝั่ง) ก็ยังคิดสิทธิ์เสิร์ฟถูก", () => {
        const singles: MatchDataType = {
            ...doubles("red"),
            player: [
                { name: "r1", uuid: "r1", team: "red", score: 0, position: 0 },
                { name: "b1", uuid: "b1", team: "blue", score: 0, position: 0 },
            ],
        };

        expect(applyScoreChange(singles, "blue", 1).serviceSide).toBe("blue");
        expect(applyScoreChange(singles, "red", 1).serviceSide).toBe("red");
    });
});
