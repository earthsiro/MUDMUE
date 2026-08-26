import { WWButton, WWPanel, WWPanelTitle, wwTheme } from "../ww-draft.styles";

import { buildMockBosses, buildMockCharacters } from "../../../services/wwDraftMockData";
import { saveBosses, saveCharacters } from "../../../services/wwDraftService";

import { MIN_POOL_SIZE } from "../../../helpers/wwDraftEngine";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: ${wwTheme.textDim};

    input {
        background: ${wwTheme.panelSoft};
        border: 1px solid ${wwTheme.line};
        border-radius: ${wwTheme.radiusMd};
        padding: 9px 11px;
        font-size: 14px;
        color: ${wwTheme.text};
    }
`;

const Note = styled.p<{ $tone?: "warn" }>`
    margin: 0;
    font-size: 12.5px;
    color: ${({ $tone }) => ($tone === "warn" ? wwTheme.warn : wwTheme.textDim)};
`;

export const NewMatchPanel = () => {
    const { characters, bosses, startMatch, reloadPools } = useDraft();
    const navigate = useNavigate();
    const [p1, setP1] = useState("Player 1");
    const [p2, setP2] = useState("Player 2");

    const poolTooSmall = characters.length < MIN_POOL_SIZE;

    const seedMockPools = () => {
        saveCharacters(buildMockCharacters());
        saveBosses(buildMockBosses());
        reloadPools();
    };

    return (
        <WWPanel>
            <WWPanelTitle>เริ่มแมตช์ใหม่</WWPanelTitle>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    startMatch([p1.trim() || "Player 1", p2.trim() || "Player 2"]);
                }}
            >
                <Field>
                    ผู้เล่นฝั่งซ้าย (P1)
                    <input value={p1} onChange={(e) => setP1(e.target.value)} maxLength={24} />
                </Field>
                <Field>
                    ผู้เล่นฝั่งขวา (P2)
                    <input value={p2} onChange={(e) => setP2(e.target.value)} maxLength={24} />
                </Field>

                <Note>
                    พูลตัวละครตอนนี้ {characters.length} ตัว · พูลบอส {bosses.length} ตัว
                </Note>
                {poolTooSmall && (
                    <Note $tone="warn">
                        ⚠ ต้องมีตัวละครอย่างน้อย {MIN_POOL_SIZE} ตัวถึงจะแบน/เลือกได้ครบทุกเฟส — ไปเพิ่มที่แท็บ Pool ก่อน
                    </Note>
                )}

                <div className="flex gap-2 flex-wrap">
                    <WWButton type="submit" tone="primary" disabled={poolTooSmall}>
                        เริ่มดราฟท์
                    </WWButton>
                    {poolTooSmall && (
                        <WWButton type="button" tone="warn" onClick={seedMockPools}>
                            🎲 โหลดข้อมูลตัวอย่าง
                        </WWButton>
                    )}
                    <WWButton type="button" tone="ghost" onClick={() => navigate("/ww-draft/pool")}>
                        จัดการพูล
                    </WWButton>
                </div>
            </Form>
        </WWPanel>
    );
};
