import {
    ChokButton,
    ChokCaption,
    ChokEmpty,
    ChokField,
    ChokIconButton,
    ChokInput,
    ChokLabel,
    ChokLegend,
    ChokLevelChip,
    ChokSelect,
    ChokTable,
    ChokTableWrap,
    chok,
} from "../chok.styles";
import {
    LEVEL_LIST,
    PlayerProfile,
    addProfile,
    deleteProfile,
    formatWinLoseRatio,
    loadProfiles,
    saveProfiles,
    setProfileArchived,
    updateProfile,
} from "../../../services/profileService";
import React, { useEffect, useState } from "react";

import { IconUserPlus } from "../../../components/icons";
import { countSessionsWithProfile } from "../../../services/hanService";
import { formatDateTime } from "../../../helpers/formatDate";
import styled from "styled-components";

const Wrap = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

const RowActions = styled.div`
    display: flex;
    gap: 6px;
    justify-content: flex-end;
`;

const ModalBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ModalHeading = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${chok.ink};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const FieldHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
`;

/** Levels are ordered weakest → strongest by their position in LEVEL_LIST. */
const levelHint = (level: string) => {
    const index = LEVEL_LIST.findIndex((l) => l.name === level);
    if (index < 0) return "ยังไม่ได้ตั้งระดับ";
    return `มือ ${level} — ระดับที่ ${index + 1} จาก ${LEVEL_LIST.length} (อ่อน → เก่ง)`;
};

export const MudmueProfile = () => {
    const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
    /**
     * จำนวนบิลของ MUDMUE Han ที่คนนี้ติดอยู่ — มากกว่า 0 เมื่อไหร่คือลบไม่ได้ ต้องซ่อนแทน
     * ไม่งั้นบิลเก่าจะเหลือแต่ uuid ที่ไม่มีเจ้าของ
     */
    const [linkedBills, setLinkedBills] = useState(0);
    const [formProfile, setFormProfile] = useState<Partial<PlayerProfile>>({
        id: undefined,
        name: "",
        displayName: "",
        level: "",
    });

    const openModal = (id: string) => (document.getElementById(id) as HTMLDialogElement).showModal();
    const closeModal = (id: string) => (document.getElementById(id) as HTMLDialogElement).close();

    const handleClickDetailProfileModal = (data: PlayerProfile) => {
        setFormProfile(data);
        openModal("profile_modal");
    };
    const handleClickOpenProfileModal = () => {
        setFormProfile({ id: undefined, name: "", displayName: "", level: "" });
        openModal("profile_modal");
    };
    const handleClickDeleteProfileModal = (data: PlayerProfile) => {
        setFormProfile(data);
        setLinkedBills(countSessionsWithProfile(data.uuid));
        openModal("confirm_modal");
    };
    const onDelete = (id: number) => {
        const newList = deleteProfile(profiles, id);
        setProfiles(newList);
        saveProfiles(newList);
        closeModal("confirm_modal");
    };

    /** ทางออกแทนการลบสำหรับคนที่มีประวัติผูกอยู่ — หายจากลิสต์เลือกคน แต่บิลเก่ายังอ่านได้ */
    const onArchive = (id: number) => {
        const newList = setProfileArchived(profiles, id, true);
        setProfiles(newList);
        saveProfiles(newList);
        closeModal("confirm_modal");
    };

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        let newList;
        if (formProfile.id != null) {
            // edit
            newList = updateProfile(
                profiles,
                formProfile.id,
                formProfile.name ?? "",
                formProfile.displayName ?? "",
                formProfile.level ?? ""
            );
        } else {
            // add
            newList = addProfile(
                profiles,
                formProfile.name ?? "",
                formProfile.displayName ?? "",
                formProfile.level ?? ""
            );
        }
        setProfiles(newList);
        saveProfiles(newList);
        closeModal("profile_modal");
    }

    useEffect(() => {
        setProfiles(loadProfiles());
    }, []);

    return (
        <Wrap>
            <Toolbar>
                <ChokLegend>
                    อ่อน →
                    {LEVEL_LIST.map((level) => (
                        <b key={level.name} title={levelHint(level.name)}>
                            {level.name}
                        </b>
                    ))}
                    → เก่ง
                </ChokLegend>
                <ChokButton type="button" $tone="primary" onClick={handleClickOpenProfileModal}>
                    <IconUserPlus size={20} />
                    เพิ่มโปรไฟล์
                </ChokButton>
            </Toolbar>

            {profiles.length === 0 ? (
                <ChokEmpty>ยังไม่มีโปรไฟล์ผู้เล่น — กด "เพิ่มโปรไฟล์" เพื่อเริ่ม</ChokEmpty>
            ) : (
                <ChokTableWrap>
                    <ChokTable>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ชื่อ</th>
                                <th>Level</th>
                                <th>Win/Lose</th>
                                <th className="optional">W/L Ratio</th>
                                <th className="optional">สร้างเมื่อ</th>
                                <th aria-label="จัดการ" />
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile, index) => (
                                <tr key={profile.id}>
                                    <td className="row-index">{index + 1}</td>
                                    <td>
                                        {profile.displayName}
                                        {profile.displayName !== profile.name && (
                                            <ChokCaption>&nbsp;({profile.name})</ChokCaption>
                                        )}
                                        {profile.archived && <ChokCaption>&nbsp;· ซ่อนอยู่</ChokCaption>}
                                    </td>
                                    <td>
                                        {profile.level ? (
                                            <ChokLevelChip title={levelHint(profile.level)}>
                                                {profile.level}
                                            </ChokLevelChip>
                                        ) : (
                                            <ChokCaption>—</ChokCaption>
                                        )}
                                    </td>
                                    <td>
                                        {profile.win}/{profile.lose}
                                    </td>
                                    <td className="optional">{formatWinLoseRatio(profile.win, profile.lose)}</td>
                                    <td className="optional">
                                        <ChokCaption>{formatDateTime(profile.createDate)}</ChokCaption>
                                    </td>
                                    <td>
                                        <RowActions>
                                            <ChokIconButton
                                                type="button"
                                                title={`แก้ไข ${profile.displayName || profile.name}`}
                                                aria-label={`แก้ไข ${profile.displayName || profile.name}`}
                                                onClick={() => handleClickDetailProfileModal(profile)}
                                            >
                                                ✎
                                            </ChokIconButton>
                                            <ChokIconButton
                                                type="button"
                                                $tone="danger"
                                                title={`ลบ ${profile.displayName || profile.name}`}
                                                aria-label={`ลบ ${profile.displayName || profile.name}`}
                                                onClick={() => handleClickDeleteProfileModal(profile)}
                                            >
                                                🗑
                                            </ChokIconButton>
                                        </RowActions>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </ChokTable>
                </ChokTableWrap>
            )}

            <dialog id="profile_modal" className="modal">
                <div className="modal-box w-11/12 max-w-md" style={{ background: chok.surface }}>
                    <ModalBox>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <ModalHeading>{formProfile.id != null ? "แก้ไขโปรไฟล์" : "เพิ่มโปรไฟล์"}</ModalHeading>
                            <ChokIconButton
                                type="button"
                                onClick={() => closeModal("profile_modal")}
                                title="ปิด"
                                aria-label="ปิด"
                            >
                                ✕
                            </ChokIconButton>
                        </div>

                        <Form onSubmit={handleSave}>
                            <ChokField>
                                <FieldHead>
                                    <ChokLabel>ชื่อจริง</ChokLabel>
                                    <ChokCaption>{formProfile.name?.length ?? 0}/25</ChokCaption>
                                </FieldHead>
                                <ChokInput
                                    type="text"
                                    name="name"
                                    value={formProfile.name ?? ""}
                                    onChange={(e) => setFormProfile((f) => ({ ...f, name: e.target.value }))}
                                    required
                                    maxLength={25}
                                    placeholder="ชื่อผู้เล่น"
                                    autoFocus
                                />
                            </ChokField>

                            <ChokField>
                                <FieldHead>
                                    <ChokLabel>ชื่อที่แสดงในเว็บ</ChokLabel>
                                    <ChokCaption>{formProfile.displayName?.length ?? 0}/25</ChokCaption>
                                </FieldHead>
                                <ChokInput
                                    type="text"
                                    name="displayName"
                                    value={formProfile.displayName ?? ""}
                                    onChange={(e) => setFormProfile((f) => ({ ...f, displayName: e.target.value }))}
                                    required
                                    maxLength={25}
                                    placeholder="ชื่อเล่นที่จะโชว์ในการ์ดแมตช์"
                                />
                            </ChokField>

                            <ChokField>
                                <ChokLabel>Level</ChokLabel>
                                <ChokSelect
                                    name="level"
                                    value={formProfile.level ?? ""}
                                    onChange={(e) => setFormProfile((f) => ({ ...f, level: e.target.value }))}
                                    required
                                >
                                    <option value="" disabled>
                                        -- เลือกระดับ --
                                    </option>
                                    {LEVEL_LIST.map((level, index) => (
                                        <option key={`level-${index}${level.name}`} value={level.name}>
                                            {level.name} — ระดับที่ {index + 1} จาก {LEVEL_LIST.length}
                                        </option>
                                    ))}
                                </ChokSelect>
                                <ChokCaption>เรียงจากอ่อนไปเก่ง: {LEVEL_LIST.map((l) => l.name).join(" · ")}</ChokCaption>
                            </ChokField>

                            <ModalActions>
                                <ChokButton
                                    type="button"
                                    $tone="neutral"
                                    onClick={() => closeModal("profile_modal")}
                                >
                                    ยกเลิก
                                </ChokButton>
                                <ChokButton type="submit" $tone="primary">
                                    {formProfile.id != null ? "บันทึก" : "เพิ่ม"}
                                </ChokButton>
                            </ModalActions>
                        </Form>
                    </ModalBox>
                </div>
            </dialog>

            <dialog id="confirm_modal" className="modal">
                <div className="modal-box w-11/12 max-w-md" style={{ background: chok.surface }}>
                    <ModalBox>
                        <ModalHeading>{linkedBills > 0 ? "ลบไม่ได้ — ซ่อนแทนไหม?" : "ลบโปรไฟล์นี้?"}</ModalHeading>
                        <span>
                            {linkedBills > 0 ? (
                                <>
                                    <strong>{formProfile.displayName || formProfile.name}</strong> ติดอยู่ใน{" "}
                                    {linkedBills} บิลของ MUDMUE Han — ลบแล้วบิลเก่าจะอ้างถึงคนที่ไม่มีอยู่จริง
                                    ซ่อนแทนได้ คนนี้จะหายจากลิสต์ "คนมาวันนี้" แต่บิลเก่ายังอ่านได้ครบ
                                </>
                            ) : (
                                <>
                                    จะลบ <strong>{formProfile.displayName || formProfile.name}</strong> ออกจากรายชื่อ —
                                    ประวัติแมตช์ที่เคยบันทึกไว้ยังอยู่
                                </>
                            )}
                        </span>
                        <ModalActions>
                            <ChokButton type="button" $tone="neutral" onClick={() => closeModal("confirm_modal")}>
                                ยกเลิก
                            </ChokButton>
                            {linkedBills > 0 ? (
                                <ChokButton type="button" $tone="primary" onClick={() => onArchive(formProfile.id!)}>
                                    ซ่อนโปรไฟล์
                                </ChokButton>
                            ) : (
                                <ChokButton type="button" $tone="danger" onClick={() => onDelete(formProfile.id!)}>
                                    ลบ
                                </ChokButton>
                            )}
                        </ModalActions>
                    </ModalBox>
                </div>
            </dialog>
        </Wrap>
    );
};
