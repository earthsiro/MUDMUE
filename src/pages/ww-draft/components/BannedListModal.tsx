import { BANNED_LIST_MODAL_ID, closeBannedListModal } from "./bannedListModalControls";
import { PHASE_LABELS, getPlayerName } from "../../../helpers/wwDraftEngine";
import { WWButton, wwTheme } from "../ww-draft.styles";

import { CharacterTile } from "./CharacterTile";
import type { DraftPhase } from "../../../types/wwDraft";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";

const Sheet = styled.div`
    background: ${wwTheme.surface};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontBody};
    border: 2px solid ${wwTheme.line};
    border-radius: ${wwTheme.radiusLg};
`;

const Group = styled.div`
    margin-bottom: 18px;
`;

const GroupTitle = styled.h4`
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${wwTheme.textDim};
    display: flex;
    align-items: center;
    gap: 8px;

    &::after {
        content: "";
        flex: 1;
        height: 1px;
        background: ${wwTheme.line};
    }
`;

const Row = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px 6px;
`;

const Empty = styled.p`
    margin: 0;
    font-size: 12.5px;
    color: ${wwTheme.textDim};
`;

const close = closeBannedListModal;

export const BannedListModal = () => {
    const { match, characterMap } = useDraft();

    const banGroups: { key: DraftPhase | "lastbanP1" | "lastbanP2"; title: string; ids: string[]; accent: string }[] =
        match
            ? [
                  {
                      key: "ban1" as const,
                      title: `${PHASE_LABELS.ban1} — แบนจากพูลกลาง`,
                      ids: match.phaseHistory.filter((a) => a.kind === "ban" && a.phase === "ban1").flatMap((a) => a.characterIds),
                      accent: wwTheme.ban,
                  },
                  {
                      key: "ban2" as const,
                      title: `${PHASE_LABELS.ban2} — แบนจากพูลกลาง`,
                      ids: match.phaseHistory.filter((a) => a.kind === "ban" && a.phase === "ban2").flatMap((a) => a.characterIds),
                      accent: wwTheme.ban,
                  },
                  {
                      key: "lastbanP1" as const,
                      title: `${PHASE_LABELS.lastban} — ถูกแบนจากทีม ${getPlayerName(match, "P1")}`,
                      ids: match.lastBannedP1,
                      accent: wwTheme.p1,
                  },
                  {
                      key: "lastbanP2" as const,
                      title: `${PHASE_LABELS.lastban} — ถูกแบนจากทีม ${getPlayerName(match, "P2")}`,
                      ids: match.lastBannedP2,
                      accent: wwTheme.p2,
                  },
              ]
            : [];

    return (
        <dialog id={BANNED_LIST_MODAL_ID} className="modal">
            <Sheet className="modal-box w-11/12 max-w-3xl">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={close}>
                    ✕
                </button>
                <h3 className="font-bold text-[20px] mb-4">Banned List</h3>

                {!match ? (
                    <Empty>ยังไม่มีแมตช์</Empty>
                ) : (
                    banGroups.map((group) => (
                        <Group key={group.key}>
                            <GroupTitle>
                                {group.title}
                                <span style={{ color: group.accent }}>{group.ids.length}</span>
                            </GroupTitle>
                            {group.ids.length === 0 ? (
                                <Empty>ยังไม่มีการแบนในเฟสนี้</Empty>
                            ) : (
                                <Row>
                                    {group.ids.map((id) => (
                                        <CharacterTile
                                            key={`${group.key}-${id}`}
                                            character={characterMap[id]}
                                            state="banned"
                                            size="sm"
                                            accent={group.accent}
                                        />
                                    ))}
                                </Row>
                            )}
                        </Group>
                    ))
                )}

                <div className="flex justify-end">
                    <WWButton type="button" tone="ghost" onClick={close}>
                        ปิด
                    </WWButton>
                </div>
            </Sheet>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};
