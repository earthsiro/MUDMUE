import type { MatchDataType, PlayerDataType } from "../services/matchService";

/**
 * กติกาการเปลี่ยนคะแนนของ MUDMUE Chok — pure function ไม่แตะ state และไม่แตะ storage
 *
 * แยกออกมาจากหน้า Dashboard เพราะเดิมโค้ดถือว่า "ทุกการเปลี่ยนคะแนนคือการได้แต้ม"
 * พอกดปุ่มลบเพื่อแก้เลขที่กดผิด ระบบเลยโอนสิทธิ์เสิร์ฟให้ฝั่งที่ไม่ได้เล่นจริง
 *
 * กติกาที่ยึด:
 * - ฝั่งที่เสิร์ฟอยู่ได้แต้ม  → คู่ของฝั่งนั้นสลับคอร์ท สิทธิ์เสิร์ฟอยู่ที่เดิม
 * - ฝั่งรับได้แต้ม           → ชิงสิทธิ์เสิร์ฟมา ไม่มีใครสลับคอร์ท
 * - ฝั่งที่เสิร์ฟอยู่ถอนแต้ม  → สลับคอร์ทกลับ (สลับสองครั้งได้ตำแหน่งเดิม) = undo ของข้อแรก
 * - ฝั่งรับถอนแต้ม           → เป็นการแก้เลขที่กดผิด ไม่ใช่การเล่น จึงไม่ยุ่งกับเสิร์ฟและตำแหน่ง
 */

export type ChokTeam = "blue" | "red";

export type ScoreChangeResult = {
    player: PlayerDataType[];
    serviceSide: string;
};

export const applyScoreChange = (
    match: MatchDataType,
    team: ChokTeam,
    nextScore: number
): ScoreChangeResult => {
    const currentScore = match.player.find((p) => p.team === team)?.score ?? 0;
    const score = Math.max(0, nextScore);

    /** คะแนนทั้งทีมเดินพร้อมกัน — ผู้เล่นทุกคนในทีมถือเลขเดียวกัน */
    const withScore = match.player.map((p) => (p.team === team ? { ...p, score } : p));

    if (score === currentScore) return { player: withScore, serviceSide: match.serviceSide };

    const isServingSide = team === match.serviceSide;

    if (isServingSide) {
        return {
            player: withScore.map((p) =>
                p.team === team ? { ...p, position: p.position === 0 ? 1 : 0 } : p
            ),
            serviceSide: match.serviceSide,
        };
    }

    const gainedPoint = score > currentScore;
    return { player: withScore, serviceSide: gainedPoint ? team : match.serviceSide };
};
