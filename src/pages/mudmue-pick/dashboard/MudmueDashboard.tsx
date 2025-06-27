import MockData, { DashboardDataType, PlayerDataType } from "./mockDashboardData.ts";
import React, { useState } from "react";

import IconShuttleCockBlue from "../../../assets/icon-shuttlecock-blue.png";
import IconShuttleCockRed from "../../../assets/icon-shuttlecock-red.png";
import { ScoreStepper } from "./components/ScoreStepper.tsx";
import { VSLabel } from "../components/VSLabel.tsx";
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
`;
const PlayerCardContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 64px;
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
export const MudmueDashboard = () => {
    const [data, setData] = useState<DashboardDataType[]>(MockData);

    const resolvePlayerLabelLeftSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "red").sort((a, b) => a.position - b.position);
    };
    const resolvePlayerLabelRightSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "blue").sort((a, b) => a.position - b.position);
    };
    const handleScoreChange = (id: number, team: "blue" | "red", score: number) => {
        setData((prevData) =>
            prevData.map((match) => {
                if (match.id !== id) return match;

                // อัปเดตคะแนน
                const updatedPlayers = match.player.map((player) =>
                    player.team === team ? { ...player, score } : player
                );

                let newPlayers = [...updatedPlayers];
                let newServiceSide = match.serviceSide;

                if (team === match.serviceSide) {
                    // สลับตำแหน่งผู้เล่นในทีมเดียวกัน
                    newPlayers = newPlayers.map((player) => {
                        if (player.team !== team) return player;
                        return {
                            ...player,
                            position: player.position === 0 ? 1 : 0,
                        };
                    });
                } else {
                    // เปลี่ยนฝั่งเสิร์ฟ
                    newServiceSide = team;
                }

                return {
                    ...match,
                    player: newPlayers,
                    serviceSide: newServiceSide,
                };
            })
        );
    };
    const resolveDisplayScoreIcon = (
        type: "single" | "duo",
        score: number,
        index: number,
        team: "blue" | "red"
    ): boolean => {
        if (type === "single") {
            return true;
        }

        // type === "duo"
        const isEven = score % 2 === 0;

        const shouldServeIndex = isEven ? 0 : 1;

        // ฝั่ง blue เสิร์ฟตรง index เลย
        if (team === "blue") {
            return index === shouldServeIndex;
        }

        // ฝั่ง red เสิร์ฟตรงข้าม index
        return index !== shouldServeIndex;
    };
    return (
        <DashboardContainer>
            {data.map((d) => (
                <div key={d.id}>
                    <div className="card w-[90%] bg-base-100 card-sm shadow-lg">
                        <PlayerCardContainer>
                            <div className="flex flex-row justify-end items-center w-[200px] lg:w-[320px] gap-4">
                                {/* {d.player.length ? `${d.player.find((p) => p.team === "blue")!.score}` : "-"} */}
                                <ScoreStepper
                                    team="red"
                                    score={d.player.find((p) => p.team === "red")!.score}
                                    callback={(s) => handleScoreChange(d.id, "red", s)}
                                />
                                <PlayerCardDisplay>
                                    {resolvePlayerLabelLeftSide(d.player).map((p: PlayerDataType, index: number) => (
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
                                                {p.name}
                                            </div>
                                            {d.serviceSide === "red" &&
                                                resolveDisplayScoreIcon(
                                                    d.player.length === 2 ? "single" : "duo",
                                                    d.player.find((p) => p.team === "red")!.score,
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
                                    ))}
                                </PlayerCardDisplay>
                            </div>
                            <VSLabel />
                            <div className="flex flex-row justify-start items-center w-[200px] lg:w-[320px] gap-4">
                                <PlayerCardDisplay>
                                    {resolvePlayerLabelRightSide(d.player).map((p: PlayerDataType, index: number) => (
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
                                                    d.player.find((p) => p.team === "blue")!.score,
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
                                                {p.name}
                                            </div>
                                        </div>
                                    ))}
                                </PlayerCardDisplay>
                                {/* {d.player.length ? `${d.player.find((p) => p.team === "red")!.score}` : "-"} */}
                                <ScoreStepper
                                    team="blue"
                                    score={d.player.find((p) => p.team === "blue")!.score}
                                    callback={(s) => handleScoreChange(d.id, "blue", s)}
                                />
                            </div>
                        </PlayerCardContainer>
                    </div>
                </div>
            ))}
        </DashboardContainer>
    );
};
