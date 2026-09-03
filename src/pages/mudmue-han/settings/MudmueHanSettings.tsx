import { ChokButton, ChokCaption, ChokEmpty, chok } from "../../mudmue-pick/chok.styles";
import {
    HanBadge,
    HanHint,
    HanRow,
    HanSection,
    HanSectionHead,
    HanSectionTitle,
    HanStack,
    HanWarning,
} from "../han.styles";
import { PlayerProfile, saveProfiles, setProfileArchived } from "../../../services/profileService";
import { useRef, useState } from "react";

import { countSessionsWithProfile } from "../../../services/hanService";
import styled from "styled-components";
import { useHan } from "../context/hanContext";

const QrPreview = styled.img`
    width: 100%;
    max-width: 240px;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    border-radius: 12px;
    border: 1px solid ${chok.line};
    background: ${chok.surface};
`;

const HiddenFile = styled.input`
    display: none;
`;

const PeopleRows = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const PersonRow = styled.div<{ $archived: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding: 6px 12px;
    border-radius: 10px;
    background: ${({ $archived }) => ($archived ? chok.disabledBg : chok.surfaceAlt)};
    border: 1px solid ${chok.line};

    .who {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        min-width: 0;
        font-size: 14px;
        color: ${({ $archived }) => ($archived ? chok.muted : chok.ink)};
    }
`;

/** ย่อรูป QR ก่อนเก็บ — รูปจากกล้อง 4MB ยัดลง localStorage ไม่ได้ (โควตา ~5MB ทั้งโดเมน) */
const MAX_QR_EDGE = 640;

const shrinkToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("ไฟล์นี้ไม่ใช่รูปภาพ"));
            image.onload = () => {
                const scale = Math.min(1, MAX_QR_EDGE / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("ย่อรูปไม่สำเร็จ"));
                    return;
                }
                /* พื้นขาวรองไว้ก่อน เผื่อไฟล์ PNG โปร่งใส — QR บนพื้นใสสแกนไม่ติด */
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };
            image.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });

/**
 * ตั้งค่าของ MUDMUE Han
 * - รูป QR พร้อมเพย์ อัปโหลดครั้งเดียวแล้วเรียกดูได้จากปุ่มที่หน้าสรุป
 * - ซ่อน/เลิกซ่อนรายชื่อ (ที่นี่ไม่มีปุ่มลบ — การลบโปรไฟล์อยู่ที่หน้า Profile ของ Chok)
 */
export const MudmueHanSettings = () => {
    const { settings, updateSettings, profiles, reloadProfiles } = useHan();
    const fileRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setError("");
        try {
            const dataUrl = await shrinkToDataUrl(file);
            updateSettings({ paymentQrImage: dataUrl });
        } catch (e) {
            setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
        }
    };

    const toggleArchived = (profile: PlayerProfile) => {
        const next = setProfileArchived(profiles, profile.id, !profile.archived);
        saveProfiles(next);
        reloadProfiles();
    };

    return (
        <HanStack $gap={14}>
            <HanSection>
                <HanSectionHead>
                    <HanSectionTitle>
                        <span aria-hidden>📱</span> QR รับเงิน
                    </HanSectionTitle>
                </HanSectionHead>

                {settings.paymentQrImage ? (
                    <QrPreview src={settings.paymentQrImage} alt="รูป QR พร้อมเพย์ที่ตั้งไว้" />
                ) : (
                    <HanHint>ยังไม่ได้ตั้งรูป QR — อัปโหลดครั้งเดียว แล้วเรียกดูได้จากปุ่ม "QR รับเงิน" ที่หน้าสรุป</HanHint>
                )}

                {error && <HanWarning role="alert">⚠️ {error}</HanWarning>}

                <HanRow>
                    <ChokButton type="button" $tone="primary" onClick={() => fileRef.current?.click()}>
                        {settings.paymentQrImage ? "เปลี่ยนรูป QR" : "อัปโหลดรูป QR"}
                    </ChokButton>
                    {settings.paymentQrImage && (
                        <ChokButton
                            type="button"
                            $tone="danger"
                            onClick={() => updateSettings({ paymentQrImage: "" })}
                        >
                            ลบรูป
                        </ChokButton>
                    )}
                    <HiddenFile
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        aria-label="เลือกไฟล์รูป QR พร้อมเพย์"
                        onChange={(e) => {
                            void handleFile(e.target.files?.[0]);
                            /* เคลียร์ค่า เพื่อให้เลือกไฟล์เดิมซ้ำแล้ว onChange ยังยิง */
                            e.target.value = "";
                        }}
                    />
                </HanRow>

                <HanHint>รูปจะถูกย่อเหลือด้านละไม่เกิน {MAX_QR_EDGE}px ก่อนเก็บลงเครื่อง (ไม่ได้ส่งขึ้นเซิร์ฟเวอร์)</HanHint>
            </HanSection>

            <HanSection>
                <HanSectionHead>
                    <HanSectionTitle>
                        <span aria-hidden>👥</span> จัดการรายชื่อ
                    </HanSectionTitle>
                    <HanHint>รายชื่อชุดเดียวกับ MUDMUE Chok</HanHint>
                </HanSectionHead>

                {profiles.length === 0 ? (
                    <ChokEmpty>ยังไม่มีรายชื่อ — เพิ่มได้จากหน้าคำนวณ</ChokEmpty>
                ) : (
                    <PeopleRows>
                        {profiles.map((profile) => {
                            const name = profile.displayName || profile.name;
                            const billCount = countSessionsWithProfile(profile.uuid);
                            return (
                                <PersonRow key={profile.uuid} $archived={Boolean(profile.archived)}>
                                    <span className="who">
                                        {name}
                                        {profile.archived && <HanBadge>ซ่อนอยู่</HanBadge>}
                                        {billCount > 0 && <ChokCaption>ติดอยู่ {billCount} บิล</ChokCaption>}
                                    </span>
                                    <ChokButton
                                        type="button"
                                        onClick={() => toggleArchived(profile)}
                                        aria-label={profile.archived ? `เลิกซ่อน ${name}` : `ซ่อน ${name}`}
                                    >
                                        {profile.archived ? "เลิกซ่อน" : "ซ่อน"}
                                    </ChokButton>
                                </PersonRow>
                            );
                        })}
                    </PeopleRows>
                )}

                <HanHint>
                    ซ่อน = ไม่ขึ้นในลิสต์ "คนมาวันนี้" แต่บิลเก่ายังอ้างถึงได้ตามเดิม — ใช้แทนการลบเมื่อคนคนนั้นมีประวัติผูกอยู่
                </HanHint>
            </HanSection>
        </HanStack>
    );
};
