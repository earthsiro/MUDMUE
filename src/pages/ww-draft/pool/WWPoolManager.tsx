import {
    ELEMENT_LIST,
    WEAPON_LIST,
    deleteBoss,
    deleteCharacter,
    downloadImportTemplate,
    exportPoolsToExcel,
    importPoolsFromExcel,
    loadMatchHistory,
    mergeBosses,
    mergeCharacters,
    saveBosses,
    saveCharacters,
    upsertBoss,
    upsertCharacter,
} from "../../../services/wwDraftService";
import { WWButton, WWEmpty, WWPanel, WWPanelTitle, WWSurface, wwTheme } from "../ww-draft.styles";
import type { FormEvent } from "react";
import type { WWBoss, WWCharacter } from "../../../types/wwDraft";
import { useRef, useState } from "react";

import { CharacterTile } from "../components/CharacterTile";
import { buildMockBosses, buildMockCharacters } from "../../../services/wwDraftMockData";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";

const CHAR_MODAL = "ww_character_modal";
const BOSS_MODAL = "ww_boss_modal";

const Toolbar = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 12px;
`;

const Columns = styled.div`
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 12px;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 14px 8px;
    max-height: 52vh;
    overflow-y: auto;
`;

const Cell = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
`;

const MiniActions = styled.div`
    display: flex;
    gap: 4px;

    button {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: ${wwTheme.radiusSm};
        border: 1px solid ${wwTheme.line};
        background: ${wwTheme.panelSoft};
        color: ${wwTheme.textDim};
        cursor: pointer;
    }
    button:hover {
        filter: brightness(1.3);
    }
`;

const Sheet = styled.div`
    background: ${wwTheme.surface};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontBody};
    border: 2px solid ${wwTheme.line};
    border-radius: ${wwTheme.radiusLg};
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: ${wwTheme.textDim};

    input,
    select {
        background: ${wwTheme.panelSoft};
        border: 1px solid ${wwTheme.line};
        border-radius: ${wwTheme.radiusMd};
        padding: 9px 11px;
        font-size: 14px;
        color: ${wwTheme.text};
    }
`;

const Warnings = styled.ul`
    margin: 10px 0 0;
    padding-left: 18px;
    font-size: 12px;
    color: ${wwTheme.warn};
    max-height: 140px;
    overflow-y: auto;
`;

const emptyCharacter: WWCharacter = { id: "", name: "", imageUrl: "", element: "", weaponType: "", rarity: 5 };
const emptyBoss: WWBoss = { id: "", name: "", imageUrl: "" };

const openModal = (id: string) => (document.getElementById(id) as HTMLDialogElement | null)?.showModal();
const closeModal = (id: string) => (document.getElementById(id) as HTMLDialogElement | null)?.close();

/** Read an uploaded image as a data-URI so it survives in localStorage. */
const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

export const WWPoolManager = () => {
    const { characters, bosses, reloadPools, match } = useDraft();
    const [charForm, setCharForm] = useState<WWCharacter>(emptyCharacter);
    const [bossForm, setBossForm] = useState<WWBoss>(emptyBoss);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [importMessage, setImportMessage] = useState("");
    const importInput = useRef<HTMLInputElement>(null);

    const saveCharacterForm = (e: FormEvent) => {
        e.preventDefault();
        saveCharacters(upsertCharacter(characters, { ...charForm, name: charForm.name.trim() }));
        reloadPools();
        closeModal(CHAR_MODAL);
    };

    const saveBossForm = (e: FormEvent) => {
        e.preventDefault();
        saveBosses(upsertBoss(bosses, { ...bossForm, name: bossForm.name.trim() }));
        reloadPools();
        closeModal(BOSS_MODAL);
    };

    const removeCharacter = (character: WWCharacter) => {
        if (!window.confirm(`ลบ "${character.name}" ออกจากพูล?`)) return;
        saveCharacters(deleteCharacter(characters, character.id));
        reloadPools();
    };

    const removeBoss = (boss: WWBoss) => {
        if (!window.confirm(`ลบบอส "${boss.name}" ออกจากพูล?`)) return;
        saveBosses(deleteBoss(bosses, boss.id));
        reloadPools();
    };

    const seedMockPools = () => {
        const hasData = characters.length > 0 || bosses.length > 0;
        if (hasData && !window.confirm("โหลดข้อมูลตัวอย่างจะแทนที่พูลตัวละครและบอสที่มีอยู่ทั้งหมด — ดำเนินการต่อ?")) {
            return;
        }
        const mockCharacters = buildMockCharacters();
        const mockBosses = buildMockBosses();
        saveCharacters(mockCharacters);
        saveBosses(mockBosses);
        reloadPools();
        setWarnings([]);
        setImportMessage(
            `โหลดข้อมูลตัวอย่างแล้ว — ตัวละคร ${mockCharacters.length} ตัว, บอส ${mockBosses.length} ตัว (รูปเป็น placeholder แก้ได้ทีหลัง)`
        );
    };

    const runImport = async (file: File) => {
        setWarnings([]);
        setImportMessage("");
        try {
            const result = await importPoolsFromExcel(file);
            const replace = window.confirm(
                `พบตัวละคร ${result.characters.length} ตัว และบอส ${result.bosses.length} ตัว\n\n` +
                    "กด OK เพื่อ *แทนที่* พูลเดิมทั้งหมด หรือ Cancel เพื่อ *เพิ่มต่อท้าย* พูลเดิม"
            );

            if (replace) {
                if (result.characters.length) saveCharacters(result.characters);
                if (result.bosses.length) saveBosses(result.bosses);
            } else {
                saveCharacters(mergeCharacters(characters, result.characters));
                saveBosses(mergeBosses(bosses, result.bosses));
            }

            reloadPools();
            setWarnings(result.warnings);
            setImportMessage(
                `นำเข้าสำเร็จ — ตัวละคร ${result.characters.length} ตัว, บอส ${result.bosses.length} ตัว` +
                    (replace ? " (แทนที่ของเดิม)" : " (เพิ่มต่อท้าย)")
            );
        } catch (error) {
            setImportMessage(`นำเข้าไม่สำเร็จ: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            if (importInput.current) importInput.current.value = "";
        }
    };

    return (
        <WWSurface>
            <Toolbar>
                <WWButton
                    type="button"
                    tone="primary"
                    onClick={() => {
                        setCharForm(emptyCharacter);
                        openModal(CHAR_MODAL);
                    }}
                >
                    + ตัวละคร
                </WWButton>
                <WWButton
                    type="button"
                    onClick={() => {
                        setBossForm(emptyBoss);
                        openModal(BOSS_MODAL);
                    }}
                >
                    + บอส
                </WWButton>
                <WWButton
                    type="button"
                    tone="ghost"
                    onClick={() => exportPoolsToExcel(characters, bosses, loadMatchHistory())}
                >
                    ⬇ Export .xlsx
                </WWButton>
                <WWButton type="button" tone="ghost" onClick={() => importInput.current?.click()}>
                    ⬆ Import .xlsx
                </WWButton>
                <WWButton type="button" tone="ghost" onClick={downloadImportTemplate}>
                    ไฟล์ตัวอย่าง
                </WWButton>
                <WWButton type="button" tone="warn" onClick={seedMockPools}>
                    🎲 โหลดข้อมูลตัวอย่าง
                </WWButton>
                <input
                    ref={importInput}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void runImport(file);
                    }}
                />
                {match && (
                    <span style={{ fontSize: 12, color: wwTheme.warn }}>
                        ⚠ มีแมตช์ที่ค้างอยู่ — การแก้พูลจะไม่กระทบแมตช์นั้นจนกว่าจะเริ่มแมตช์ใหม่
                    </span>
                )}
            </Toolbar>

            {importMessage && <p style={{ fontSize: 13, color: wwTheme.ok, marginBottom: 8 }}>{importMessage}</p>}
            {warnings.length > 0 && (
                <Warnings>
                    {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                    ))}
                </Warnings>
            )}

            <Columns>
                <WWPanel>
                    <WWPanelTitle>Characters ({characters.length})</WWPanelTitle>
                    {characters.length === 0 ? (
                        <WWEmpty>ยังไม่มีตัวละคร — กด “+ ตัวละคร” หรือ Import จากไฟล์ Excel</WWEmpty>
                    ) : (
                        <Grid>
                            {characters.map((character) => (
                                <Cell key={character.id}>
                                    <CharacterTile character={character} state="disabled" showElement />
                                    <MiniActions>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCharForm({ ...emptyCharacter, ...character });
                                                openModal(CHAR_MODAL);
                                            }}
                                        >
                                            แก้ไข
                                        </button>
                                        <button type="button" onClick={() => removeCharacter(character)}>
                                            ลบ
                                        </button>
                                    </MiniActions>
                                </Cell>
                            ))}
                        </Grid>
                    )}
                </WWPanel>

                <WWPanel>
                    <WWPanelTitle>Bosses ({bosses.length})</WWPanelTitle>
                    {bosses.length === 0 ? (
                        <WWEmpty>ยังไม่มีบอส</WWEmpty>
                    ) : (
                        <Grid>
                            {bosses.map((boss) => (
                                <Cell key={boss.id}>
                                    <CharacterTile
                                        character={{ id: boss.id, name: boss.name, imageUrl: boss.imageUrl }}
                                        state="disabled"
                                    />
                                    <MiniActions>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBossForm({ ...emptyBoss, ...boss });
                                                openModal(BOSS_MODAL);
                                            }}
                                        >
                                            แก้ไข
                                        </button>
                                        <button type="button" onClick={() => removeBoss(boss)}>
                                            ลบ
                                        </button>
                                    </MiniActions>
                                </Cell>
                            ))}
                        </Grid>
                    )}
                </WWPanel>
            </Columns>

            {/* Character add/edit */}
            <dialog id={CHAR_MODAL} className="modal">
                <Sheet className="modal-box w-11/12 max-w-lg">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => closeModal(CHAR_MODAL)}
                    >
                        ✕
                    </button>
                    <h3 className="font-bold text-[20px] mb-4">{charForm.id ? "แก้ไขตัวละคร" : "เพิ่มตัวละคร"}</h3>
                    <form onSubmit={saveCharacterForm} className="flex flex-col gap-3">
                        <Field>
                            ชื่อ
                            <input
                                value={charForm.name}
                                onChange={(e) => setCharForm((f) => ({ ...f, name: e.target.value }))}
                                required
                                maxLength={40}
                                autoFocus
                            />
                        </Field>
                        <Field>
                            Image URL
                            <input
                                value={charForm.imageUrl}
                                onChange={(e) => setCharForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                placeholder="https://... หรืออัปโหลดไฟล์ด้านล่าง"
                            />
                        </Field>
                        <Field>
                            อัปโหลดรูป (เก็บเป็น data-URI ใน localStorage)
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const dataUrl = await fileToDataUrl(file);
                                    setCharForm((f) => ({ ...f, imageUrl: dataUrl }));
                                }}
                            />
                        </Field>
                        <div className="grid grid-cols-3 gap-3">
                            <Field>
                                ธาตุ
                                <select
                                    value={charForm.element ?? ""}
                                    onChange={(e) => setCharForm((f) => ({ ...f, element: e.target.value }))}
                                >
                                    <option value="">-</option>
                                    {ELEMENT_LIST.map((element) => (
                                        <option key={element} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field>
                                อาวุธ
                                <select
                                    value={charForm.weaponType ?? ""}
                                    onChange={(e) => setCharForm((f) => ({ ...f, weaponType: e.target.value }))}
                                >
                                    <option value="">-</option>
                                    {WEAPON_LIST.map((weapon) => (
                                        <option key={weapon} value={weapon}>
                                            {weapon}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field>
                                ระดับ
                                <select
                                    value={String(charForm.rarity ?? "")}
                                    onChange={(e) => setCharForm((f) => ({ ...f, rarity: Number(e.target.value) }))}
                                >
                                    <option value="4">4★</option>
                                    <option value="5">5★</option>
                                </select>
                            </Field>
                        </div>
                        <div className="flex justify-between items-center gap-3 mt-2">
                            <CharacterTile character={charForm} state="disabled" showElement />
                            <div className="flex gap-2">
                                <WWButton type="button" tone="ghost" onClick={() => closeModal(CHAR_MODAL)}>
                                    ยกเลิก
                                </WWButton>
                                <WWButton type="submit" tone="primary">
                                    บันทึก
                                </WWButton>
                            </div>
                        </div>
                    </form>
                </Sheet>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Boss add/edit */}
            <dialog id={BOSS_MODAL} className="modal">
                <Sheet className="modal-box w-11/12 max-w-md">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => closeModal(BOSS_MODAL)}
                    >
                        ✕
                    </button>
                    <h3 className="font-bold text-[20px] mb-4">{bossForm.id ? "แก้ไขบอส" : "เพิ่มบอส"}</h3>
                    <form onSubmit={saveBossForm} className="flex flex-col gap-3">
                        <Field>
                            ชื่อบอส
                            <input
                                value={bossForm.name}
                                onChange={(e) => setBossForm((f) => ({ ...f, name: e.target.value }))}
                                required
                                maxLength={40}
                                autoFocus
                            />
                        </Field>
                        <Field>
                            Image URL
                            <input
                                value={bossForm.imageUrl}
                                onChange={(e) => setBossForm((f) => ({ ...f, imageUrl: e.target.value }))}
                                placeholder="https://..."
                            />
                        </Field>
                        <Field>
                            อัปโหลดรูป
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const dataUrl = await fileToDataUrl(file);
                                        setBossForm((f) => ({ ...f, imageUrl: dataUrl }));
                                    }
                                }}
                            />
                        </Field>
                        <div className="flex justify-between items-center gap-3 mt-2">
                            <CharacterTile
                                character={{ id: bossForm.id, name: bossForm.name || "boss", imageUrl: bossForm.imageUrl }}
                                state="disabled"
                            />
                            <div className="flex gap-2">
                                <WWButton type="button" tone="ghost" onClick={() => closeModal(BOSS_MODAL)}>
                                    ยกเลิก
                                </WWButton>
                                <WWButton type="submit" tone="primary">
                                    บันทึก
                                </WWButton>
                            </div>
                        </div>
                    </form>
                </Sheet>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </WWSurface>
    );
};
