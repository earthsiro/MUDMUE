import { createContext, useContext } from "react";
import type { HanCalcResult, HanSession, HanSettings, RateTier, ShuttleBrand } from "../../../types/han";

import type { PlayerProfile } from "../../../services/profileService";

export type HanContextValue = {
    /** บิลที่กำลังกรอกอยู่ — persist ลง localStorage ทุกครั้งที่เปลี่ยน */
    session: HanSession;
    /** ผลคำนวณสด คิดใหม่ทุกครั้งที่ session เปลี่ยน */
    result: HanCalcResult;

    setTitle: (title: string) => void;
    setDate: (isoDate: string) => void;

    /** ป้ายราคา ชม. */
    addTier: () => void;
    updateTier: (tierId: string, patch: Partial<Omit<RateTier, "id">>) => void;
    /** ลบป้ายต้นฉบับ — ดึงออกจากทุกคอร์ทที่แปะไว้ด้วย */
    removeTier: (tierId: string) => void;

    /** คอร์ท */
    addCourt: () => void;
    removeCourt: (courtId: string) => void;
    attachTier: (courtId: string, tierId: string) => void;
    /** เอาป้ายออกจากคอร์ท ระบุตำแหน่งเพราะป้ายเดิมแปะซ้ำบนคอร์ทเดียวกันได้ */
    detachTierAt: (courtId: string, position: number) => void;

    /** โหมดแตะ-เลือก-แล้วแตะคอร์ท (ทางสำรองของการลาก) */
    pickedTierId: string | null;
    setPickedTierId: (tierId: string | null) => void;

    /** ลูกแบด — หนึ่งรายการต่อหนึ่งยี่ห้อ */
    addShuttle: () => void;
    updateShuttle: (shuttleId: string, patch: Partial<Omit<ShuttleBrand, "id">>) => void;
    removeShuttle: (shuttleId: string) => void;

    /** คน */
    profiles: PlayerProfile[];
    reloadProfiles: () => void;
    toggleAttendee: (profile: PlayerProfile) => void;
    /** เพิ่มชื่อใหม่ → sync กลับเข้า Profile กลาง แล้วเลือกให้เลย */
    addAttendeeByName: (name: string) => void;
    setAttendeeShuttle: (profileUuid: string, count: number | null) => void;

    /** ประวัติ */
    sessionSaved: boolean;
    saveToHistory: () => void;
    startNewSession: () => void;
    loadSessionToDraft: (session: HanSession) => void;

    /** ตั้งค่า */
    settings: HanSettings;
    updateSettings: (patch: Partial<HanSettings>) => void;
};

export const HanContext = createContext<HanContextValue | null>(null);

export const useHan = (): HanContextValue => {
    const ctx = useContext(HanContext);
    if (!ctx) throw new Error("useHan must be used inside <HanProvider>");
    return ctx;
};
