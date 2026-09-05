import {
    clearDraft,
    countSessionsWithProfile,
    createCourt,
    createEmptySession,
    createShuttle,
    createTier,
    deleteSession,
    isSessionBlank,
    loadDraft,
    loadHanSettings,
    loadSessions,
    saveDraft,
    saveHanSettings,
    saveSessions,
    upsertSession,
} from "./hanService";
import { describe, expect, it } from "vitest";

import type { HanSession } from "../types/han";

/**
 * ที่เก็บข้อมูลของ MUDMUE Han — สามก้อนที่ต้องไม่ปนกัน: บิลที่กรอกค้าง,
 * ประวัติที่กดบันทึกแล้ว และตั้งค่าถาวร
 *
 * `countSessionsWithProfile` เป็นตัวกันลบโปรไฟล์ที่หน้า Chok เรียกใช้ ถ้าพลาด
 * ประวัติจะกลายเป็นบิลที่อ้างถึงคนที่ไม่มีอยู่จริง
 */

const bill = (id: string, attendeeUuids: string[] = []): HanSession => ({
    ...createEmptySession(),
    id,
    attendees: attendeeUuids.map((uuid) => ({ profileUuid: uuid, name: uuid, shuttleCount: null })),
});

describe("createEmptySession", () => {
    it("เริ่มด้วยคอร์ทหนึ่งใบที่มีป้ายราคาแปะไว้แล้ว ให้เห็นกลไกตั้งแต่หน้าแรก", () => {
        const session = createEmptySession();

        expect(session.courts).toHaveLength(1);
        expect(session.tiers).toHaveLength(1);
        expect(session.courts[0].tierIds).toEqual([session.tiers[0].id]);
    });

    it("ไม่ยัดตัวเลขตัวอย่างมาให้ — ทุกช่องราคาเริ่มที่ 0 และยังไม่มีคน", () => {
        const session = createEmptySession();

        expect(session.tiers[0].pricePerHour).toBe(0);
        expect(session.shuttles).toHaveLength(1);
        expect(session.shuttles[0].pricePerTube).toBe(0);
        expect(session.shuttles[0].usedCount).toBe(0);
        /* หลอดมาตรฐาน 12 ลูก — ค่าเดียวที่ตั้งมาให้ เพราะเดาถูกเกือบทุกครั้ง */
        expect(session.shuttles[0].piecesPerTube).toBe(12);
        expect(session.attendees).toEqual([]);
        expect(session.savedAt).toBeUndefined();
    });

    it("บิลแต่ละใบได้ id คนละตัว", () => {
        expect(createEmptySession().id).not.toBe(createEmptySession().id);
    });

    it("ป้ายราคาเริ่มต้นคือหนึ่งชั่วโมง และคอร์ทใหม่ยังไม่มีป้าย", () => {
        expect(createTier("ชม.แรก", 120)).toMatchObject({ label: "ชม.แรก", pricePerHour: 120, hours: 1 });
        expect(createCourt(2)).toMatchObject({ index: 2, tierIds: [] });
    });
});

describe("บิลที่กรอกค้างไว้ (draft)", () => {
    it("บันทึกแล้วกลับมาเปิดใหม่ต้องยังอยู่ครบ", () => {
        const session = bill("draft-1");
        saveDraft(session);

        expect(loadDraft()).toEqual(session);
    });

    it("ยังไม่เคยกรอกอะไร = ไม่มี draft", () => {
        expect(loadDraft()).toBeNull();
    });

    it("ล้างแล้วหายจริง", () => {
        saveDraft(bill("draft-1"));
        clearDraft();

        expect(loadDraft()).toBeNull();
    });

    it("ข้อมูลในเครื่องพัง คืน null แทนที่จะทำหน้าคำนวณล่ม", () => {
        localStorage.setItem("mudmue_han_draft", "ไม่ใช่ JSON");

        expect(loadDraft()).toBeNull();
    });
});

describe("บิลรูปแบบเดิม (ก่อนมีลูกแบดหลายยี่ห้อ)", () => {
    /** บิลที่บันทึกไว้ตอนที่ยังกรอกได้แค่ราคาต่อลูกค่าเดียวทั้งบิล */
    const legacy = (id: string, pricePerPiece: number, usedCount: number) => ({
        ...createEmptySession(),
        id,
        shuttles: undefined,
        shuttlePricePerPiece: pricePerPiece,
        shuttleUsedCount: usedCount,
    });

    it("draft เก่ากลายเป็นยี่ห้อเดียว โดยยอดค่าลูกเท่าเดิม", () => {
        localStorage.setItem("mudmue_han_draft", JSON.stringify(legacy("old-draft", 30, 10)));

        const loaded = loadDraft();
        const brand = loaded?.shuttles[0];

        expect(loaded?.shuttles).toHaveLength(1);
        expect(brand?.usedCount).toBe(10);
        /* ราคาต่อหลอดย้อนมาจากราคาต่อลูก × 12 หารกลับแล้วต้องได้ 30 เท่าเดิม */
        expect((brand?.pricePerTube ?? 0) / (brand?.piecesPerTube ?? 1)).toBe(30);
    });

    it("ประวัติเก่าทั้งลิสต์ถูกแปลงตอนโหลด ไม่ใช่ตอนบันทึก", () => {
        localStorage.setItem(
            "mudmue_han_sessions",
            JSON.stringify([legacy("old-1", 25, 8), legacy("old-2", 0, 0)])
        );

        const list = loadSessions();

        expect(list.map((item) => item.shuttles[0].usedCount)).toEqual([8, 0]);
        expect(list.every((item) => !("shuttleUsedCount" in item))).toBe(true);
    });

    it("บิลใหม่ที่มี shuttles อยู่แล้วไม่ถูกแตะ", () => {
        const session = { ...createEmptySession(), shuttles: [createShuttle("RSL", 520, 12, 7)] };
        saveDraft(session);

        expect(loadDraft()).toEqual(session);
    });
});

describe("ประวัติบิล", () => {
    it("บันทึกใบใหม่ต่อท้าย พร้อมประทับเวลาที่บันทึก", () => {
        const list = upsertSession(bill("b1"));

        expect(list).toHaveLength(1);
        expect(list[0].savedAt).toBeTruthy();
        expect(loadSessions()).toHaveLength(1);
    });

    it("กดบันทึกซ้ำหลังแก้ยอด = ทับใบเดิม ไม่ใช่เพิ่มใบใหม่", () => {
        upsertSession(bill("b1"));
        const list = upsertSession({ ...bill("b1"), title: "แบดวันเสาร์" });

        expect(list).toHaveLength(1);
        expect(list[0].title).toBe("แบดวันเสาร์");
    });

    it("บิลคนละ id อยู่ร่วมกันได้ และลบทีละใบ", () => {
        upsertSession(bill("b1"));
        upsertSession(bill("b2"));

        const remaining = deleteSession("b1");

        expect(remaining.map((s) => s.id)).toEqual(["b2"]);
        expect(loadSessions().map((s) => s.id)).toEqual(["b2"]);
    });

    it("ลบ id ที่ไม่มีอยู่ ไม่กระทบใคร", () => {
        upsertSession(bill("b1"));

        expect(deleteSession("ไม่มีใบนี้")).toHaveLength(1);
    });
});

describe("countSessionsWithProfile — ตัวกันลบโปรไฟล์", () => {
    it("นับเฉพาะบิลที่คนนั้นติดอยู่", () => {
        saveSessions([bill("b1", ["hinata", "kageyama"]), bill("b2", ["kageyama"]), bill("b3", [])]);

        expect(countSessionsWithProfile("kageyama")).toBe(2);
        expect(countSessionsWithProfile("hinata")).toBe(1);
        expect(countSessionsWithProfile("nobody")).toBe(0);
    });

    it("ยังไม่มีประวัติเลย = 0 (ลบโปรไฟล์ได้ตามปกติ)", () => {
        expect(countSessionsWithProfile("hinata")).toBe(0);
    });
});

describe("ตั้งค่า", () => {
    it("ยังไม่เคยตั้ง ได้ค่าเริ่มต้นที่ยังไม่มีรูป QR", () => {
        expect(loadHanSettings()).toEqual({ paymentQrImage: "" });
    });

    it("บันทึกรูป QR แล้วอ่านกลับได้", () => {
        saveHanSettings({ paymentQrImage: "data:image/png;base64,AAAA" });

        expect(loadHanSettings().paymentQrImage).toBe("data:image/png;base64,AAAA");
    });

    it("ค่าที่บันทึกไว้ก่อนจะมีฟิลด์ใหม่ ยังอ่านได้โดยเติมค่าเริ่มต้นให้", () => {
        localStorage.setItem("mudmue_han_settings", "{}");

        expect(loadHanSettings()).toEqual({ paymentQrImage: "" });
    });
});

describe("isSessionBlank", () => {
    it("บิลที่เพิ่งเปิดใหม่ถือว่าว่าง — เขียนทับได้โดยไม่ต้องถาม", () => {
        expect(isSessionBlank(createEmptySession())).toBe(true);
    });

    it("พอมีคนมาวันนี้แล้วไม่ว่างอีกต่อไป", () => {
        expect(isSessionBlank(bill("h1", ["u1"]))).toBe(false);
    });

    it("ตั้งชื่อก๊วนไว้ก็ถือว่ากรอกแล้ว", () => {
        expect(isSessionBlank({ ...createEmptySession(), title: "แบดวันเสาร์" })).toBe(false);
    });

    it("ใส่ราคาป้ายหรือค่าลูกไว้ก็ถือว่ากรอกแล้ว", () => {
        const withPrice = createEmptySession();
        withPrice.tiers[0].pricePerHour = 200;

        expect(isSessionBlank(withPrice)).toBe(false);
        expect(isSessionBlank({ ...createEmptySession(), shuttles: [createShuttle("", 0, 12, 4)] })).toBe(false);
        expect(isSessionBlank({ ...createEmptySession(), shuttles: [createShuttle("", 520, 12, 0)] })).toBe(
            false
        );
    });

    it("เพิ่มคอร์ทที่สองก็ถือว่ากรอกแล้ว", () => {
        const session = createEmptySession();

        expect(isSessionBlank({ ...session, courts: [...session.courts, createCourt(2)] })).toBe(false);
    });
});
