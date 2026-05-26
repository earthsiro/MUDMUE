import {
    MatchDataType,
    PlayerDataType,
    createMatchAsync,
    loadMatchesWithFilterAsync,
} from "../../../services/matchService.ts";
import { getDetailProfile, getDetailProfileByField } from "../../../services/profileService.ts";
import { useEffect, useState } from "react";

import IconReplay from "../../../assets/icon-replay.png";
import IconShuttleCockBlue from "../../../assets/icon-shuttlecock-blue.png";
import IconShuttleCockRed from "../../../assets/icon-shuttlecock-red.png";
import { ScoreStepper } from "../dashboard/components/ScoreStepper.tsx";
import { VSLabel } from "../components/VSLabel.tsx";
import { breakpoints } from "../../../styles/breakpoints.ts";
import styled from "styled-components";

const DashboardContainer = styled.div`
    width: 100%;
    max-height: 720px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    padding-bottom: 32px;
    @media (max-width: ${breakpoints.tablet}px) {
        height: 100%;
        max-height: none;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        height: 100%;
        max-height: none;
    }
`;
const PlayerCardContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 64px;
    position: relative;
`;
const PlayerCardDisplay = styled.div`
    display: flex;
    flex-direction: column;
`;
const ServiceSideLeftIcon = styled.img`
    position: absolute;
    top: 50%;
    right: -10px;
    transform: translate(75%, 25%);
`;
const ServiceSideRightIcon = styled.img`
    position: absolute;
    top: 50%;
    left: -10px;
    transform: translate(-75%, 25%);
`;

export const MudmueHistory = () => {
    const [data, setData] = useState<MatchDataType[]>();
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const matchToRender = (d: MatchDataType) => d;

    const resolvePlayerLabelLeftSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "red").sort((a, b) => a.position - b.position);
    };
    const resolvePlayerLabelRightSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "blue").sort((a, b) => a.position - b.position);
    };
    const handleRematch = async (oldMatch: MatchDataType) => {
        const players = oldMatch.player.map((p, idx) => ({
            ...p,
            score: 0,
            position: p.position ?? idx,
        }));
        const serviceSide = Math.random() < 0.5 ? "red" : "blue";
        await createMatchAsync(players, serviceSide);
        const updated = await loadMatchesWithFilterAsync({ finished: true, orderBy: "updateDate", orderDirection: "desc" });
        setData(updated);
        showToast("สร้างแมตช์ใหม่ใน Dashboard เรียบร้อยแล้ว!");
    };

    const resolveDisplayScoreIcon = (
        type: "single" | "duo",
        score: number,
        index: number,
        team: "blue" | "red"
    ): boolean => {
        if (type === "single") return true;
        const isEven = score % 2 === 0;
        const shouldServeIndex = isEven ? 0 : 1;
        if (team === "blue") return index === shouldServeIndex;
        return index !== shouldServeIndex;
    };

    // NOTE: Phase 2 — edit match handlers will be added here

    useEffect(() => {
        let mounted = true;
        loadMatchesWithFilterAsync({ finished: true, orderBy: "updateDate", orderDirection: "desc" }).then((result) => {
            if (mounted) setData(result);
        });
        return () => { mounted = false; };
    }, []);
    return (
        <DashboardContainer>
            {toast && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-success font-noto">
                        <span>{toast}</span>
                    </div>
                </div>
            )}
            {(!data || data.length === 0) && (
                <div className="w-full flex items-center justify-center py-16">
                    <p className="font-noto text-[20px] text-gray-400">ยังไม่มีประวัติการแข่งขัน</p>
                </div>
            )}
            {data?.map((d) => (
                <div key={d.id} className="w-full px-16">
                    <div className="card w-full bg-base-100 shadow-lg sm:px-0 md:px-2 h-[182px]">
                        <PlayerCardContainer>
                            <div className="flex flex-row justify-end items-center w-[200px] lg:w-[360px] gap-4 lg:justify-between relative">
                                {/* TrophyLeftContainer reserved for Phase 2 */}
                                <ScoreStepper
                                    className="z-[1]"
                                    team="red"
                                    score={d.player.find((p: PlayerDataType) => p.team === "red")!.score}
                                    callback={() => {}}
                                    showTrophy={d.winner === "red"}
                                    isDisplay
                                />
                                <PlayerCardDisplay>
                                    {resolvePlayerLabelLeftSide(matchToRender(d)!.player).map(
                                        (p: PlayerDataType, index: number) => (
                                            <div
                                                key={`${p.name}-${index}`}
                                                className={`relative py-2 px-4 ${
                                                    d.player.length > 2 && p.position === 0
                                                        ? "border-r-2 border-b-[1px]"
                                                        : ""
                                                } ${
                                                    d.player.length > 2 && p.position === 1
                                                        ? "border-r-2 border-t-[1px]"
                                                        : ""
                                                } border-[#0000ff]/20`}
                                            >
                                                <div key={p.name} className="w-full font-noto text-[28px] text-right">
                                                    {getDetailProfile(p.uuid)?.displayName ? (
                                                        <span>
                                                            {getDetailProfileByField(p.uuid, "displayName")}&nbsp;
                                                            <span className="text-[12px]">({p.name})</span>
                                                        </span>
                                                    ) : (
                                                        p.name
                                                    )}
                                                </div>
                                                {d.serviceSide === "red" &&
                                                    resolveDisplayScoreIcon(
                                                        d.player.length === 2 ? "single" : "duo",
                                                        d.player.find((p: PlayerDataType) => p.team === "red")!.score,
                                                        index,
                                                        "red"
                                                    ) && (
                                                        <ServiceSideLeftIcon
                                                            src={IconShuttleCockRed}
                                                            alt="service-red"
                                                            width={24}
                                                            height={24}
                                                        ></ServiceSideLeftIcon>
                                                    )}
                                            </div>
                                        )
                                    )}
                                </PlayerCardDisplay>
                            </div>
                            <VSLabel />
                            <div className="flex flex-row justify-start items-center w-[200px] lg:w-[320px] gap-4 lg:justify-between">
                                <PlayerCardDisplay>
                                    {resolvePlayerLabelRightSide(matchToRender(d)!.player).map(
                                        (p: PlayerDataType, index: number) => (
                                            <div
                                                key={`${p.name}-${index}`}
                                                className={`relative py-2 px-4 ${
                                                    d.player.length > 2 && p.position === 0
                                                        ? "border-l-2 border-b-[1px]"
                                                        : ""
                                                } ${
                                                    d.player.length > 2 && p.position === 1
                                                        ? "border-l-2 border-t-[1px]"
                                                        : ""
                                                } border-[#0000ff]/20`}
                                            >
                                                {d.serviceSide === "blue" &&
                                                    resolveDisplayScoreIcon(
                                                        d.player.length === 2 ? "single" : "duo",
                                                        d.player.find((p: PlayerDataType) => p.team === "blue")!.score,
                                                        index,
                                                        "blue"
                                                    ) && (
                                                        <ServiceSideRightIcon
                                                            src={IconShuttleCockBlue}
                                                            alt="service-blue"
                                                            width={24}
                                                            height={24}
                                                        ></ServiceSideRightIcon>
                                                    )}
                                                <div key={p.name} className="w-full font-noto text-[28px] text-left">
                                                    {getDetailProfile(p.uuid)?.displayName ? (
                                                        <span>
                                                            {getDetailProfileByField(p.uuid, "displayName")}&nbsp;
                                                            <span className="text-[12px]">({p.name})</span>
                                                        </span>
                                                    ) : (
                                                        p.name
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </PlayerCardDisplay>
                                {/* TrophyRightContainer reserved for Phase 2 */}
                                <ScoreStepper
                                    team="blue"
                                    score={d.player.find((p: PlayerDataType) => p.team === "blue")!.score}
                                    callback={() => {}}
                                    isDisplay
                                    showTrophy={d.winner === "blue"}
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 h-full flex flex-col items-end gap-4">
                                {/* NOTE: Phase 2 — edit match icon will go here */}
                                {/* NOTE  : Phase 2 edit available */}
                                <img
                                    src={IconReplay}
                                    alt="replay-match"
                                    className="cursor-pointer"
                                    title="Replay Match"
                                    onClick={() => handleRematch(d)}
                                    width={32}
                                    height={32}
                                />
                            </div>
                        </PlayerCardContainer>
                    </div>
                </div>
            ))}
        </DashboardContainer>
    );
};
