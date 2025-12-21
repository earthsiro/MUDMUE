import "./Roulette.css";
import "./Matchmaker.css";

import { PlayerProfile, loadProfiles } from "../../../services/profileService";
import React, { useEffect, useState } from "react";
import { createMatch, loadHistories, saveHistories } from "../../../services/matchService";

import IconBin from "../../../assets/bin.svg";
import IconHide from "../../../assets/icon-hide.png";
import IconReset from "../../../assets/icon-reset.png";
import IconUnhide from "../../../assets/icon-unhide.png";
import { MudmueButton } from "../../../components/MudmueButton";
import { Roulette } from "./components/Roulette";
import { VSLabel } from "../components/VSLabel";
import { spinRoundsWithCarryOver } from "../../../helpers/spinhelp";
import styled from "styled-components";
import { useLoader } from "../../../components/Loader";

const breakpoints = {
    tablet: 900,
    mobile: 600,
};
const MudmueMatchmakerContainer = styled.div`
    width: 100%;
    height: 100%;
    padding: 24px;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 8px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 0px;
    }
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
export interface PlayerProps {
    id: number;
    name: string;
    displayName?: string;
    hide: boolean;
    uuid: string;
}
interface RoundResultMatchmakerProps {
    id: number;
    players: PlayerProps[];
}
const initialPlayers = (isReset: boolean) => {
    const defaultPlayers: PlayerProps[] = [
        { id: 0, name: "Player 1", hide: false, uuid: "" },
        { id: 1, name: "Player 2", hide: false, uuid: "" },
    ];
    if (isReset) return defaultPlayers;

    const saved = sessionStorage.getItem("mudmue_players");
    if (saved && saved.length > 0) {
        try {
            return JSON.parse(saved);
        } catch {
            return defaultPlayers;
        }
    }
    return defaultPlayers;
};
export const MudmueMatchmaker = () => {
    const { showLoader, hideLoader } = useLoader();
    const [players, setPlayers] = useState<PlayerProps[]>(initialPlayers(false));
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
    const [profileList, setProfileList] = useState<PlayerProfile[]>([]);
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]); // array ของ uuid

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
            if (name === "playerAmount" && value === "4") {
                if (players.length < 4) {
                    setPlayers([
                        ...players,
                        { id: 2, name: "Player 3", hide: false, uuid: "" },
                        { id: 3, name: "Player 4", hide: false, uuid: "" },
                    ]);
                }
            }
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
        const playerObj: PlayerProps = { id: players.length, name: player, hide: false, uuid: "" };
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
    // -- ใช้วิธี แบ่งคนเป็น pool แล้วสุ่มจาก pool ออกมาเท่ากับ optionPlayerAmount ในกรณีที่คนเหลือก็จะเอาคนคนเล่นมา random ใหม่
    // --(ถ้าอยาก random แล้ว recycle pool จนครบจำนวนรอบที่ user เลือก
    const spin = () => {
        setIsCloseResultModal(false);
        const pool = players.filter((p) => !p.hide);
        // --- สุ่ม random ผลลัพธ์ n รอบ ด้วย recycle pool
        const groupList = spinRoundsWithCarryOver(pool, option.playerAmount, option.times);
        const allResults: RoundResultMatchmakerProps[] = groupList.map((group, i) => ({
            id: results.length + i + 1,
            players: group,
        }));

        setResults((prev) => [...prev, ...allResults]);

        // Modal แสดงผลลัพธ์ - เหมือนเดิม
        if (!option.skipAnimation && option.times == 1) {
            setSpinning(true);
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
    const openProfileModal = () => {
        setProfileList(loadProfiles());
        setSelectedProfiles([]); // reset
        (document.getElementById("profile_picker") as HTMLDialogElement).showModal();
    };
    const closeProfileModal = () => (document.getElementById("profile_picker") as HTMLDialogElement).close();
    const handleAddProfiles = () => {
        console.log("selectedProfiles uuids:", selectedProfiles);
        console.log("profileList:", profileList);
        const toAdd = profileList.filter((p) => selectedProfiles.includes(p.uuid));
        console.log("toAdd after filter:", toAdd);

        const currentUuids = players.map((p) => p.uuid);
        console.log("current player uuids:", currentUuids);

        const addList = toAdd
            .filter((p) => !currentUuids.includes(p.uuid))
            .map((p, index) => ({
                id: players.length + index,
                name: p.name,
                displayName: p.displayName,
                hide: false,
                uuid: p.uuid,
            }));
        console.log("addList (will add to players):", addList);

        setPlayers([...players, ...addList]);
        closeProfileModal();
    };
    const handleProfileSelect = (uuid: string) => {
        setSelectedProfiles((prev) => (prev.includes(uuid) ? prev.filter((pid) => pid !== uuid) : [...prev, uuid]));
    };
    const handleSelectAll = () => {
        const idsToSelect = profileList.filter((p) => !players.some((pl) => pl.uuid === p.uuid)).map((p) => p.uuid);
        if (selectedProfiles.length === idsToSelect.length && idsToSelect.length > 0) {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles(idsToSelect);
        }
    };
    const savePlayersToSession = (players: PlayerProps[]) => {
        sessionStorage.setItem("mudmue_players", JSON.stringify(players));
    };
    const handleClickConfirmResult = () => {
        console.log("Confirming result...");
        let historyList = loadHistories();

        results.forEach((group) => {
            const half = group.players.length / 2;
            const redTeam = group.players.slice(0, half).map((p, i) => ({
                name: p.name,
                uuid: p.uuid,
                team: "red",
                score: 0,
                position: i,
            }));
            const blueTeam = group.players.slice(half).map((p, i) => ({
                name: p.name,
                uuid: p.uuid,
                team: "blue",
                score: 0,
                position: i,
            }));
            const players = [...redTeam, ...blueTeam];

            const serviceSide = Math.random() < 0.5 ? "red" : "blue";

            historyList = createMatch( players, serviceSide);
        });

        saveHistories(historyList);

        setIsShowResultModal(false);
        (document.getElementById("match_result") as HTMLDialogElement).close();
    };

    useEffect(() => {
        savePlayersToSession(players);
    }, [players]);
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
                        <div className="card lg:card-side card-border bg-base-100 w-96 h-full shadow-custom sm:w-full md:w-full sm:mb-2 md:mb-4">
                            <div className="card-body sm:p-0 md:p-0">
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
                                <div className="flex gap-4 flex-row relative">
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
                                                    .map((player) =>
                                                        player.displayName ? player.displayName : player.name
                                                    )}
                                            />
                                        ))}
                                </div>
                                <VSLabel />
                                <div className="flex gap-4 flex-row relative">
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
                                                    .map((player) =>
                                                        player.displayName ? player.displayName : player.name
                                                    )}
                                            />
                                        ))}
                                </div>
                            </div>
                            <MudmueButton
                                size="large"
                                onClick={spin}
                                theme="outline-secondary"
                                disabled={spinning || players.filter((p) => !p.hide).length < option.playerAmount}
                            >
                                <span className="font-noto text-[18px]">Random</span>
                            </MudmueButton>
                        </div>
                    </div>
                </div>
            </MudmueMatchmakerRouletteContainer>
            <MudmueMatchmakerPlayerContainer className=" flex flex-col items-center justify-start h-[1000px] xl:flex-row xl:items-start xl:justify-start xl:gap-6 xl:h-[200px] xl:pb-4">
                <div className="flex w-full justify-center xl:flex-col items-center gap-4 mb-4 xl:w-[30%] xl:mb-0">
                    <div className="flex gap-2 items-center justify-start ">
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
                        <button className="btn btn-circle p-2" onClick={() => setPlayers(initialPlayers(true))}>
                            <img src={IconReset} alt="reset-player" />
                        </button>
                    </div>
                    <MudmueButton onClick={() => openProfileModal()} size="medium" theme="outline-primary">
                        Add Existed Player
                    </MudmueButton>
                </div>
                <div className="w-full xl:w-[70%] min-h-[272px] lg:overflow-auto lg:p-4">
                    <div className="w-full flex justify-end mb-2">
                        <span className="text-[12px]">
                            Member:&nbsp;{players.length}&nbsp;,&nbsp;Available:&nbsp;
                            {players.filter((p) => !p.hide).length}
                        </span>
                    </div>
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
                                                <div>
                                                    {player.displayName ? (
                                                        <span>
                                                            {player.displayName}&nbsp;
                                                            <span className="text-[12px]">({player.name})</span>
                                                        </span>
                                                    ) : (
                                                        player.name
                                                    )}
                                                </div>
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
                <div
                    className={`modal-box w-10/12 lg:w-8/12 max-w-5xl flex flex-col items-center ${
                        isShowResultModal ? "animate-fade-in" : ""
                    }`}
                >
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
                            <div className="flex justify-center items-center flex-row gap-12 mb-4" key={round.id}>
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
                                                <div className="absolute right-[16px]">
                                                    {round.players[idx].displayName ? (
                                                        <span>
                                                            {round.players[idx].displayName}&nbsp;
                                                            <span className="text-[18px]">
                                                                ({round.players[idx].name})
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        round.players[idx].name
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <VSLabel />
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
                                                <div className="absolute left-[16px]">
                                                    {round.players[Math.floor(option.playerAmount / 2) + idx]
                                                        .displayName ? (
                                                        <span>
                                                            {
                                                                round.players[Math.floor(option.playerAmount / 2) + idx]
                                                                    .displayName
                                                            }
                                                            <span className="text-[18px]">
                                                                (
                                                                {
                                                                    round.players[
                                                                        Math.floor(option.playerAmount / 2) + idx
                                                                    ].name
                                                                }
                                                                )
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        round.players[Math.floor(option.playerAmount / 2) + idx].name
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {results.length > 1 && (
                                <div
                                    style={{ transform: "scaleX(1)" }}
                                    className="w-[25%] h-[1px] bg-[#0000ff] opacity-20 origin-left my-4"
                                ></div>
                            )}
                        </div>
                    ))}
                    <MudmueButton onClick={() => handleClickConfirmResult()} size="small" theme="outline-primary">
                        Confirm
                    </MudmueButton>
                    <span className="text-[12px] mt-2">
                        **Confirm to create match in <strong>dashboard</strong>
                    </span>
                </div>
            </dialog>
            <dialog id="profile_picker" className="modal">
                <div className="modal-box">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => (document.getElementById("profile_picker") as HTMLDialogElement).close()}
                    >
                        ✕
                    </button>
                    <h3 className="font-noto font-bold text-[20px] mb-4">Select Player(s) from Profile</h3>
                    <table className="table mb-4 ">
                        {/* head */}
                        <thead>
                            <tr className="font-noto text-[16px]">
                                <th>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                selectedProfiles.length ===
                                                    profileList.filter((p) => !players.some((pl) => pl.uuid === p.uuid))
                                                        .length && profileList.length > 0
                                            }
                                        />
                                    </label>
                                </th>
                                <th>Name</th>
                                <th>Level</th>
                                <th>Win/Lose</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profileList.map((profile, index) => (
                                <tr
                                    className="hover:bg-base-300 font-noto text-[16px] "
                                    key={`${profile.uuid}${index}`}
                                >
                                    <th>
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                checked={selectedProfiles.includes(profile.uuid)}
                                                disabled={players.some((pl) => pl.uuid === profile.uuid)}
                                                onChange={() => handleProfileSelect(profile.uuid)}
                                            />
                                        </label>
                                    </th>
                                    <td className="max-w-[200px] truncate">
                                        {profile.displayName}{" "}
                                        {profile.displayName !== profile.name ? (
                                            <span className="text-[12px]">&nbsp;({profile.name})</span>
                                        ) : null}
                                    </td>
                                    <td>{profile.level}</td>
                                    <td>
                                        {profile.win}/{profile.lose}({profile.lose > 0 ? profile.win / profile.lose : 0}
                                        )
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        className="btn btn-primary"
                        disabled={selectedProfiles.length === 0}
                        onClick={() => {
                            handleAddProfiles();
                        }}
                    >
                        Add to Players
                    </button>
                </div>
            </dialog>
        </MudmueMatchmakerContainer>
    );
};
