import { DEFAULT_TIMER_SETTINGS } from "../../../services/wwDraftService";
import type { FormEvent } from "react";
import type { PhaseTimerSettings } from "../../../types/wwDraft";
import { WWButton, WWPanel, WWPanelTitle, WWSurface, wwTheme } from "../ww-draft.styles";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";
import { useState } from "react";

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
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
        font-size: 15px;
        font-weight: 700;
        color: ${wwTheme.text};
    }
`;

const Note = styled.p`
    margin: 12px 0 0;
    font-size: 12.5px;
    color: ${wwTheme.textDim};
    line-height: 1.6;
`;

const FIELDS: { key: keyof PhaseTimerSettings; label: string }[] = [
    { key: "ban1Minutes", label: "Ban 1 (นาที)" },
    { key: "pick1Minutes", label: "Pick 1 (นาที)" },
    { key: "ban2Minutes", label: "Ban 2 (นาที)" },
    { key: "pick2Minutes", label: "Pick 2 (นาที)" },
    { key: "lastbanMinutes", label: "Last Ban (นาที)" },
    { key: "bossrollMinutes", label: "Boss Roll (นาที)" },
    { key: "battleAttemptMinutes", label: "Battle ต่อครั้ง (นาที, 0 = ปิด)" },
];

export const WWTimerSettings = () => {
    const { timerSettings, updateTimerSettings } = useDraft();
    const [form, setForm] = useState<PhaseTimerSettings>(timerSettings);
    const [saved, setSaved] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        updateTimerSettings(form);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
    };

    return (
        <WWSurface>
            <WWPanel>
                <WWPanelTitle>Phase Timer</WWPanelTitle>
                <form onSubmit={submit}>
                    <Grid>
                        {FIELDS.map(({ key, label }) => (
                            <Field key={key}>
                                {label}
                                <input
                                    type="number"
                                    min={0}
                                    max={60}
                                    step={0.5}
                                    value={form[key] ?? 0}
                                    onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                                />
                            </Field>
                        ))}
                    </Grid>

                    <div className="flex gap-2 mt-4 flex-wrap items-center">
                        <WWButton type="submit" tone="primary">
                            บันทึก
                        </WWButton>
                        <WWButton type="button" tone="ghost" onClick={() => setForm(DEFAULT_TIMER_SETTINGS)}>
                            ค่าเริ่มต้น
                        </WWButton>
                        {saved && <span style={{ fontSize: 13, color: wwTheme.ok }}>บันทึกแล้ว ✓</span>}
                    </div>
                </form>

                <Note>
                    นาฬิกาจะนับถอยหลังหนึ่งรอบต่อหนึ่งเฟส และรีเซ็ตเองเมื่อเปลี่ยนเฟส · เมื่อหมดเวลาจะกะพริบและมีเสียงเตือน
                    <strong> แต่ไม่ข้ามเทิร์นให้อัตโนมัติ</strong> — กรรมการยังต้องกดเอง
                </Note>
            </WWPanel>
        </WWSurface>
    );
};
