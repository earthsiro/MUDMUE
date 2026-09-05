import { BOSS_ROLL_COUNT, getAttemptsForBoss } from "../../../helpers/wwDraftEngine";
import { WWButton, WWPanel, WWPanelTitle, wwCut, wwFramed, wwTheme } from "../ww-draft.styles";

import styled from "styled-components";
import { useDraft } from "../context/draftContext";

const Row = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: flex-start;
`;

const BossCard = styled.button<{ $state: "current" | "past" | "future" }>`
    ${({ $state }) =>
        wwFramed(
            "10px",
            $state === "current" ? wwTheme.accent : wwTheme.cardLine,
            $state === "current" ? wwTheme.accent100 : wwTheme.panelSoft,
            $state === "current" ? "2px" : "1px"
        )}
    width: 92px;
    padding: 8px;
    opacity: ${({ $state }) => ($state === "past" ? 0.45 : 1)};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: ${wwTheme.text};

    &:hover::after {
        background: ${wwTheme.accent100};
    }
`;

const BossArt = styled.div`
    ${wwCut("6px")}
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: ${wwTheme.neutral200};
    display: grid;
    place-items: center;
    font-size: 20px;
    color: ${wwTheme.neutral600};

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const BossName = styled.span`
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`;

const Attempts = styled.span`
    font-size: 10px;
    color: ${wwTheme.textDim};
`;

const Note = styled.p<{ $tone?: "warn" }>`
    margin: 8px 0 0;
    font-size: 12px;
    color: ${({ $tone }) => ($tone === "warn" ? wwTheme.warn : wwTheme.textDim)};
`;

export const BossRollPanel = () => {
    const { match, bosses, bossMap, rollBossPool, setBossIndex } = useDraft();
    if (!match) return null;

    const rolled = match.bossPoolRolled;
    /**
     * สุ่มบอสใหม่ได้เฉพาะก่อนเริ่มตี — พอมีผลการตีบันทึกไว้แล้ว การสุ่มใหม่จะเขียนทับ
     * ลำดับบอสและรีเซ็ตบอสปัจจุบันกลับไปตัวแรก ทั้งที่ `battleLog` ยังถือ `bossIndex`
     * ชุดเดิมอยู่ จำนวนครั้งที่ลอง ชีวิตตัวละคร และตรรกะแพ้ทั้งคู่จะชี้ไปที่บอสผิดตัวหมด
     */
    const battleStarted = match.battleLog.length > 0;
    const canRoll = bosses.length >= 1 && !battleStarted;

    return (
        <WWPanel>
            <div className="flex items-center justify-between gap-3 mb-2">
                <WWPanelTitle style={{ margin: 0 }}>Boss Order</WWPanelTitle>
                <WWButton
                    type="button"
                    tone="primary"
                    onClick={rollBossPool}
                    disabled={!canRoll}
                    title={
                        battleStarted
                            ? "เริ่มบันทึกผลการตีไปแล้ว — สุ่มบอสใหม่ตอนนี้จะทำให้ผลที่บันทึกไว้ชี้ผิดตัว"
                            : undefined
                    }
                >
                    {rolled.length ? "สุ่มใหม่" : `สุ่มบอส ${BOSS_ROLL_COUNT} ตัว`}
                </WWButton>
            </div>

            {battleStarted && (
                <Note $tone="warn">
                    ⚠ บันทึกผลการตีไปแล้ว — ล็อกลำดับบอสไว้ ถ้าต้องการชุดใหม่ให้เริ่มแมตช์ใหม่
                </Note>
            )}

            {rolled.length === 0 ? (
                <Note>
                    {canRoll
                        ? `ยังไม่ได้สุ่มบอส — กดปุ่มเพื่อสุ่ม ${BOSS_ROLL_COUNT} ตัวจากพูลบอส (${bosses.length} ตัว)`
                        : "ยังไม่มีบอสในพูล — เพิ่มบอสที่แท็บ Pool ก่อน"}
                </Note>
            ) : (
                <>
                    <Row>
                        {rolled.map((bossId, index) => {
                            const boss = bossMap[bossId];
                            const state =
                                index === match.currentBossIndex ? "current" : index < match.currentBossIndex ? "past" : "future";
                            return (
                                <BossCard
                                    key={`${bossId}-${index}`}
                                    type="button"
                                    $state={state}
                                    onClick={() => setBossIndex(index)}
                                    title={`ไปที่บอสตัวที่ ${index + 1}`}
                                >
                                    <BossArt>
                                        {boss?.imageUrl ? <img src={boss.imageUrl} alt={boss.name} loading="lazy" /> : "👹"}
                                    </BossArt>
                                    <BossName>
                                        {index + 1}. {boss?.name ?? "unknown"}
                                    </BossName>
                                    <Attempts>
                                        {getAttemptsForBoss(match, index, "P1")} / {getAttemptsForBoss(match, index, "P2")}
                                    </Attempts>
                                </BossCard>
                            );
                        })}
                    </Row>
                    <Note>ตัวเลขใต้ชื่อบอส = จำนวนครั้งที่ลอง (P1 / P2) — คลิกการ์ดเพื่อสลับบอสปัจจุบันเอง</Note>
                </>
            )}
        </WWPanel>
    );
};
