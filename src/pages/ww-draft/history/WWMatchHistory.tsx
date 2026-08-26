import { WWButton, WWEmpty, WWPanel, WWPanelTitle, WWSurface, wwTheme } from "../ww-draft.styles";
import { deleteMatchFromHistory, loadMatchHistory } from "../../../services/wwDraftService";
import { useEffect, useState } from "react";

import type { DraftState } from "../../../types/wwDraft";
import { PHASE_LABELS, countBossesFailedByBoth } from "../../../helpers/wwDraftEngine";
import { formatDateTime } from "../../../helpers/formatDate";
import styled from "styled-components";

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
        text-align: left;
        font-size: 11.5px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${wwTheme.textDim};
        padding: 8px 10px;
        border-bottom: 1px solid ${wwTheme.line};
        white-space: nowrap;
    }
    td {
        padding: 9px 10px;
        border-bottom: 1px solid ${wwTheme.line};
        white-space: nowrap;
    }
    tr:hover td {
        background: ${wwTheme.panelSoft};
    }
`;

const Scroll = styled.div`
    overflow-x: auto;
`;

const winnerLabel = (match: DraftState) => {
    if (!match.winner) return "-";
    if (match.winner === "draw") return "เสมอ";
    return match.winner === "P1" ? match.playerNames[0] : match.playerNames[1];
};

export const WWMatchHistory = () => {
    const [matches, setMatches] = useState<DraftState[]>([]);

    useEffect(() => {
        setMatches(loadMatchHistory());
    }, []);

    const remove = (match: DraftState) => {
        if (!window.confirm("ลบแมตช์นี้ออกจากประวัติ?")) return;
        setMatches(deleteMatchFromHistory(match.matchId));
    };

    return (
        <WWSurface>
            <WWPanel>
                <WWPanelTitle>Match History ({matches.length})</WWPanelTitle>
                {matches.length === 0 ? (
                    <WWEmpty>ยังไม่มีแมตช์ที่บันทึกไว้ — กด “บันทึกลงประวัติ” ที่หน้าสรุปผลเมื่อจบแมตช์</WWEmpty>
                ) : (
                    <Scroll>
                        <Table>
                            <thead>
                                <tr>
                                    <th>วันที่</th>
                                    <th>ผู้เล่น</th>
                                    <th>สกอร์</th>
                                    <th>ผู้ชนะ</th>
                                    <th>สถานะ</th>
                                    <th>ครั้งที่ตี</th>
                                    <th>แพ้ทั้งคู่</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match) => (
                                    <tr key={match.matchId}>
                                        <td>{formatDateTime(match.createdAt)}</td>
                                        <td>
                                            <span style={{ color: wwTheme.p1 }}>{match.playerNames[0]}</span>
                                            <span style={{ color: wwTheme.textDim }}> vs </span>
                                            <span style={{ color: wwTheme.p2 }}>{match.playerNames[1]}</span>
                                        </td>
                                        <td>
                                            {match.scoreP1} : {match.scoreP2}
                                        </td>
                                        <td>{winnerLabel(match)}</td>
                                        <td>{PHASE_LABELS[match.phase]}</td>
                                        <td>{match.battleLog.length}</td>
                                        <td>{countBossesFailedByBoth(match) || "—"} </td>
                                        <td>
                                            <WWButton type="button" tone="ghost" onClick={() => remove(match)}>
                                                ลบ
                                            </WWButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Scroll>
                )}
            </WWPanel>
        </WWSurface>
    );
};
