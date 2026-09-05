import { ChokEmpty, ChokIconButton } from "../chok.styles";
import {
    MatchDataType,
    MatchFilterPayload,
    TIED,
    loadMatchesWithFilterAsync,
    updateMatchAsync,
    updateMatchProgress,
} from "../../../services/matchService.ts";
import { PlayerProfile, loadProfileMap } from "../../../services/profileService.ts";
import styled, { keyframes } from "styled-components";
import { useEffect, useRef, useState } from "react";

import { applyScoreChange } from "../../../helpers/chokScore.ts";

import IconComplete from "../../../assets/icon-flag.png";
import IconPunchAura from "../../../assets/punch-aura.png";
import IconPunchLeft from "../../../assets/punch-left-red.png";
import IconPunchRight from "../../../assets/punch-right-blue.png";
import { MatchCard } from "../components/MatchCard.tsx";

const DashboardList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const EmptyState = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const EmptyArt = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 420px;
    /* The punches animate 70px sideways from a 4% inset — on a phone that lands
       outside the box and would give the whole page a horizontal scrollbar. */
    overflow: hidden;
`;

const punchLeftAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(-40px); }
  100% { transform: translateX(0); }
`;

const punchRightAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(40px); }
  100% { transform: translateX(0); }
`;

const auraPulse = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.18); }
  70% { transform: scale(1.18); }
  100% { transform: scale(1); }
`;

const PunchLeft = styled.img`
    position: absolute;
    left: 4%;
    z-index: 2;
    width: clamp(64px, 22vw, 120px);
    animation: ${punchLeftAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

const PunchRight = styled.img`
    position: absolute;
    right: 4%;
    z-index: 2;
    width: clamp(64px, 22vw, 120px);
    animation: ${punchRightAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

const Aura = styled.img`
    width: clamp(220px, 70vw, 368px);
    animation: ${auraPulse} 2s ease-in-out infinite;
`;

const punchFightLeft = keyframes`
  0%   { left: 50%; transform: translate(-50%,-50%); top: 50%; }
  30%  { left: -120px; transform: translateY(-50%); top: 50%; }
  70%  { left: -120px; transform: translateY(-50%); top: 50%; }
  100% { left: 50%; transform: translate(-50%,-50%); top: 50%; }
`;

const punchFightRight = keyframes`
  0%   { right: 50%; transform: translate(50%,-50%); top: 50%; }
  30%  { right: -120px; transform: translateY(-50%); top: 50%; }
  70%  { right: -120px; transform: translateY(-50%); top: 50%; }
  100% { right: 50%; transform: translate(50%,-50%); top: 50%; }
`;

const FightPunchLeft = styled.img`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: clamp(160px, 40vw, 288px);
    animation: ${punchFightLeft} 1s forwards;
    pointer-events: none;
`;

const FightPunchRight = styled.img`
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    z-index: 10;
    width: clamp(160px, 40vw, 288px);
    animation: ${punchFightRight} 1s forwards;
    pointer-events: none;
`;

/** แมตช์ที่ยังไม่จบ ใหม่สุดอยู่บน — ใช้ชุดเดียวกันทั้งตอนเปิดหน้าและตอนโหลดซ้ำ
    ไม่งั้นพอจบแมตช์หนึ่งใบ ลำดับการ์ดทั้งหน้าจะพลิกกลับไปเป็นลำดับที่สร้าง */
const DASHBOARD_FILTER: MatchFilterPayload = {
    finished: false,
    orderBy: "createDate",
    orderDirection: "desc",
};

export const MudmueDashboard = () => {
    const [data, setData] = useState<MatchDataType[]>();
    const [fightingMatchIds, setFightingMatchIds] = useState<number[]>([]);
    const [completingIds, setCompletingIds] = useState<number[]>([]);
    const [profileMap, setProfileMap] = useState<Record<string, PlayerProfile>>({});
    /** กันกดจบแมตช์รัวใน tick เดียวกัน — state ยังไม่ทัน re-render ระหว่างสองคลิก */
    const completingRef = useRef<Set<number>>(new Set());

    const handleScoreChange = (id: number, team: "blue" | "red", score: number) => {
        const match = data?.find((item) => item.id === id);
        if (!match) return;

        const { player, serviceSide } = applyScoreChange(match, team, score);
        setData((prevData) =>
            prevData?.map((item) => (item.id === id ? { ...item, player, serviceSide } : item))
        );
        /* เขียนลง storage ทันที — คนคุมคะแนนยืนอยู่ข้างสนาม สลับไปตอบไลน์แล้วกลับมาต้องเห็นเลขเดิม */
        updateMatchProgress(id, player, serviceSide);
    };

    // NOTE: Phase 2 — edit match handlers will be added here

    const handleClickCompleteMatch = async (id: number) => {
        const match = data?.find((d) => d.id === id);
        if (!match || completingRef.current.has(id)) return;
        completingRef.current.add(id);
        setCompletingIds((prev) => [...prev, id]);

        const redScore = match.player.find((p) => p.team === "red")?.score ?? 0;
        const blueScore = match.player.find((p) => p.team === "blue")?.score ?? 0;

        let winner: string = TIED;
        if (redScore > blueScore) winner = "red";
        else if (blueScore > redScore) winner = "blue";

        await updateMatchAsync(id, match.player, match.serviceSide!, winner);
        setFightingMatchIds((prev) => [...prev, id]);

        setTimeout(async () => {
            setFightingMatchIds((prev) => prev.filter((_id) => _id !== id));
            const updated = await loadMatchesWithFilterAsync(DASHBOARD_FILTER);
            setData(updated);
            completingRef.current.delete(id);
            setCompletingIds((prev) => prev.filter((_id) => _id !== id));
        }, 1000);
    };

    useEffect(() => {
        let mounted = true;
        setProfileMap(loadProfileMap());
        loadMatchesWithFilterAsync(DASHBOARD_FILTER).then((result) => {
            if (mounted) setData(result);
        });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <DashboardList>
            {data?.length === 0 ? (
                <EmptyState>
                    <ChokEmpty>ยังไม่มีแมตช์ที่กำลังแข่ง — ไปสุ่มคู่ที่หน้า Matchmaker</ChokEmpty>
                    <EmptyArt>
                        <PunchLeft src={IconPunchLeft} alt="" />
                        <Aura src={IconPunchAura} alt="" />
                        <PunchRight src={IconPunchRight} alt="" />
                    </EmptyArt>
                </EmptyState>
            ) : (
                data?.map((d) => (
                    <MatchCard
                        key={d.id}
                        match={d}
                        profileMap={profileMap}
                        onScoreChange={(team, score) => handleScoreChange(d.id, team, score)}
                        actions={
                            <ChokIconButton
                                type="button"
                                title="จบแมตช์นี้"
                                aria-label="จบแมตช์นี้"
                                disabled={completingIds.includes(d.id)}
                                onClick={() => handleClickCompleteMatch(d.id)}
                            >
                                <img src={IconComplete} alt="" />
                            </ChokIconButton>
                        }
                        overlay={
                            fightingMatchIds.includes(d.id) ? (
                                <>
                                    <FightPunchLeft src={IconPunchLeft} alt="" />
                                    <FightPunchRight src={IconPunchRight} alt="" />
                                </>
                            ) : null
                        }
                    />
                ))
            )}
        </DashboardList>
    );
};
