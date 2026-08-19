import { ChokEmpty, ChokIconButton } from "../chok.styles";
import { MatchDataType, createMatchAsync, loadMatchesWithFilterAsync } from "../../../services/matchService.ts";
import { PlayerProfile, loadProfileMap } from "../../../services/profileService.ts";
import { useEffect, useState } from "react";

import IconReplay from "../../../assets/icon-replay.png";
import { MatchCard } from "../components/MatchCard.tsx";
import styled from "styled-components";

const HistoryList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const MudmueHistory = () => {
    const [data, setData] = useState<MatchDataType[]>();
    const [toast, setToast] = useState<string | null>(null);
    const [profileMap, setProfileMap] = useState<Record<string, PlayerProfile>>({});

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleRematch = async (oldMatch: MatchDataType) => {
        const players = oldMatch.player.map((p, idx) => ({
            ...p,
            score: 0,
            position: p.position ?? idx,
        }));
        const serviceSide = Math.random() < 0.5 ? "red" : "blue";
        await createMatchAsync(players, serviceSide);
        const updated = await loadMatchesWithFilterAsync({
            finished: true,
            orderBy: "updateDate",
            orderDirection: "desc",
        });
        setData(updated);
        showToast("สร้างแมตช์ใหม่ใน Dashboard เรียบร้อยแล้ว!");
    };

    // NOTE: Phase 2 — edit match handlers will be added here

    useEffect(() => {
        let mounted = true;
        setProfileMap(loadProfileMap());
        loadMatchesWithFilterAsync({ finished: true, orderBy: "updateDate", orderDirection: "desc" }).then((result) => {
            if (mounted) setData(result);
        });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <HistoryList>
            {toast && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-success font-noto">
                        <span>{toast}</span>
                    </div>
                </div>
            )}

            {(!data || data.length === 0) && <ChokEmpty>ยังไม่มีประวัติการแข่งขัน</ChokEmpty>}

            {data?.map((d) => (
                <MatchCard
                    key={d.id}
                    match={d}
                    profileMap={profileMap}
                    readOnly
                    actions={
                        <ChokIconButton
                            type="button"
                            title="แข่งใหม่ด้วยผู้เล่นชุดนี้"
                            aria-label="แข่งใหม่ด้วยผู้เล่นชุดนี้"
                            onClick={() => handleRematch(d)}
                        >
                            <img src={IconReplay} alt="" />
                        </ChokIconButton>
                    }
                />
            ))}
        </HistoryList>
    );
};
