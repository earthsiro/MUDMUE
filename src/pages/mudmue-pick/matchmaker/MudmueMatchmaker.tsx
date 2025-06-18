import "./Roulette.css";
import "./Matchmaker.css";

import React, { useState } from "react";

import IconBin from "../../../assets/bin.svg";
import IconHide from "../../../assets/icon-hide.png";
import IconUnhide from "../../../assets/icon-unhide.png";
import { MudmueButton } from "../../../components/MudmueButton";
import { Roulette } from "./components/Roulette";
import styled from "styled-components";
import { useLoader } from "../../../components/Loader";

const MudmueMatchmakerContainer = styled.div`
    width: 100%;
    height: 100%;
    padding: 24px;
`;
const MudmueMatchmakerRouletteContainer = styled.div`
    width: 100%;
    // height: 80%;
`;
const MudmueMatchmakerPlayerContainer = styled.div`
    width: 100%;
    height: 200px;
    // height: 20%;
`;
const VLabel = styled.span`
    color: var(--color-primary);
    top: -4px;
    left: 0;
    position: absolute;
`;
const SLabel = styled.span`
    color: var(--color-secondary);
    bottom: -4px;
    right: 0;
    position: absolute;
`;
interface PlayerProps {
    id: number;
    name: string;
    hide: boolean;
}
interface RoundResultMatchmakerProps {
    id: number;
    players: PlayerProps[];
}
export const MudmueMatchmaker = () => {
    const { showLoader, hideLoader } = useLoader();
    const [players, setPlayers] = useState<PlayerProps[]>([
        { id: 0, name: "Player 1", hide: false },
        { id: 1, name: "Player 2", hide: false },
    ]);
    const [results, setResults] = useState<RoundResultMatchmakerProps[]>([]);
    const [spinning, setSpinning] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>("random");
    const [playerName, setPlayerName] = useState<string>("");
    const [option, setOption] = useState({
        playerAmount: 2,
        times: 1,
        skipAnimation: false,
        hideFromList: false,
    });
    const [isCloseResultModal, setIsCloseResultModal] = useState(false);
    const [isShowResultModal, setIsShowResultModal] = useState(false);

    const handleChangeMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        console.log("handleChange", { name, value, type, checked });
        // กำหนดชื่อ field ที่ต้องการแปลงเป็น number
        const numberFields = ["playerAmount", "times"];
        let newValue: string | number | boolean;
        if (type === "checkbox") {
            newValue = checked;
        } else if (type === "radio" || numberFields.includes(name)) {
            newValue = Number(value);
        } else {
            newValue = value;
        }
        setOption((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };
    const handleClickAddPlayer = (player: string) => {
        if (player.trim() === "") {
            alert("Please enter a player name.");
            return;
        }
        const playerObj: PlayerProps = { id: players.length, name: player, hide: false };
        setPlayers([...players, playerObj]);
        setPlayerName("");
    };
    const handleClickRemovePlayer = (p: PlayerProps) => {
        setPlayers((prevPlayers) => {
            const index = prevPlayers.indexOf(p);
            if (index !== -1) {
                const newPlayers = [...prevPlayers];
                newPlayers.splice(index, 1);
                return newPlayers;
            }
            return prevPlayers;
        });
    };
    const handleClickToggleHidePlayer = (p: PlayerProps) => {
        setPlayers((prevPlayers) => {
            return prevPlayers.map((player) => (player.id === p.id ? { ...player, hide: !player.hide } : player));
        });
    };
    const handleClickCloseResultModal = () => {
        setIsCloseResultModal(true);
        setResults([]);
        setIsShowResultModal(false);
        if (option.hideFromList) {
            // รวมชื่อ player ทั้งหมดที่อยู่ในผลลัพธ์
            const resultNames = results.flatMap((round) => round.players.map((p) => p.name));
            setPlayers((prevPlayers) =>
                prevPlayers.map((player) => (resultNames.includes(player.name) ? { ...player, hide: true } : player))
            );
        }
        (document.getElementById("match_result") as HTMLDialogElement).close();
    };
    const spin = () => {
        setIsCloseResultModal(false);
        const allResults: RoundResultMatchmakerProps[] = [];
        // สุ่มตามจำนวนรอบที่กำหนด
        for (let round = 0; round < option.times; round++) {
            const shuffledPlayers = players
                .filter((player) => !player.hide)
                .slice()
                .sort(() => Math.random() - 0.5)
                .slice(0, option.playerAmount);
            allResults.push({
                id: results.length + round + 1, // ให้ id ต่อเนื่องจากของเดิม
                players: shuffledPlayers,
            });
        }
        setResults((prev) => [...prev, ...allResults]);
        console.log("Spinning players:", option);
        if (!option.skipAnimation && option.times == 1) {
            setSpinning(true);
            console.log("Spinning results:", results);
            setTimeout(() => {
                setSpinning(false);
                setIsShowResultModal(true);
                (document.getElementById("match_result") as HTMLDialogElement).showModal();
            }, 4000);
        } else {
            showLoader();
            setTimeout(() => {
                hideLoader();
                setIsShowResultModal(true);
                (document.getElementById("match_result") as HTMLDialogElement).showModal();
            }, 1500);
        }
    };

    return (
        <MudmueMatchmakerContainer>
            <div className="w-full flex gap-4 items-center justify-start mb-4">
                <label htmlFor="team-select">Mode</label>
                <select
                    id="team-select"
                    value={selectedValue}
                    onChange={handleChangeMode}
                    className="border p-2 rounded"
                    disabled //have one mode
                >
                    <option value="">-- Please choose an option --</option>
                    <option value="random">Random</option>
                    <option value="rank">Rank</option>
                </select>
            </div>
            <MudmueMatchmakerRouletteContainer className="flex flex-col items-start justify-center h-[800px] mb-2 xl:flex-row xl:gap-6 xl:h-[456px] xl:mb-4">
                <div className="card lg:card-side card-border bg-base-100 w-full shadow-lg card-bg">
                    <div className=" w-full flex flex-col items-start justify-start xl:flex-row">
                        <div className="card lg:card-side card-border bg-base-100 w-96 h-full shadow-custom ">
                            <div className="card-body">
                                <div className="flex items-center justify-center gap-6 mb-6">
                                    <label className="mr-4 flex items-center justify-start gap-2">
                                        <input
                                            type="radio"
                                            name="playerAmount"
                                            value={2}
                                            checked={option.playerAmount === 2}
                                            onChange={handleChange}
                                        />
                                        2 Player
                                    </label>
                                    <label className="mr-4 flex items-center justify-start gap-2">
                                        <input
                                            type="radio"
                                            name="playerAmount"
                                            value={4}
                                            checked={option.playerAmount === 4}
                                            onChange={handleChange}
                                        />
                                        4 Player
                                    </label>
                                </div>
                                <label className="mr-4 flex items-center justify-start gap-2 mb-6">
                                    Times
                                    <input
                                        type="number"
                                        name="times"
                                        className="border p-2 rounded"
                                        value={option.times}
                                        onChange={handleChange}
                                    />
                                </label>
                                <label className="mr-4 flex items-center justify-start gap-2 mb-6">
                                    <input
                                        type="checkbox"
                                        name="skipAnimation"
                                        value={option.skipAnimation ? "true" : "false"}
                                        checked={option.skipAnimation || option.times > 1}
                                        onChange={handleChange}
                                    />
                                    Skip Animation
                                </label>
                                <label className="mr-4 flex items-center justify-start gap-2 mb-6">
                                    <input
                                        type="checkbox"
                                        name="hideFromList"
                                        value={option.hideFromList ? "true" : "false"}
                                        checked={option.hideFromList}
                                        onChange={handleChange}
                                    />
                                    Hide Result From List
                                </label>
                            </div>
                        </div>
                        <div className="w-full h-full flex flex-col items-center justify-start">
                            <div className="flex items-center justify-center mb-6 gap-12">
                                <div className="flex gap-4 flex-col xl:flex-row relative">
                                    {Array(Math.floor(option.playerAmount / 2))
                                        .fill(null)
                                        .map((_, idx) => (
                                            <Roulette
                                                key={`left-${idx}`}
                                                targetIndex={players.findIndex(
                                                    (p) => p.name === results?.[0]?.players?.[idx]?.name
                                                )}
                                                isClear={isCloseResultModal}
                                                spinning={spinning}
                                                players={players
                                                    .filter((player) => !player.hide)
                                                    .map((player) => player.name)}
                                            />
                                        ))}
                                </div>

                                <div className="font-noto font-bold text-[32px] relative w-10 h-12">
                                    <VLabel>V</VLabel>
                                    <SLabel>S</SLabel>
                                </div>

                                <div className="flex gap-4 flex-col xl:flex-row relative">
                                    {Array(option.playerAmount - Math.floor(option.playerAmount / 2))
                                        .fill(null)
                                        .map((_, idx) => (
                                            <Roulette
                                                key={`right-${idx}`}
                                                targetIndex={
                                                    results
                                                        ? players.findIndex(
                                                              (p) =>
                                                                  p.name ===
                                                                  results[0]?.players?.[
                                                                      Math.floor(option.playerAmount / 2) + idx
                                                                  ]?.name
                                                          )
                                                        : 0
                                                }
                                                isClear={isCloseResultModal}
                                                spinning={spinning}
                                                players={players
                                                    .filter((player) => !player.hide)
                                                    .map((player) => player.name)}
                                            />
                                        ))}
                                </div>
                            </div>
                            <MudmueButton size="large" onClick={spin} theme="outline-secondary" disabled={spinning}>
                                <span className="font-noto text-[18px]">Random</span>
                            </MudmueButton>
                        </div>
                    </div>
                </div>
            </MudmueMatchmakerRouletteContainer>
            <MudmueMatchmakerPlayerContainer className=" flex flex-col items-center justify-start h-[1000px] xl:flex-row xl:items-start xl:justify-start xl:gap-6 xl:h-[200px] xl:pb-4">
                <div className="flex gap-4 items-center justify-start mb-4 xl:w-[30%] xl:mb-0">
                    <label className="mr-4 flex items-center justify-start gap-4">
                        Name
                        <input
                            type="text"
                            name="name"
                            className="border p-2 rounded"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </label>
                    <button className="btn btn-circle p-2" onClick={() => handleClickAddPlayer(playerName)}>
                        <img
                            src="https://icons.iconarchive.com/icons/pictogrammers/material/256/account-arrow-right-icon.png"
                            alt="add-player"
                        />
                    </button>
                </div>
                <div className="w-full xl:w-[70%] h-[336px] lg:overflow-auto lg:p-4">
                    <ul className="list bg-base-100 rounded-box shadow-lg ">
                        {players
                            .slice()
                            .reverse()
                            .map((player, index) => (
                                <div className="flex flex-col  items-center justify-start" key={index}>
                                    <li key={index} className="list-row flex items-center justify-between p-4 w-full">
                                        <div className="flex gap-8 items-center justify-start">
                                            <div>
                                                <img
                                                    className="size-10 rounded-box"
                                                    src="https://icons.iconarchive.com/icons/pictogrammers/material/256/human-greeting-variant-icon.png"
                                                    alt={`Profile of ${index} ${player}`}
                                                />
                                            </div>
                                            <div>
                                                <div>{player.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <img
                                                src={player.hide ? IconHide : IconUnhide}
                                                alt="eye"
                                                width={36}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    handleClickToggleHidePlayer(player);
                                                }}
                                            ></img>
                                            <button
                                                className="btn btn-sm btn-square btn-circle btn-ghost right-2 top-2 "
                                                onClick={() => {
                                                    handleClickRemovePlayer(player);
                                                }}
                                            >
                                                <img src={IconBin} alt="remove"></img>
                                            </button>
                                        </div>
                                    </li>
                                    <div className="w-[85%] h-[1px] bg-[#0000ff] opacity-20"></div>
                                </div>
                            ))}
                    </ul>
                </div>
            </MudmueMatchmakerPlayerContainer>
            <dialog id="match_result" className="modal">
                <div className={`modal-box w-8/12 max-w-5xl ${isShowResultModal ? "animate-fade-in" : ""}`}>
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => {
                            handleClickCloseResultModal();
                        }}
                    >
                        ✕
                    </button>
                    <h3 className="font-noto font-bold text-[24px] mb-4">Result</h3>
                    {results.map((round) => (
                        <div key={round.id} className="flex flex-col items-center justify-center mb-4">
                            <div
                                className="flex justify-center items-center flex-col xl:flex-row gap-12 mb-4"
                                key={round.id}
                            >
                                <div className="flex flex-col items-start justify-start gap-4 xl:gap-8">
                                    {Array(Math.floor(option.playerAmount / 2))
                                        .fill(null)
                                        .map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`result-item-left ${
                                                    isShowResultModal ? "show" : ""
                                                } font-noto text-[28px] `}
                                            >
                                                {round.players[idx].name}
                                            </div>
                                        ))}
                                </div>
                                <div className="font-noto font-bold text-[32px] relative w-10 h-12">
                                    <VLabel>V</VLabel>
                                    <SLabel>S</SLabel>
                                </div>

                                <div className="flex flex-col items-start justify-start gap-4 xl:gap-8">
                                    {Array(option.playerAmount - Math.floor(option.playerAmount / 2))
                                        .fill(null)
                                        .map((_, idx) => (
                                            <div
                                                key={idx + Math.floor(option.playerAmount / 2)}
                                                className={`result-item-right ${
                                                    isShowResultModal ? "show" : ""
                                                } font-noto text-[28px] `}
                                            >
                                                {round.players[Math.floor(option.playerAmount / 2) + idx].name}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {results.length > 1 && (
                                <div
                                    style={{ transform: "scaleX(1)" }}
                                    className="w-[20%] h-[1px] bg-[#0000ff] opacity-20 origin-left "
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
            </dialog>
        </MudmueMatchmakerContainer>
    );
};
