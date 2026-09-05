import "./Roulette.css";
import "./Matchmaker.css";

import {
    ChokButton,
    ChokCaption,
    ChokCheckRow,
    ChokField,
    ChokIconButton,
    ChokInput,
    ChokLabel,
    ChokLegend,
    ChokLevelChip,
    ChokPlayerName,
    ChokSegment,
    ChokSegmented,
    ChokSelect,
    ChokTable,
    ChokTableWrap,
    chok,
} from "../chok.styles";
import { IconUserCircle, IconUserPlus } from "../../../components/icons";
import { LEVEL_LIST, PlayerProfile, formatWinLoseRatio, loadProfilesAsync } from "../../../services/profileService";
import React, { useEffect, useRef, useState } from "react";

import IconBin from "../../../assets/bin.svg";
import IconHide from "../../../assets/icon-hide.png";
import IconReset from "../../../assets/icon-reset.png";
import IconUnhide from "../../../assets/icon-unhide.png";
import { PlayerProps } from "../../../types/player";
import { Roulette } from "./components/Roulette";
import { VSLabel } from "../components/VSLabel";
import { breakpoints } from "../../../styles/breakpoints";
import { createMatchAsync } from "../../../services/matchService";
import { spinRoundsWithCarryOver } from "../../../helpers/spinHelp";
import styled from "styled-components";
import { useLoader } from "../../../components/Loader";

const Wrap = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Panel = styled.section`
    width: 100%;
    background: ${chok.surface};
    border: 1px solid ${chok.line};
    border-radius: 12px;
    padding: 20px;

    @media (max-width: ${breakpoints.mobile}px) {
        padding: 14px;
    }
`;

/** Options rail beside the wheels; both stack under 900px. */
const SpinGrid = styled.div`
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 24px;
    align-items: start;

    @media (max-width: ${breakpoints.tablet}px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
    }
`;

const Options = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    background: ${chok.surfaceAlt};
    border: 1px solid ${chok.line};
    border-radius: 10px;
`;

const OptionGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const SpinArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`;

const Wheels = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 4vw, 48px);
    /* Safety net below 380px, where even the narrow wheels can run out of room. */
    overflow-x: auto;
    overflow-y: hidden;
`;

const WheelGroup = styled.div`
    display: flex;
    gap: clamp(6px, 2vw, 12px);
`;

const PlayerGrid = styled.div`
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 24px;
    align-items: start;

    @media (max-width: ${breakpoints.tablet}px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
    }
`;

const AddRow = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 8px;

    @media (max-width: ${breakpoints.mobile}px) {
        gap: 6px;
    }
`;

const AddColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ListHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
`;

const PlayerList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid ${chok.line};
    border-radius: 10px;
    overflow: hidden;
`;

const PlayerRow = styled.li<{ $hidden: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px clamp(8px, 2vw, 12px);
    border-bottom: 1px solid ${chok.lineSoft};
    background: ${({ $hidden }) => ($hidden ? chok.surfaceAlt : chok.surface)};

    &:last-child {
        border-bottom: none;
    }
`;

const PlayerIdentity = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
`;

const Avatar = styled.div<{ $hidden: boolean }>`
    width: 40px;
    height: 40px;
    flex-shrink: 0;

    @media (max-width: ${breakpoints.mobile}px) {
        display: none;
    }
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: ${chok.disabledBg};
    color: ${({ $hidden }) => ($hidden ? chok.disabledInk : chok.muted)};
`;

const RowActions = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const ModalBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
`;

const ResultRounds = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`;

const ResultRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(12px, 4vw, 48px);
`;

const ResultColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

/** Modal headings sit one step below the page's section title. */
const ModalHeading = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${chok.ink};
`;

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

/** Levels are ordered weakest → strongest by their position in LEVEL_LIST. */
const levelHint = (level: string) => {
    const index = LEVEL_LIST.findIndex((l) => l.name === level);
    if (index < 0) return "ยังไม่ได้ตั้งระดับ";
    return `มือ ${level} — ระดับที่ ${index + 1} จาก ${LEVEL_LIST.length} (อ่อน → เก่ง)`;
};

export const MudmueMatchmaker = () => {
    const { showLoader, hideLoader } = useLoader();
    const resultModalRef = useRef<HTMLDialogElement>(null);
    const profilePickerRef = useRef<HTMLDialogElement>(null);
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

    /** รอบเวียนนี้ต้องดึงคนที่ซ่อนไว้กลับมาเติมทีม — ใช้ตอนซ่อนคนที่สุ่มได้จนคนพร้อมสุ่มไม่พอ */
    const [rotationRestarted, setRotationRestarted] = useState(false);

    const availableCount = players.filter((p) => !p.hide).length;
    /* คนที่ซ่อนไว้ยังถูกดึงกลับมาเติมได้ถ้าคนพร้อมสุ่มไม่พอ — ปุ่มจึงตายก็ต่อเมื่อทั้งลิสต์ยังไม่ถึงขนาดทีม */
    const notEnoughPlayers = players.length < option.playerAmount;
    const willReuseHidden = availableCount < option.playerAmount && players.length >= option.playerAmount;
    /* เศษของรอบนี้ = คนที่เหลือไม่ครบทีม จะถูกยกไปตั้งต้นรอบถัดไป */
    const leftOverPerSpin = availableCount % option.playerAmount;

    const handleChangeMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
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
        if (player.trim() === "") return;
        // id ต้องมาจากค่าสูงสุดที่มี ไม่ใช่ length — ลบคนกลางลิสต์แล้ว id จะซ้ำ
        const nextId = players.length ? Math.max(...players.map((p) => p.id)) + 1 : 0;
        const playerObj: PlayerProps = { id: nextId, name: player.trim(), hide: false, uuid: "" };
        setPlayers([...players, playerObj]);
        setPlayerName("");
    };
    const handleClickRemovePlayer = (p: PlayerProps) => {
        setPlayers((prev) => prev.filter((player) => player.id !== p.id));
    };
    const handleClickToggleHidePlayer = (p: PlayerProps) => {
        setPlayers((prevPlayers) => {
            return prevPlayers.map((player) => (player.id === p.id ? { ...player, hide: !player.hide } : player));
        });
    };
    /**
     * ซ่อนคนที่เพิ่งถูกสุ่มได้ออกจากลิสต์ — เทียบด้วย id ของแถว ไม่ใช่ชื่อ
     * ของเดิมเทียบชื่อ คนชื่อซ้ำกันเลยโดนซ่อนยกแผงทั้งที่ถูกสุ่มได้คนเดียว
     */
    const hideDrawnPlayers = (rounds: RoundResultMatchmakerProps[], restartRotation: boolean) => {
        const drawnIds = new Set(rounds.flatMap((round) => round.players.map((p) => p.id)));
        setPlayers((prevPlayers) =>
            prevPlayers.map((player) => {
                /* เริ่มรอบเวียนใหม่: คนที่ไม่ได้ลงรอบนี้กลับมาพร้อมสุ่ม จะได้เป็นคิวถัดไป
                   ไม่งั้นพอทุกคนถูกซ่อนครบ ลิสต์จะกลายเป็นว่างเปล่าทั้งที่ยังเล่นกันอยู่ */
                if (restartRotation) return { ...player, hide: !drawnIds.has(player.id) };
                return drawnIds.has(player.id) ? { ...player, hide: true } : player;
            })
        );
    };

    /**
     * ปิดผลการสุ่มรอบนี้ — ต้องล้าง `results` เสมอ ไม่ว่าจะออกทางปุ่มปิดหรือปุ่มยืนยัน
     * ของเดิมปุ่มยืนยันไม่ล้าง พอสุ่มรอบถัดไปแล้วกดยืนยันอีกที รอบเก่าจะถูกสร้าง
     * เป็นแมตช์ซ้ำเข้า Dashboard อีกชุด
     */
    const finishResults = () => {
        setIsCloseResultModal(true);
        if (option.hideFromList) hideDrawnPlayers(results, rotationRestarted);
        setResults([]);
        setIsShowResultModal(false);
        resultModalRef.current?.close();
    };

    const handleClickCloseResultModal = () => {
        finishResults();
    };
    // -- ใช้วิธี แบ่งคนเป็น pool แล้วสุ่มจาก pool ออกมาเท่ากับ optionPlayerAmount ในกรณีที่คนเหลือก็จะเอาคนคนเล่นมา random ใหม่
    // --(ถ้าอยาก random แล้ว recycle pool จนครบจำนวนรอบที่ user เลือก
    const spin = () => {
        setIsCloseResultModal(false);
        const pool = players.filter((p) => !p.hide);
        /* คนที่ซ่อนไว้เป็นชั้นสำรอง — ถูกดึงกลับมาเฉพาะตอนคนพร้อมสุ่มไม่พอตั้งทีม */
        const reserve = players.filter((p) => p.hide);
        setRotationRestarted(pool.length < option.playerAmount && reserve.length > 0);
        const groupList = spinRoundsWithCarryOver(pool, option.playerAmount, option.times, reserve);
        const allResults: RoundResultMatchmakerProps[] = groupList.map((group: PlayerProps[], i: number) => ({
            id: results.length + i + 1,
            players: group,
        }));

        setResults((prev) => [...prev, ...allResults]);

        if (!option.skipAnimation && option.times === 1) {
            setSpinning(true);
            setTimeout(() => {
                setSpinning(false);
                setIsShowResultModal(true);
                resultModalRef.current?.showModal();
            }, 4000);
        } else {
            showLoader();
            setTimeout(() => {
                hideLoader();
                setIsShowResultModal(true);
                resultModalRef.current?.showModal();
            }, 1500);
        }
    };
    const openProfileModal = () => {
        loadProfilesAsync().then((list) => {
            setProfileList(list);
            setSelectedProfiles([]);
            profilePickerRef.current?.showModal();
        });
    };
    const closeProfileModal = () => profilePickerRef.current?.close();
    const handleAddProfiles = () => {
        const currentUuids = players.map((p) => p.uuid);
        const nextId = players.length ? Math.max(...players.map((p) => p.id)) + 1 : 0;
        const addList = profileList
            .filter((p) => selectedProfiles.includes(p.uuid) && !currentUuids.includes(p.uuid))
            .map((p, index) => ({
                id: nextId + index,
                name: p.name,
                displayName: p.displayName,
                hide: false,
                uuid: p.uuid,
            }));
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
    const handleClickConfirmResult = async () => {
        const createPromises = results.map((group) => {
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
            const matchPlayers = [...redTeam, ...blueTeam];
            const serviceSide = Math.random() < 0.5 ? "red" : "blue";
            return createMatchAsync(matchPlayers, serviceSide);
        });
        await Promise.all(createPromises);
        finishResults();
    };

    // The wheel strip is built from the visible players, so the landing index has
    // to be looked up in that same list — using the full list landed on the wrong
    // name as soon as anyone was hidden.
    const visiblePlayers = players.filter((p) => !p.hide);
    /* วงล้อต้องมีชื่อชุดเดียวกับที่ใช้สุ่มจริง — ตอนคนพร้อมสุ่มไม่พอ คนที่ซ่อนไว้ก็ถูกดึงมาด้วย
       ไม่งั้นหาชื่อที่สุ่มได้ในวงล้อไม่เจอ (index -1) แล้ววงล้อจะไปหยุดผิดชื่อ */
    const wheelPool = visiblePlayers.length >= option.playerAmount ? visiblePlayers : players;
    const wheelPlayers = wheelPool.map((p) => p.displayName ?? p.name);
    /* เทียบด้วย id ไม่ใช่ชื่อ — คนชื่อซ้ำกันสองคนเคยทำให้วงล้อหยุดที่คนแรกเสมอ */
    const wheelTarget = (slot: number) => wheelPool.findIndex((p) => p.id === results?.[0]?.players?.[slot]?.id);
    const leftWheels = Math.floor(option.playerAmount / 2);
    const rightWheels = option.playerAmount - leftWheels;

    const selectableProfiles = profileList.filter((p) => !players.some((pl) => pl.uuid === p.uuid));
    const allSelected = selectableProfiles.length > 0 && selectedProfiles.length === selectableProfiles.length;

    useEffect(() => {
        savePlayersToSession(players);
    }, [players]);

    return (
        <Wrap>
            <Panel>
                <SpinGrid>
                    <Options>
                        <OptionGroup>
                            <ChokLabel>โหมดจับคู่</ChokLabel>
                            <ChokSelect value={selectedValue} onChange={handleChangeMode} aria-label="โหมดจับคู่">
                                <option value="random">สุ่ม (Random)</option>
                                <option value="rank" disabled>
                                    ตามฝีมือ (เร็ว ๆ นี้)
                                </option>
                            </ChokSelect>
                        </OptionGroup>

                        <OptionGroup>
                            <ChokLabel>จำนวนผู้เล่นต่อแมตช์</ChokLabel>
                            <ChokSegmented role="group" aria-label="จำนวนผู้เล่นต่อแมตช์">
                                {[2, 4].map((amount) => (
                                    <ChokSegment key={amount} $active={option.playerAmount === amount}>
                                        <input
                                            type="radio"
                                            name="playerAmount"
                                            value={amount}
                                            checked={option.playerAmount === amount}
                                            onChange={handleChange}
                                        />
                                        {amount} Player
                                    </ChokSegment>
                                ))}
                            </ChokSegmented>
                        </OptionGroup>

                        <ChokField>
                            <ChokLabel>จำนวนรอบ</ChokLabel>
                            <ChokInput type="number" name="times" min={1} value={option.times} onChange={handleChange} />
                        </ChokField>

                        <OptionGroup>
                            <ChokCheckRow
                                title={
                                    option.times > 1 ? "สุ่มมากกว่า 1 รอบจะข้ามอนิเมชันให้อัตโนมัติ" : undefined
                                }
                            >
                                <input
                                    type="checkbox"
                                    name="skipAnimation"
                                    checked={option.skipAnimation || option.times > 1}
                                    disabled={option.times > 1}
                                    onChange={handleChange}
                                />
                                <span className="mark" />
                                ข้ามอนิเมชันรูเล็ต
                            </ChokCheckRow>
                            <ChokCheckRow>
                                <input
                                    type="checkbox"
                                    name="hideFromList"
                                    checked={option.hideFromList}
                                    onChange={handleChange}
                                />
                                <span className="mark" />
                                ซ่อนคนที่สุ่มได้ออกจากลิสต์
                            </ChokCheckRow>
                        </OptionGroup>
                    </Options>

                    <SpinArea>
                        <Wheels>
                            <WheelGroup>
                                {Array(leftWheels)
                                    .fill(null)
                                    .map((_, idx) => (
                                        <Roulette
                                            key={`left-${idx}`}
                                            targetIndex={wheelTarget(idx)}
                                            isClear={isCloseResultModal}
                                            spinning={spinning}
                                            players={wheelPlayers}
                                        />
                                    ))}
                            </WheelGroup>
                            <VSLabel size={28} />
                            <WheelGroup>
                                {Array(rightWheels)
                                    .fill(null)
                                    .map((_, idx) => (
                                        <Roulette
                                            key={`right-${idx}`}
                                            targetIndex={wheelTarget(leftWheels + idx)}
                                            isClear={isCloseResultModal}
                                            spinning={spinning}
                                            players={wheelPlayers}
                                        />
                                    ))}
                            </WheelGroup>
                        </Wheels>

                        <ChokButton
                            type="button"
                            $tone="primary"
                            $size="lg"
                            onClick={spin}
                            disabled={spinning || notEnoughPlayers}
                        >
                            Random
                        </ChokButton>
                        {notEnoughPlayers ? (
                            <ChokCaption>
                                ต้องมีผู้เล่นอย่างน้อย {option.playerAmount} คน (ตอนนี้ {players.length} คน)
                            </ChokCaption>
                        ) : willReuseHidden ? (
                            <ChokCaption>
                                คนพร้อมสุ่มเหลือ {availableCount} คน — จะดึงคนที่ซ่อนไว้กลับมาเติมให้ครบ{" "}
                                {option.playerAmount} คน แล้วเริ่มวนรอบใหม่
                            </ChokCaption>
                        ) : (
                            leftOverPerSpin > 0 && (
                                <ChokCaption>
                                    {availableCount} คน ต่อแมตช์ {option.playerAmount} คน — เหลือ{" "}
                                    {leftOverPerSpin} คน ยกไปตั้งต้นรอบถัดไป
                                </ChokCaption>
                            )
                        )}
                    </SpinArea>
                </SpinGrid>
            </Panel>

            <Panel>
                <PlayerGrid>
                    <AddColumn>
                        <AddRow>
                            <ChokField style={{ flex: 1 }}>
                                <ChokLabel>เพิ่มผู้เล่นชั่วคราว</ChokLabel>
                                <ChokInput
                                    type="text"
                                    name="name"
                                    value={playerName}
                                    placeholder="ใส่ชื่อผู้เล่น"
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleClickAddPlayer(playerName);
                                    }}
                                />
                            </ChokField>
                            <ChokIconButton
                                type="button"
                                onClick={() => handleClickAddPlayer(playerName)}
                                disabled={playerName.trim() === ""}
                                title={playerName.trim() === "" ? "ใส่ชื่อก่อนกดเพิ่ม" : "เพิ่มผู้เล่น"}
                                aria-label="เพิ่มผู้เล่น"
                            >
                                <IconUserPlus size={22} />
                            </ChokIconButton>
                            <ChokIconButton
                                type="button"
                                onClick={() => setPlayers(initialPlayers(true))}
                                title="รีเซ็ตลิสต์ผู้เล่น"
                                aria-label="รีเซ็ตลิสต์ผู้เล่น"
                            >
                                <img src={IconReset} alt="" />
                            </ChokIconButton>
                        </AddRow>
                        <ChokButton type="button" $tone="neutral" onClick={openProfileModal}>
                            เลือกจาก Profile ที่บันทึกไว้
                        </ChokButton>
                    </AddColumn>

                    <div>
                        <ListHead>
                            <ChokLabel>ผู้เล่นในรอบนี้</ChokLabel>
                            <ChokCaption>
                                ทั้งหมด {players.length} · พร้อมสุ่ม {availableCount}
                            </ChokCaption>
                        </ListHead>
                        <PlayerList>
                            {players
                                .slice()
                                .reverse()
                                .map((player) => (
                                    <PlayerRow key={player.id} $hidden={!!player.hide}>
                                        <PlayerIdentity>
                                            <Avatar $hidden={!!player.hide}>
                                                <IconUserCircle size={24} />
                                            </Avatar>
                                            <ChokPlayerName style={{ opacity: player.hide ? 0.5 : 1 }}>
                                                {player.displayName ? (
                                                    <>
                                                        {player.displayName} <small>({player.name})</small>
                                                    </>
                                                ) : (
                                                    player.name
                                                )}
                                            </ChokPlayerName>
                                        </PlayerIdentity>
                                        <RowActions>
                                            <ChokIconButton
                                                type="button"
                                                aria-pressed={!!player.hide}
                                                title={player.hide ? "เอากลับเข้าการสุ่ม" : "ซ่อนจากการสุ่ม"}
                                                aria-label={player.hide ? "เอากลับเข้าการสุ่ม" : "ซ่อนจากการสุ่ม"}
                                                onClick={() => handleClickToggleHidePlayer(player)}
                                            >
                                                <img src={player.hide ? IconHide : IconUnhide} alt="" />
                                            </ChokIconButton>
                                            <ChokIconButton
                                                type="button"
                                                $tone="danger"
                                                title="ลบผู้เล่น"
                                                aria-label="ลบผู้เล่น"
                                                onClick={() => handleClickRemovePlayer(player)}
                                            >
                                                <img src={IconBin} alt="" />
                                            </ChokIconButton>
                                        </RowActions>
                                    </PlayerRow>
                                ))}
                        </PlayerList>
                    </div>
                </PlayerGrid>
            </Panel>

            {/* ---------- ผลการสุ่ม ---------- */}
            <dialog ref={resultModalRef} className="modal">
                <div
                    className={`modal-box w-11/12 max-w-3xl ${isShowResultModal ? "animate-fade-in" : ""}`}
                    style={{ background: chok.surface }}
                >
                    <ModalBox>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <ModalHeading>ผลการสุ่ม</ModalHeading>
                            <ChokIconButton
                                type="button"
                                onClick={handleClickCloseResultModal}
                                title="ปิด"
                                aria-label="ปิด"
                            >
                                ✕
                            </ChokIconButton>
                        </div>

                        <ResultRounds>
                            {results.map((round) => (
                                <ResultRow key={round.id}>
                                    <ResultColumn>
                                        {round.players.slice(0, leftWheels).map((p, idx) => (
                                            <div
                                                key={`${round.id}-l-${idx}`}
                                                className={`result-item-left ${isShowResultModal ? "show" : ""}`}
                                            >
                                                <ChokPlayerName>
                                                    {p.displayName ? (
                                                        <>
                                                            {p.displayName} <small>({p.name})</small>
                                                        </>
                                                    ) : (
                                                        p.name
                                                    )}
                                                </ChokPlayerName>
                                            </div>
                                        ))}
                                    </ResultColumn>
                                    <VSLabel size={26} />
                                    <ResultColumn>
                                        {round.players.slice(leftWheels).map((p, idx) => (
                                            <div
                                                key={`${round.id}-r-${idx}`}
                                                className={`result-item-right ${isShowResultModal ? "show" : ""}`}
                                            >
                                                <ChokPlayerName>
                                                    {p.displayName ? (
                                                        <>
                                                            {p.displayName} <small>({p.name})</small>
                                                        </>
                                                    ) : (
                                                        p.name
                                                    )}
                                                </ChokPlayerName>
                                            </div>
                                        ))}
                                    </ResultColumn>
                                </ResultRow>
                            ))}
                        </ResultRounds>

                        <ModalActions>
                            <ChokButton type="button" $tone="neutral" onClick={handleClickCloseResultModal}>
                                สุ่มใหม่
                            </ChokButton>
                            <ChokButton type="button" $tone="primary" onClick={handleClickConfirmResult}>
                                ยืนยัน — สร้างแมตช์
                            </ChokButton>
                        </ModalActions>
                        <ChokCaption>ยืนยันแล้วแมตช์จะไปโผล่ที่หน้า Dashboard</ChokCaption>
                    </ModalBox>
                </div>
            </dialog>

            {/* ---------- เลือกผู้เล่นจาก Profile ---------- */}
            <dialog ref={profilePickerRef} className="modal">
                <div className="modal-box w-11/12 max-w-2xl" style={{ background: chok.surface }}>
                    <ModalBox>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <ModalHeading>เลือกผู้เล่นจาก Profile</ModalHeading>
                            <ChokIconButton type="button" onClick={closeProfileModal} title="ปิด" aria-label="ปิด">
                                ✕
                            </ChokIconButton>
                        </div>

                        <ChokTableWrap>
                            <ChokTable>
                                <thead>
                                    <tr>
                                        <th style={{ width: 56 }}>
                                            <ChokCheckRow style={{ padding: 0 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    disabled={selectableProfiles.length === 0}
                                                    onChange={handleSelectAll}
                                                    aria-label="เลือกทั้งหมด"
                                                />
                                                <span className="mark" />
                                            </ChokCheckRow>
                                        </th>
                                        <th>ชื่อ</th>
                                        <th>Level</th>
                                        <th className="optional">Win/Lose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileList.map((profile) => {
                                        const alreadyIn = players.some((pl) => pl.uuid === profile.uuid);
                                        return (
                                            <tr key={profile.uuid}>
                                                <td>
                                                    <ChokCheckRow style={{ padding: 0 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProfiles.includes(profile.uuid)}
                                                            disabled={alreadyIn}
                                                            onChange={() => handleProfileSelect(profile.uuid)}
                                                            aria-label={`เลือก ${profile.displayName || profile.name}`}
                                                        />
                                                        <span className="mark" />
                                                    </ChokCheckRow>
                                                </td>
                                                <td>
                                                    {profile.displayName}
                                                    {profile.displayName !== profile.name && (
                                                        <ChokCaption>&nbsp;({profile.name})</ChokCaption>
                                                    )}
                                                    {alreadyIn && <ChokCaption>&nbsp;· อยู่ในลิสต์แล้ว</ChokCaption>}
                                                </td>
                                                <td>
                                                    {profile.level ? (
                                                        <ChokLevelChip title={levelHint(profile.level)}>
                                                            {profile.level}
                                                        </ChokLevelChip>
                                                    ) : (
                                                        <ChokCaption>—</ChokCaption>
                                                    )}
                                                </td>
                                                <td className="optional">
                                                    {profile.win}/{profile.lose} (
                                                    {formatWinLoseRatio(profile.win, profile.lose)})
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </ChokTable>
                        </ChokTableWrap>

                        <ChokLegend>
                            อ่อน →
                            {LEVEL_LIST.map((level) => (
                                <b key={level.name}>{level.name}</b>
                            ))}
                            → เก่ง
                        </ChokLegend>

                        <ModalActions>
                            <ChokButton type="button" $tone="neutral" onClick={closeProfileModal}>
                                ยกเลิก
                            </ChokButton>
                            <ChokButton
                                type="button"
                                $tone="primary"
                                disabled={selectedProfiles.length === 0}
                                onClick={handleAddProfiles}
                            >
                                เพิ่มเข้าลิสต์ ({selectedProfiles.length})
                            </ChokButton>
                        </ModalActions>
                    </ModalBox>
                </div>
            </dialog>
        </Wrap>
    );
};
