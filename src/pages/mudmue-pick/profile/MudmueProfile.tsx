import {
    LEVEL_LIST,
    PlayerProfile,
    addProfile,
    deleteProfile,
    loadProfiles,
    saveProfiles,
    updateProfile,
} from "../../../services/profileService";
import React, { useEffect, useState } from "react";

import { formatDateTime } from "../../../helpers/formatDate";
import styled from "styled-components";

const breakpoints = {
    tablet: 900,
    mobile: 600,
};
const MudmueProfileContainer = styled.div`
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
const MudmueProfileFilterContainer = styled.div`
    width: 100%;
    display: flex;
    margin-bottom: 16px;
    justify-content: space-between;
`;

export const MudmueProfile = () => {
    const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
    const [formProfile, setFormProfile] = useState<Partial<PlayerProfile>>({
        id: undefined,
        name: "",
        displayName: "",
        level: "",
    });
    const handleClickDetailProfileModal = (data: PlayerProfile) => {
        setFormProfile(data);
        (document.getElementById("profile_modal") as HTMLDialogElement).showModal();
    };
    const handleClickOpenProfileModal = () => {
        setFormProfile({ id: undefined, name: "", displayName: "", level: "" });

        (document.getElementById("profile_modal") as HTMLDialogElement).showModal();
    };

    const handleClickCloseProfileModal = () => {
        (document.getElementById("profile_modal") as HTMLDialogElement).close();
    };
    const handleClickDeleteProfileModal = (data: PlayerProfile) => {
        setFormProfile(data);
        (document.getElementById("confirm_modal") as HTMLDialogElement).showModal();
    };
    const onDelete = (id: number) => {
        const newList = deleteProfile(profiles, id);
        setProfiles(newList);
        saveProfiles(newList);
        (document.getElementById("confirm_modal") as HTMLDialogElement).close();
    };

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        let newList;
        if (formProfile.id != null) {
            // edit
            newList = updateProfile(
                profiles,
                formProfile.id,
                formProfile.name ?? "",
                formProfile.displayName ?? "",
                formProfile.level ?? ""
            );
        } else {
            // add
            newList = addProfile(
                profiles,
                formProfile.name ?? "",
                formProfile.displayName ?? "",
                formProfile.level ?? ""
            );
        }
        setProfiles(newList);
        saveProfiles(newList);
        handleClickCloseProfileModal();
    }
    useEffect(() => {
        setProfiles(loadProfiles());
    }, []);
    return (
        <MudmueProfileContainer>
            <MudmueProfileFilterContainer>
                <div></div>
                <button className="btn btn-circle p-2" onClick={() => handleClickOpenProfileModal()}>
                    <img
                        src="https://icons.iconarchive.com/icons/ionic/ionicons/256/person-add-icon.png"
                        alt="add-player"
                    />
                </button>
            </MudmueProfileFilterContainer>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table ">
                    {/* head */}
                    <thead>
                        <tr className="font-noto text-[16px] text-[#0000ff]">
                            <th></th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Win/Lose</th>
                            <th>W/L Ratio</th>
                            <th>Created At</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile, index) => (
                            <tr className="hover:bg-[#E1E1E2] font-noto text-[16px] " key={profile.id}>
                                <th className="text-[#FF1493]">{index + 1}</th>
                                <td className="max-w-[200px] truncate">
                                    {profile.displayName}{" "}
                                    {profile.displayName !== profile.name ? (
                                        <span className="text-[12px]">({profile.name})</span>
                                    ) : null}
                                </td>
                                <td>{profile.level}</td>
                                <td>
                                    {profile.win}/{profile.lose}
                                </td>
                                <td>{profile.lose > 0 ? profile.win / profile.lose : 0}</td>
                                <td>{formatDateTime(profile.createDate)}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-ghost text-[#CACAFB]"
                                        onClick={() => {
                                            handleClickDetailProfileModal(profile);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost text-[#FF1493]"
                                        onClick={() => {
                                            handleClickDeleteProfileModal(profile);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <dialog id="profile_modal" className="modal">
                <div className={`modal-box w-9/12 lg:w-4/12 max-w-5xl `}>
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => {
                            handleClickCloseProfileModal();
                        }}
                    >
                        ✕
                    </button>
                    <h3 className="font-noto font-bold text-[24px] mb-4 text-left">
                        {formProfile.id != null ? "Edit Profile" : "Add Profile"}
                    </h3>
                    <form onSubmit={handleSave} className="flex flex-col gap-6 pl-4">
                        <label className="flex w-full justify-between items-center gap-4">
                            Name<span className="text-[10px]">{formProfile.name?.length}&nbsp;/&nbsp;25</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="border p-2 rounded flex-1"
                            value={formProfile.name ?? ""}
                            onChange={(e) => setFormProfile((f) => ({ ...f, name: e.target.value }))}
                            required
                            maxLength={25}
                            placeholder="Enter name"
                            autoFocus
                        />
                        <label className="flex w-full justify-between items-center gap-4">
                            Display Name (Show in web)
                            <span className="text-[10px]">{formProfile.displayName?.length}&nbsp;/&nbsp;25</span>
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            className="border p-2 rounded flex-1"
                            value={formProfile.displayName ?? ""}
                            onChange={(e) => setFormProfile((f) => ({ ...f, displayName: e.target.value }))}
                            required
                            maxLength={25}
                            placeholder="Enter display name (in web)"
                            autoFocus
                        />
                        <label className="flex items-center gap-4">Level</label>
                        <select
                            name="level"
                            className="border p-2 rounded flex-1"
                            value={formProfile.level ?? ""}
                            onChange={(e) => setFormProfile((f) => ({ ...f, level: e.target.value }))}
                            required
                        >
                            <option value="" disabled>
                                -- Select Level --
                            </option>
                            {LEVEL_LIST.map((level, index) => (
                                <option key={`level-${index}${level.name}`} value={level.name}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-4 justify-end">
                            <button className="btn btn-ghost" type="button" onClick={handleClickCloseProfileModal}>
                                Back
                            </button>
                            <button className="btn bg-[#0000ff] text-[#ffffff] hover:text-[#000000]" type="submit">
                                {formProfile.id != null ? "Save" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
            <dialog id="confirm_modal" className="modal">
                <div className={`modal-box w-9/12 lg:w-4/12 max-w-5xl `}>
                    <h3 className="font-noto font-bold text-[24px] mb-4 text-left">Confirm</h3>
                    <div className="font-noto text-[18px] mb-4">
                        Are you sure for delete this player : {formProfile.name}?
                    </div>
                    <div className="flex gap-4 justify-end">
                        <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => {
                                (document.getElementById("confirm_modal") as HTMLDialogElement).close();
                            }}
                        >
                            Back
                        </button>
                        <button
                            className="btn bg-[#FF1493] text-[#ffffff] hover:text-[#FF89C9]"
                            onClick={() => onDelete(formProfile.id!)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </dialog>
        </MudmueProfileContainer>
    );
};
