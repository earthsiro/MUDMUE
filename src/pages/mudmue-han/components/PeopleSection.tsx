import {
    HanBadge,
    HanHint,
    HanPersonToggle,
    HanRow,
    HanSection,
    HanSectionHead,
    HanSectionTitle,
    chok,
} from "../han.styles";
import { ChokButton, ChokInput } from "../../mudmue-pick/chok.styles";

import { activeProfiles } from "../../../services/profileService";
import { breakpoints } from "../../../styles/breakpoints";
import styled from "styled-components";
import { useHan } from "../context/hanContext";
import { FormEvent, useState } from "react";

const PeopleWrap = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const AddForm = styled.form`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    input {
        flex: 1;
        min-width: 180px;
        max-width: 280px;
    }

    /* มือถือ: ช่องชื่อกินเต็มบรรทัด ปุ่มลงไปอยู่บรรทัดล่างแบบเต็มความกว้าง
       ดีกว่าปล่อยให้ช่องพิมพ์ชื่อเหลือ 100px */
    @media (max-width: ${breakpoints.mobile}px) {
        input {
            flex: 1 1 100%;
            max-width: none;
        }
        button {
            flex: 1 1 100%;
        }
    }
`;

const Empty = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${chok.muted};
`;

/**
 * เลือกคนมาวันนี้ — ดึงจาก Profile กลางตัวเดียวกับ MUDMUE Chok
 *
 * คนที่ถูกซ่อน (archived) ไม่ขึ้นในลิสต์นี้ แต่ถ้าเคยถูกเลือกไว้ในบิลที่โหลดมาจาก
 * ประวัติ ก็ยังแสดงเป็นชิปที่เลือกอยู่ตามเดิม ไม่งั้นบิลเก่าจะมีคนหายไปเงียบ ๆ
 */
export const PeopleSection = () => {
    const { session, profiles, toggleAttendee, addAttendeeByName } = useHan();
    const [newName, setNewName] = useState("");

    const selectedUuids = new Set(session.attendees.map((a) => a.profileUuid));
    const selectable = activeProfiles(profiles);
    /* คนที่ถูกซ่อนไปแล้วแต่ยังอยู่ในบิลใบนี้ — ต้องเห็นและเอาออกได้ */
    const archivedButSelected = profiles.filter((p) => p.archived && selectedUuids.has(p.uuid));
    const shown = [...selectable, ...archivedButSelected];

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        addAttendeeByName(newName);
        setNewName("");
    };

    return (
        <HanSection>
            <HanSectionHead>
                <HanSectionTitle>
                    <span aria-hidden>👥</span> คนมาวันนี้
                </HanSectionTitle>
                <HanBadge $tone={session.attendees.length > 0 ? "active" : "default"}>
                    เลือกแล้ว {session.attendees.length} คน
                </HanBadge>
            </HanSectionHead>

            {shown.length === 0 ? (
                <Empty>ยังไม่มีรายชื่อในระบบ — พิมพ์ชื่อด้านล่างเพื่อเพิ่มคนแรก</Empty>
            ) : (
                <PeopleWrap>
                    {shown.map((profile) => {
                        const selected = selectedUuids.has(profile.uuid);
                        const name = profile.displayName || profile.name;
                        return (
                            <HanPersonToggle
                                key={profile.uuid}
                                type="button"
                                $selected={selected}
                                aria-pressed={selected}
                                aria-label={selected ? `เอา ${name} ออกจากก๊วนวันนี้` : `เลือก ${name} มาวันนี้`}
                                onClick={() => toggleAttendee(profile)}
                            >
                                <span aria-hidden>{selected ? "✓" : "＋"}</span>
                                {name}
                                {profile.archived && <HanBadge>ซ่อนอยู่</HanBadge>}
                            </HanPersonToggle>
                        );
                    })}
                </PeopleWrap>
            )}

            <AddForm onSubmit={handleAdd}>
                <ChokInput
                    type="text"
                    value={newName}
                    maxLength={25}
                    placeholder="เพิ่มชื่อใหม่"
                    aria-label="ชื่อคนที่จะเพิ่มเข้าก๊วน"
                    onChange={(e) => setNewName(e.target.value)}
                />
                <ChokButton type="submit" $tone="primary" disabled={!newName.trim()}>
                    เพิ่มคน
                </ChokButton>
            </AddForm>

            <HanRow>
                <HanHint>ชื่อที่เพิ่มที่นี่จะไปโผล่ในรายชื่อของ MUDMUE Chok ด้วย (ใช้ Profile ก้อนเดียวกัน)</HanHint>
            </HanRow>
        </HanSection>
    );
};
