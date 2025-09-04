import MockData, { HistoryDataType, PlayerDataType } from "./mockDashboardData.ts";
import React, { useState } from "react";

import IconReplay from "../../../assets/icon-replay.png";
import IconShuttleCockBlue from "../../../assets/icon-shuttlecock-blue.png";
import IconShuttleCockRed from "../../../assets/icon-shuttlecock-red.png";
import { ScoreStepper } from "../dashboard/components/ScoreStepper.tsx";
import { VSLabel } from "../components/VSLabel.tsx";
import styled from "styled-components";

const breakpoints = {
    tablet: 900,
    mobile: 600,
};

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
    const [data, setData] = useState<HistoryDataType[]>(MockData);
    const [currentEditData, setCurrentEditData] = useState<HistoryDataType[]>([]);

    const resolveIsEdit = (id: number) => currentEditData.some((m) => m.id === id);
    const matchToRender = (d: HistoryDataType) =>
        resolveIsEdit(d.id) ? currentEditData.find((m) => m.id === d.id) : d;

    const resolvePlayerLabelLeftSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "red").sort((a, b) => a.position - b.position);
    };
    const resolvePlayerLabelRightSide = (players: PlayerDataType[]) => {
        return players.filter((player) => player.team === "blue").sort((a, b) => a.position - b.position);
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
    const handleReplayMatch = (id: number) => {
        alert(`Replay match id: ${id}`);
    }
    // const handleClickEdit = (id: number) => {
    //     const matchData = data.find((d) => d.id === id);
    //     if (matchData) {
    //         setCurrentEditData([...currentEditData, matchData]);
    //         // เปิด modal หรือทำอย่างอื่นเพื่อแก้ไขข้อมูล
    //         console.log("Editing match data:", matchData);
    //     }
    // };
    // const handleClickSaveEdit = (id: number) => {
    //     const editMatch = currentEditData.find((m) => m.id === id);
    //     if (editMatch) {
    //         setData((prevData) => prevData.map((d) => (d.id === id ? editMatch : d)));
    //         setCurrentEditData((prev) => prev.filter((m) => m.id !== id));
    //     }
    // };
    // const handleClickCancelEdit = (id: number) => {
    //     setCurrentEditData((prev) => prev.filter((m) => m.id !== id));
    // }; // NOTE : Phase 2 edit available

    return (
        <DashboardContainer>
            {data.map((d) => (
                <div key={d.id} className="w-full px-16">
                    <div className="card w-full bg-base-100 shadow-lg sm:px-0 md:px-2">
                        <PlayerCardContainer>
                            <div className="flex flex-row justify-end items-center w-[200px] lg:w-[320px] gap-4 lg:justify-between">
                                {/* {d.player.length ? `${d.player.find((p) => p.team === "blue")!.score}` : "-"} */}
                                {currentEditData.find((match) => match.id === d.id) ? (
                                    <div></div>
                                ) : (
                                    <ScoreStepper
                                        team="red"
                                        score={d.player.find((p) => p.team === "red")!.score}
                                        callback={() => {}}
                                        isDisplay
                                    />
                                )}

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
                                        )
                                    )}
                                </PlayerCardDisplay>
                                {/* {d.player.length ? `${d.player.find((p) => p.team === "red")!.score}` : "-"} */}
                                {currentEditData.find((match) => match.id === d.id) ? (
                                    <div></div>
                                ) : (
                                    <ScoreStepper
                                        team="blue"
                                        score={d.player.find((p) => p.team === "blue")!.score}
                                        callback={() => {}}
                                        isDisplay
                                    />
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 h-full flex flex-col items-end gap-4">
                                {/* {currentEditData.some((match) => match.id === d.id) ? (
                                    <div className="flex flex-row gap-2">
                                        <img
                                            src={IconSave}
                                            alt="save-edit"
                                            className="cursor-pointer"
                                            title="Save"
                                            onClick={() => handleClickSaveEdit(d.id)}
                                            width={32}
                                            height={32}
                                        />
                                        <img
                                            src={IconCancel}
                                            alt="cancel-edit"
                                            className="cursor-pointer"
                                            title="Cancel"
                                            onClick={() => handleClickCancelEdit(d.id)}
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                ) : (
                                    <img
                                        src={IconEdit}
                                        alt="edit-icon"
                                        className="cursor-pointer"
                                        title="Edit Match"
                                        onClick={() => handleClickEdit(d.id)}
                                        width={32}
                                        height={32}
                                    />
                                )} */}{" "}
                                {/* NOTE  : Phase 2 edit available */}
                                <img
                                    src={IconReplay}
                                    alt="replay-match"
                                    className="cursor-pointer"
                                    title="Replay Match"
                                    onClick={()=> handleReplayMatch(d.id)}
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
