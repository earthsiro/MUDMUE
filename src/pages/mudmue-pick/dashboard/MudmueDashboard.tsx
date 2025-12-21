import { MatchDataType, PlayerDataType, loadMatchesWithFilter, updateMatch } from "../../../services/matchService.ts";
import { getDetailProfile, getDetailProfileByField } from "../../../services/profileService.ts";
import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";

import IconComplete from "../../../assets/icon-flag.png";
import IconPunchAura from "../../../assets/punch-aura.png";
import IconPunchLeft from "../../../assets/punch-left-red.png";
import IconPunchRight from "../../../assets/punch-right-blue.png";
import IconShuttleCockBlue from "../../../assets/icon-shuttlecock-blue.png";
import IconShuttleCockRed from "../../../assets/icon-shuttlecock-red.png";
import { ScoreStepper } from "./components/ScoreStepper.tsx";
import { VSLabel } from "../components/VSLabel.tsx";

const breakpoints = {
    tablet: 900,
    mobile: 600,
};

const MudmueDashboardListContainer = styled.div`
    width: 100%;
    max-height: 840px;
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
const MudmueDashboardFilterContainer = styled.div`
    width: 100%;
    display: flex;
    margin-bottom: 16px;
    justify-content: space-between;
`;
const MudmueDashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const punchLeftAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(-40px); }
  100% { transform: translateX(0); }
`;

const PunchLeft = styled.img`
    position: absolute;
    left: 20%;
    z-index: 2;
    animation: ${punchLeftAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

// หมัดขวา เลื่อนไป-กลับ และชนกัน (กลับด้านทิศ)
const punchRightAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(40px); }
  100% { transform: translateX(0); }
`;

const PunchRight = styled.img`
    position: absolute;
    right: 20%;
    z-index: 2;
    animation: ${punchRightAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

const auraPulse = keyframes`
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.18);
  }
  70% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
`;

const Aura = styled.img`
    animation: ${auraPulse} 2s ease-in-out infinite;
    display: block;
    margin: 0 auto;
`;

const MatchItemDiv = styled.div<{ isDeleted?: boolean }>`
    // opacity: ${({ isDeleted }) => (isDeleted ? 0 : 1)};
    // transition: opacity 0.5s ease;
    // width: 100%;
    // padding-x: 8rem;
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
    width: 100%;
    padding-x: 8rem;
`;
const punchFightLeft = keyframes`
  0%   { left: 50%; transform: translate(-50%,-50%) scaleX(1); top:50%;} /* เริ่มตรงกลาง หันหลัง */
  30%  { left: -120px; transform: translateY(-50%) scaleX(1); top:50%; }                /* ถอยไปซ้ายสุด */
  70%  { left: -120px; transform: translateY(-50%) scaleX(1); top:50%; }                /* ค้างซ้ายสุด */
  100% { left: 50%; transform: translate(-50%,-50%) scaleX(1); top:50%;}   /* กลับเข้ามาชนกลาง หันหน้า */
`;
const punchFightRight = keyframes`
  0%   { right: 50%; transform: translate(50%,-50%) scaleX(1); top:50%;}   /* เริ่มตรงกลาง หันหน้า */
  30%  { right: -120px; transform:translateY(-50%) scaleX(1); top:50%; }                /* ถอยไปขวาสุด */
  70%  { right: -120px; transform:translateY(-50%) scaleX(1); top:50%; }                /* ค้างขวาสุด */
  100% { right: 50%; transform: translate(50%,-50%) scaleX(1);  top:50%;}  /* กลับเข้ามาชนกลาง หันหลัง */
`;
const FightPunchLeft = styled.img`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%) scaleX(1);
    z-index: 10;
    width: 288px;
    height: 288px;
    animation: ${punchFightLeft} 1s forwards;
    pointer-events: none;
`;
const FightPunchRight = styled.img`
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translateY(50%) translateX(50%) scaleX(1);
    z-index: 10;
    width: 288px;
    height: 288px;
    animation: ${punchFightRight} 1s forwards;
    pointer-events: none;
`;
export const MudmueDashboard = () => {
    const [data, setData] = useState<MatchDataType[]>();
    const [currentEditData] = useState<MatchDataType[]>([]);
    const [fightingMatchIds, setFightingMatchIds] = useState<number[]>([]);

    const resolveIsEdit = (id: number) => currentEditData.some((m) => m.id === id);
    const matchToRender = (d: MatchDataType) => (resolveIsEdit(d.id) ? currentEditData.find((m) => m.id === d.id) : d);

    const resolvePlayerLabelLeftSide = (players: PlayerDataType[]) => {
        // return players.filter((player) => player.team === "red").sort((a, b) => a.position - b.position);
        return players.filter((player) => player.team === "red").sort((a, b) => a.position - b.position);
    };
    const resolvePlayerLabelRightSide = (players: PlayerDataType[]) => {
        // return players.filter((player) => player.team === "blue").sort((a, b) => a.position - b.position);
        return players.filter((player) => player.team === "blue").sort((a, b) => a.position - b.position);
    };
    const handleScoreChange = (id: number, team: "blue" | "red", score: number) => {
        setData((prevData) =>
            prevData?.map((match) => {
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

    const handleClickCompleteMatch = (id: number) => {
        const match = data?.find((d) => d.id === id);
        if (!match) return;
        console.log("Completing match id:", id);
        console.log("Match data:", match);

        // รวมคะแนนแต่ละทีม
        const redScore = match.player.filter((p) => p.team === "red")[0].score ?? 0;
        const blueScore = match.player.filter((p) => p.team === "blue")[0].score ?? 0;

        // หาผู้ชนะ
        let winner: string = "tiled";
        if (redScore > blueScore) winner = "red";
        else if (blueScore > redScore) winner = "blue";
        console.log("Winner:", winner);
        // เซฟลง localStorage/history service
        updateMatch(id, match.player, match.serviceSide!, winner);
        // setData(updatedData);
        setFightingMatchIds((prev) => [...prev, id]);

        // 2. หลังจาก fade-out (ระยะเวลาเช่น 500ms) ค่อย update list โดยโหลด filter ใหม่
        setTimeout(() => {
            setFightingMatchIds((prev) => prev.filter((_id) => _id !== id));
            setData(loadMatchesWithFilter({ finished: false }));
        }, 1000);
    };

    useEffect(() => {
        setData(loadMatchesWithFilter({ finished: false, orderBy: "createDate", orderDirection: "desc" }));
    }, []);
    return (
        <MudmueDashboardContainer>
            <MudmueDashboardFilterContainer>
                <div className="flex flex-row gap-4">
                    {/* <MudmueButton
                        size="small"
                        theme="secondary"
                        onClick={() => {
                            setData([]);
                        }}
                    >
                        test reset data
                    </MudmueButton>
                    <MudmueButton
                        size="small"
                        onClick={() => {
                            setData(getMockMatches());
                        }}
                    >
                        test add mock data
                    </MudmueButton> */}
                </div>
                <div className="flex flex-row gap-4">
                    {/* <button className="btn btn-circle font-noto " onClick={() => {}}>
                        <img
                            src={IconMudVsMud}
                            alt="random-player"
                            width={46}
                            height={46}
                        />
                        random
                    </button> */}
                    {/* <button className="btn btn-circle font-noto " onClick={() => {}}>
                        <img src={IconPlusBlue} alt="add-player" />
                    </button> */}{" "}
                    {/* NOTE: wait for phase 2 edit match */}
                </div>
            </MudmueDashboardFilterContainer>
            {/* <div className="w-[90%] h-[1px] bg-[#0000ff] my-4"></div> Note: wait for phase 2 edit match */}
            <MudmueDashboardListContainer>
                {data?.length === 0 ? (
                    <div className="w-full h-[840px] flex items-center justify-center flex-col gap-2">
                        <div className="font-noto text-[20px] mt-4">No matches available.</div>
                        <div className="flex flex-row items-center justify-center gap-8 relative">
                            <PunchLeft src={IconPunchLeft} alt="no-match-1" style={{ width: 120, height: 120 }} />
                            <Aura src={IconPunchAura} alt="no-match-2" style={{ width: 368, height: 416 }} />
                            <PunchRight src={IconPunchRight} alt="no-match-3" style={{ width: 120, height: 120 }} />
                        </div>
                    </div>
                ) : (
                    <>
                        {data?.map((d) => (
                            <MatchItemDiv key={d.id} style={{ position: "relative" }}>
                                <div className="card w-full bg-base-100 shadow-lg sm:px-0 md:px-2">
                                    <PlayerCardContainer>
                                        <div className="flex flex-row justify-end items-center w-[200px] lg:w-[360px] gap-4 lg:justify-between">
                                            {/* {d.player.length ? `${d.player.find((p) => p.team === "blue")!.score}` : "-"} */}
                                            {currentEditData.find((match) => match.id === d.id) ? (
                                                <div></div>
                                            ) : (
                                                <ScoreStepper
                                                    team="red"
                                                    score={d.player.find((p) => p.team === "red")!.score}
                                                    callback={(s) => handleScoreChange(d.id, "red", s)}
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
                                                            <div
                                                                key={p.name}
                                                                className="w-full font-noto text-[28px] text-right"
                                                            >
                                                                {getDetailProfile(p.uuid)?.displayName ? (
                                                                    <span>
                                                                        {getDetailProfileByField(p.uuid, "displayName")}
                                                                        &nbsp;
                                                                        <span className="text-[12px]">({p.name})</span>
                                                                    </span>
                                                                ) : (
                                                                    p.name
                                                                )}
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
                                                            <div
                                                                key={p.name}
                                                                className="w-full font-noto text-[28px] text-left"
                                                            >
                                                                {getDetailProfile(p.uuid)?.displayName ? (
                                                                    <span>
                                                                        {getDetailProfileByField(p.uuid, "displayName")}
                                                                        &nbsp;
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
                                            {/* {d.player.length ? `${d.player.find((p) => p.team === "red")!.score}` : "-"} */}
                                            {currentEditData.find((match) => match.id === d.id) ? (
                                                <div></div>
                                            ) : (
                                                <ScoreStepper
                                                    team="blue"
                                                    score={d.player.find((p) => p.team === "blue")!.score}
                                                    callback={(s) => handleScoreChange(d.id, "blue", s)}
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
                                                src={IconComplete}
                                                alt="complete-match"
                                                className="cursor-pointer"
                                                title="Complete Match"
                                                onClick={() => handleClickCompleteMatch(d.id)}
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                        {fightingMatchIds.includes(d.id) && (
                                            <>
                                                <FightPunchLeft src={IconPunchLeft} alt="" />
                                                <FightPunchRight src={IconPunchRight} alt="" />
                                            </>
                                        )}
                                    </PlayerCardContainer>
                                </div>
                            </MatchItemDiv>
                        ))}
                    </>
                )}
            </MudmueDashboardListContainer>
        </MudmueDashboardContainer>
    );
};
