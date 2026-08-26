import { WWInput, WWPanel, WWPanelTitle, wwTheme } from "../ww-draft.styles";
import { useMemo, useState } from "react";

import { CharacterTile } from "./CharacterTile";
import type { TileState } from "./CharacterTile";
import type { WWCharacter } from "../../../types/wwDraft";
import { canClickPoolCharacter } from "../../../helpers/wwDraftEngine";
import styled from "styled-components";
import { useDraft } from "../context/draftContext";

const Panel = styled(WWPanel)`
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const Head = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
`;

const Meta = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: ${wwTheme.neutral600};
`;

const Rule = styled.div`
    height: 2px;
    background: ${wwTheme.line};
    margin: 16px 0;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 14px;
    overflow-y: auto;
    padding-right: 4px;
    max-height: 46vh;

    @media (max-width: 1100px) {
        max-height: none;
    }
`;

const Toggle = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;

    input {
        accent-color: ${wwTheme.accent};
        width: 13px;
        height: 13px;
    }
`;

export const PoolGrid = () => {
    const { match, characters, poolClick, overrideMode } = useDraft();
    const [query, setQuery] = useState("");
    const [hideTaken, setHideTaken] = useState(false);

    const rows = useMemo(() => {
        if (!match) return [];
        const q = query.trim().toLowerCase();
        return characters
            .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
            .map((character: WWCharacter) => {
                const inPool = match.pool.includes(character.id);
                const isBanned = match.bannedPool.includes(character.id);
                const owned = match.rosterP1.includes(character.id) || match.rosterP2.includes(character.id);

                let state: TileState = "disabled";
                if (isBanned) state = "banned";
                else if (owned) state = "picked";
                else if (inPool) state = canClickPoolCharacter(match, character.id, overrideMode) ? "available" : "disabled";

                return { character, state, taken: isBanned || owned };
            })
            .filter((row) => (hideTaken ? !row.taken : true));
    }, [match, characters, query, hideTaken, overrideMode]);

    if (!match) return null;

    return (
        <Panel>
            <Head>
                <WWPanelTitle style={{ margin: 0 }}>Character Pool</WWPanelTitle>
                <Meta>
                    <Toggle>
                        <input type="checkbox" checked={hideTaken} onChange={(e) => setHideTaken(e.target.checked)} />
                        ซ่อนตัวที่ถูกใช้แล้ว
                    </Toggle>
                    <span>
                        เหลือในพูล {match.pool.length}/{characters.length}
                    </span>
                </Meta>
            </Head>

            <WWInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาตัวละคร..."
                aria-label="ค้นหาตัวละคร"
            />

            <Rule />

            <Grid>
                {rows.map(({ character, state }) => (
                    <CharacterTile
                        key={character.id}
                        character={character}
                        state={state === "picked" ? "disabled" : state}
                        showElement
                        onClick={state === "available" ? () => poolClick(character.id) : undefined}
                        title={
                            state === "banned"
                                ? `${character.name} — ถูกแบน`
                                : state === "picked"
                                  ? `${character.name} — ถูกเลือกไปแล้ว`
                                  : character.name
                        }
                    />
                ))}
            </Grid>
        </Panel>
    );
};
