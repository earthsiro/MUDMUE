import { PlayerProfile, addProfileByName, loadProfiles, saveProfiles } from "../../../services/profileService";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
    createCourt,
    createEmptySession,
    createTier,
    loadDraft,
    loadHanSettings,
    saveDraft,
    saveHanSettings,
    upsertSession,
} from "../../../services/hanService";
import type { HanSession, HanSettings, RateTier } from "../../../types/han";

import { HanContext } from "./hanContext";
import { calculateSession } from "../../../helpers/hanCalc";

/**
 * State ทั้งหมดของ MUDMUE Han อยู่ที่นี่ที่เดียว
 *
 * บิลที่กำลังกรอก (draft) เขียนลง localStorage ทุกครั้งที่เปลี่ยน — หน้างานจริงคนกรอก
 * ระหว่างเก็บของ สลับแอปไปตอบไลน์แล้วกลับมาต้องยังอยู่ครบ ส่วนประวัติจะเขียนก็ต่อเมื่อ
 * กด "บันทึกลงประวัติ" เท่านั้น
 */
export const HanProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<HanSession>(() => loadDraft() ?? createEmptySession());
    const [profiles, setProfiles] = useState<PlayerProfile[]>(() => loadProfiles());
    const [settings, setSettings] = useState<HanSettings>(() => loadHanSettings());
    const [pickedTierId, setPickedTierId] = useState<string | null>(null);
    /** บอกว่าบิลใบนี้เข้าประวัติไปแล้ว — ใช้เปลี่ยนคำบนปุ่มบันทึก */
    const [sessionSaved, setSessionSaved] = useState(false);

    useEffect(() => {
        saveDraft(session);
    }, [session]);

    const result = useMemo(() => calculateSession(session), [session]);

    /** ทุกการแก้บิลผ่านตัวนี้ เพื่อให้ flag "บันทึกแล้ว" หลุดทันทีที่มีการแก้ */
    const patchSession = useCallback((mutate: (current: HanSession) => HanSession) => {
        setSessionSaved(false);
        setSession(mutate);
    }, []);

    /* ---- หัวบิล ---------------------------------------------------- */

    const setTitle = useCallback(
        (title: string) => patchSession((s) => ({ ...s, title })),
        [patchSession]
    );

    const setDate = useCallback(
        (isoDate: string) => patchSession((s) => ({ ...s, date: isoDate })),
        [patchSession]
    );

    /* ---- ป้ายราคา -------------------------------------------------- */

    const addTier = useCallback(() => {
        patchSession((s) => ({
            ...s,
            /** ตั้งชื่อให้ตามลำดับที่มีอยู่ ผู้ใช้แก้ทับได้ทันที */
            tiers: [...s.tiers, createTier(`ชม.ที่ ${s.tiers.length + 1}`, 0, 1)],
        }));
    }, [patchSession]);

    const updateTier = useCallback(
        (tierId: string, patch: Partial<Omit<RateTier, "id">>) => {
            patchSession((s) => ({
                ...s,
                tiers: s.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)),
            }));
        },
        [patchSession]
    );

    const removeTier = useCallback(
        (tierId: string) => {
            /* ลบป้ายต้นฉบับต้องดึงออกจากทุกคอร์ทด้วย ไม่งั้นคอร์ทจะอ้าง id ที่ไม่มีอยู่ */
            patchSession((s) => ({
                ...s,
                tiers: s.tiers.filter((tier) => tier.id !== tierId),
                courts: s.courts.map((court) => ({
                    ...court,
                    tierIds: court.tierIds.filter((id) => id !== tierId),
                })),
            }));
            setPickedTierId((current) => (current === tierId ? null : current));
        },
        [patchSession]
    );

    /* ---- คอร์ท ----------------------------------------------------- */

    const addCourt = useCallback(() => {
        patchSession((s) => ({
            ...s,
            courts: [...s.courts, createCourt(s.courts.length + 1)],
        }));
    }, [patchSession]);

    const removeCourt = useCallback(
        (courtId: string) => {
            patchSession((s) => {
                /* ต้องเหลืออย่างน้อยหนึ่งคอร์ทเสมอ */
                if (s.courts.length <= 1) return s;
                return {
                    ...s,
                    courts: s.courts
                        .filter((court) => court.id !== courtId)
                        .map((court, index) => ({ ...court, index: index + 1 })),
                };
            });
        },
        [patchSession]
    );

    const attachTier = useCallback(
        (courtId: string, tierId: string) => {
            patchSession((s) => {
                if (!s.tiers.some((tier) => tier.id === tierId)) return s;
                return {
                    ...s,
                    courts: s.courts.map((court) =>
                        court.id === courtId ? { ...court, tierIds: [...court.tierIds, tierId] } : court
                    ),
                };
            });
        },
        [patchSession]
    );

    const detachTierAt = useCallback(
        (courtId: string, position: number) => {
            patchSession((s) => ({
                ...s,
                courts: s.courts.map((court) =>
                    court.id === courtId
                        ? { ...court, tierIds: court.tierIds.filter((_, index) => index !== position) }
                        : court
                ),
            }));
        },
        [patchSession]
    );

    /* ---- ลูกแบด ---------------------------------------------------- */

    const setShuttlePrice = useCallback(
        (price: number) => patchSession((s) => ({ ...s, shuttlePricePerPiece: Math.max(0, price) })),
        [patchSession]
    );

    const setShuttleCount = useCallback(
        (count: number) => patchSession((s) => ({ ...s, shuttleUsedCount: Math.max(0, count) })),
        [patchSession]
    );

    /* ---- คน -------------------------------------------------------- */

    const reloadProfiles = useCallback(() => setProfiles(loadProfiles()), []);

    const toggleAttendee = useCallback(
        (profile: PlayerProfile) => {
            patchSession((s) => {
                const exists = s.attendees.some((a) => a.profileUuid === profile.uuid);
                if (exists) {
                    return { ...s, attendees: s.attendees.filter((a) => a.profileUuid !== profile.uuid) };
                }
                return {
                    ...s,
                    attendees: [
                        ...s.attendees,
                        {
                            profileUuid: profile.uuid,
                            name: profile.displayName || profile.name,
                            shuttleCount: null,
                        },
                    ],
                };
            });
        },
        [patchSession]
    );

    const addAttendeeByName = useCallback(
        (name: string) => {
            const trimmed = name.trim();
            if (!trimmed) return;

            /* ชื่อใหม่ต้องเข้าไปอยู่ใน Profile กลางด้วย เพื่อให้ Chok เห็นคนเดียวกัน */
            const { list, profile } = addProfileByName(profiles, trimmed);
            if (list !== profiles) {
                saveProfiles(list);
                setProfiles(list);
            }

            patchSession((s) => {
                if (s.attendees.some((a) => a.profileUuid === profile.uuid)) return s;
                return {
                    ...s,
                    attendees: [
                        ...s.attendees,
                        {
                            profileUuid: profile.uuid,
                            name: profile.displayName || profile.name,
                            shuttleCount: null,
                        },
                    ],
                };
            });
        },
        [patchSession, profiles]
    );

    const setAttendeeShuttle = useCallback(
        (profileUuid: string, count: number | null) => {
            patchSession((s) => ({
                ...s,
                attendees: s.attendees.map((a) =>
                    a.profileUuid === profileUuid
                        ? { ...a, shuttleCount: count === null ? null : Math.max(0, count) }
                        : a
                ),
            }));
        },
        [patchSession]
    );

    /* ---- ประวัติ --------------------------------------------------- */

    const saveToHistory = useCallback(() => {
        upsertSession(session);
        setSessionSaved(true);
    }, [session]);

    const startNewSession = useCallback(() => {
        setPickedTierId(null);
        setSessionSaved(false);
        setSession(createEmptySession());
    }, []);

    const loadSessionToDraft = useCallback((loaded: HanSession) => {
        setPickedTierId(null);
        setSessionSaved(true);
        setSession(loaded);
    }, []);

    /* ---- ตั้งค่า --------------------------------------------------- */

    const updateSettings = useCallback((patch: Partial<HanSettings>) => {
        setSettings((current) => {
            const next = { ...current, ...patch };
            saveHanSettings(next);
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            session,
            result,
            setTitle,
            setDate,
            addTier,
            updateTier,
            removeTier,
            addCourt,
            removeCourt,
            attachTier,
            detachTierAt,
            pickedTierId,
            setPickedTierId,
            setShuttlePrice,
            setShuttleCount,
            profiles,
            reloadProfiles,
            toggleAttendee,
            addAttendeeByName,
            setAttendeeShuttle,
            sessionSaved,
            saveToHistory,
            startNewSession,
            loadSessionToDraft,
            settings,
            updateSettings,
        }),
        [
            session,
            result,
            setTitle,
            setDate,
            addTier,
            updateTier,
            removeTier,
            addCourt,
            removeCourt,
            attachTier,
            detachTierAt,
            pickedTierId,
            setShuttlePrice,
            setShuttleCount,
            profiles,
            reloadProfiles,
            toggleAttendee,
            addAttendeeByName,
            setAttendeeShuttle,
            sessionSaved,
            saveToHistory,
            startNewSession,
            loadSessionToDraft,
            settings,
            updateSettings,
        ]
    );

    return <HanContext.Provider value={value}>{children}</HanContext.Provider>;
};
