import {
    activeProfiles,
    addProfile,
    addProfileByName,
    deleteProfile,
    formatWinLoseRatio,
    loadProfileMap,
    loadProfiles,
    saveProfiles,
    setProfileArchived,
    updateProfile,
} from "./profileService";
import { describe, expect, it } from "vitest";

/**
 * รายชื่อผู้เล่นเป็นข้อมูลก้อนเดียวที่ Chok กับ Han ใช้ร่วมกัน — ที่นี่จึงเทส
 * สองเรื่องหลัก: การเพิ่มคนจากหน้า Han ต้องไม่สร้างคนซ้ำ และการ "ซ่อน" ต้อง
 * ทำให้คนหายจากลิสต์เลือกโดยที่ข้อมูลยังอยู่ให้ประวัติเก่าอ้างถึงได้
 */

const seed = (names: string[]) => names.reduce((list, name) => addProfile(list, name, name, ""), [] as ReturnType<typeof loadProfiles>);

describe("การเพิ่มและแก้ไขโปรไฟล์", () => {
    it("ให้ id ไล่ต่อกันและ uuid ไม่ซ้ำ", () => {
        const list = seed(["Hinata", "Kageyama"]);

        expect(list.map((p) => p.id)).toEqual([1, 2]);
        expect(new Set(list.map((p) => p.uuid)).size).toBe(2);
        expect(list[0]).toMatchObject({ win: 0, lose: 0 });
    });

    it("id ใหม่นับต่อจากค่าสูงสุด ไม่ใช่จำนวนคนในลิสต์", () => {
        const afterDelete = deleteProfile(seed(["A", "B", "C"]), 2);
        const list = addProfile(afterDelete, "D", "D", "");

        expect(list.map((p) => p.id)).toEqual([1, 3, 4]);
    });

    it("แก้ไขแล้วเวลาอัปเดตขยับ แต่ชนะ/แพ้ที่สะสมไว้ไม่หาย", () => {
        const list = seed(["Hinata"]);
        const withStats = list.map((p) => ({ ...p, win: 4, lose: 1, updateDate: "2020-01-01T00:00:00.000Z" }));
        const updated = updateProfile(withStats, 1, "Shoyo", "Hinata", "A");

        expect(updated[0]).toMatchObject({ name: "Shoyo", displayName: "Hinata", level: "A", win: 4, lose: 1 });
        expect(updated[0].updateDate).not.toBe("2020-01-01T00:00:00.000Z");
    });
});

describe("addProfileByName — เพิ่มคนจากหน้า MUDMUE Han", () => {
    it("สร้างคนใหม่โดยใช้ชื่อเดียวกันทั้งชื่อจริงและชื่อที่แสดง ยังไม่ต้องมีระดับมือ", () => {
        const { list, profile } = addProfileByName([], "  Tsukishima  ");

        expect(list).toHaveLength(1);
        expect(profile).toMatchObject({ name: "Tsukishima", displayName: "Tsukishima", level: "" });
    });

    it("ชื่อซ้ำคืนคนเดิม ไม่สร้างซ้ำ (ไม่สนตัวพิมพ์เล็กใหญ่และช่องว่างหัวท้าย)", () => {
        const existing = seed(["Hinata"]);
        const { list, profile } = addProfileByName(existing, "  hinata ");

        expect(list).toBe(existing);
        expect(profile.uuid).toBe(existing[0].uuid);
    });

    it("เทียบกับชื่อที่แสดงด้วย ไม่ใช่แค่ชื่อจริง", () => {
        const existing = updateProfile(seed(["Shoyo"]), 1, "Shoyo", "Hinata", "");
        const { list } = addProfileByName(existing, "hinata");

        expect(list).toHaveLength(1);
    });
});

describe("การซ่อนโปรไฟล์แทนการลบ", () => {
    it("คนที่ถูกซ่อนหายจากลิสต์เลือก แต่ยังอยู่ในข้อมูล", () => {
        const list = setProfileArchived(seed(["Hinata", "Kageyama"]), 1, true);

        expect(list).toHaveLength(2);
        expect(activeProfiles(list).map((p) => p.name)).toEqual(["Kageyama"]);
    });

    it("เลิกซ่อนแล้วกลับเข้าลิสต์ตามเดิม", () => {
        let list = setProfileArchived(seed(["Hinata"]), 1, true);
        list = setProfileArchived(list, 1, false);

        expect(activeProfiles(list)).toHaveLength(1);
    });

    it("โปรไฟล์เก่าที่ยังไม่มีฟิลด์ archived ถือว่ายังไม่ถูกซ่อน", () => {
        const legacy = seed(["Hinata"]);

        expect(legacy[0].archived).toBeUndefined();
        expect(activeProfiles(legacy)).toHaveLength(1);
    });
});

describe("การอ่าน-เขียนลงเครื่อง", () => {
    it("บันทึกแล้วอ่านกลับได้ครบ", () => {
        const list = seed(["Hinata", "Kageyama"]);
        saveProfiles(list);

        expect(loadProfiles()).toEqual(list);
    });

    it("ยังไม่เคยบันทึก ได้ลิสต์ว่าง", () => {
        expect(loadProfiles()).toEqual([]);
    });

    it("ข้อมูลในเครื่องพัง คืนลิสต์ว่างแทนที่จะโยน error ใส่หน้าจอ", () => {
        localStorage.setItem("mudmue_profile", "{ไม่ใช่ JSON");

        expect(loadProfiles()).toEqual([]);
    });

    it("loadProfileMap คีย์ด้วย uuid สำหรับให้ตารางค้นแบบไม่ต้องวนลิสต์", () => {
        const list = seed(["Hinata"]);
        saveProfiles(list);

        expect(loadProfileMap()[list[0].uuid]).toMatchObject({ name: "Hinata" });
    });
});

describe("formatWinLoseRatio", () => {
    it("ยังไม่เคยแพ้แต่เคยชนะ = ยังคิดอัตราส่วนไม่ได้", () => {
        expect(formatWinLoseRatio(5, 0)).toBe("-");
    });

    it("ยังไม่เคยลงแข่งเลย = 0", () => {
        expect(formatWinLoseRatio(0, 0)).toBe("0");
    });

    it("มีทั้งชนะและแพ้ = ทศนิยมสองตำแหน่ง", () => {
        expect(formatWinLoseRatio(4, 2)).toBe("2.00");
        expect(formatWinLoseRatio(1, 3)).toBe("0.33");
    });
});
