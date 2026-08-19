import { Place, places as mockPlaces } from "./components/mockPlace";
import React, { useEffect, useState } from "react";
import Sidebar, { SortKey } from "./components/Sidebar";

import FoodMap from "./components/FoodMap";
import { MudmueButton } from "../../components/MudmueButton";
import { PageHeader } from "../../components/PageHeader";
import { breakpoints } from "../../styles/breakpoints";
import styled from "styled-components";

const STORAGE_KEY = "mudmue-chim-places";

function loadPlaces(): Place[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as Place[];
    } catch {
        // ignore
    }
    return mockPlaces;
}

function savePlaces(places: Place[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

const FoodMapPageContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const AddPlaceButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--brand-pink);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: box-shadow 0.2s, opacity 0.2s;

    &:hover {
        opacity: 0.9;
        box-shadow: 0 0 5px 0 var(--brand-pink);
    }
`;

/** แถบบอกใบ้ให้คลิกบนแผนที่ โผล่หลังกดปุ่ม "เพิ่มร้านอาหาร" */
const MapHint = styled.div`
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: calc(100% - 120px);
    padding: 10px 16px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--brand-pink);
    color: var(--brand-pink);
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

    button {
        cursor: pointer;
        line-height: 1;
        color: inherit;
    }
`;

/* กินพื้นที่ที่เหลือจาก PageHeader แทนการหักความสูงหัวเพจเป็นตัวเลขตายตัว */
const FoodMapContent = styled.div`
    width: 100%;
    flex: 1;
    min-height: 0;
    padding: 0 16px 16px;
    display: flex;
    gap: 16px;
    background: #f9f9f9;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 0;
        flex-direction: column;
        gap: 0;
    }
`;

const MapContainerStyled = styled.div`
    flex: 1;
    min-width: 0;
    height: 100%;
    position: relative;

    @media (max-width: ${breakpoints.tablet}px) {
        width: 100%;
        height: 100%;
    }
`;

const SidebarContainer = styled.div`
    width: 350px;
    height: 100%;
    display: flex;
    flex-direction: column;

    @media (max-width: ${breakpoints.tablet}px) {
        display: none;
    }
`;

const PinListButton = styled.button`
    display: none;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 400;
    background: white;
    border: 2px solid var(--brand-pink);
    color: var(--brand-pink);
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s;

    &:hover {
        background: var(--brand-pink);
        color: white;
    }

    @media (max-width: ${breakpoints.tablet}px) {
        display: block;
    }
`;

export const FoodMapPage: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>(loadPlaces);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("rating");
    const [minRating, setMinRating] = useState(0);
    const [showAddHint, setShowAddHint] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                    // Default to Bangkok if geolocation fails
                    setCurrentLocation({ lat: 13.7563, lng: 100.5018 });
                }
            );
        } else {
            // Fallback to Bangkok
            setCurrentLocation({ lat: 13.7563, lng: 100.5018 });
        }
    }, []);

    // Add pin modal state
    const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [formName, setFormName] = useState("");
    const [formReview, setFormReview] = useState("");
    const [formRating, setFormRating] = useState<number>(5);
    const [showPinListModal, setShowPinListModal] = useState(false);

    // Edit modal state
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [editFormName, setEditFormName] = useState("");
    const [editFormReview, setEditFormReview] = useState("");
    const [editFormRating, setEditFormRating] = useState<number>(5);

    const handleMapClick = (lat: number, lng: number) => {
        setShowAddHint(false);
        setPendingLocation({ lat, lng });
        setFormName("");
        setFormReview("");
        setFormRating(5);
        const modal = document.getElementById("add-pin-modal") as HTMLDialogElement;
        modal?.showModal();
    };

    const handleAddPin = () => {
        if (!pendingLocation || !formName.trim()) return;
        const newPlace: Place = {
            id: Date.now(),
            name: formName.trim(),
            lat: pendingLocation.lat,
            lng: pendingLocation.lng,
            rating: formRating,
            review: formReview.trim(),
        };
        const updated = [...places, newPlace];
        setPlaces(updated);
        savePlaces(updated);
        setSelectedPlaceId(newPlace.id);
        setPendingLocation(null);
        const modal = document.getElementById("add-pin-modal") as HTMLDialogElement;
        modal?.close();
    };

    const handleDeletePlace = (id: number) => {
        const updated = places.filter((p) => p.id !== id);
        setPlaces(updated);
        savePlaces(updated);
        if (selectedPlaceId === id) setSelectedPlaceId(null);
    };

    const handleOpenEdit = (id: number) => {
        const place = places.find((p) => p.id === id);
        if (!place) return;
        setEditingPlace(place);
        setEditFormName(place.name);
        setEditFormReview(place.review);
        setEditFormRating(place.rating);
        const modal = document.getElementById("edit-pin-modal") as HTMLDialogElement;
        modal?.showModal();
    };

    const handleSaveEdit = () => {
        if (!editingPlace || !editFormName.trim()) return;
        const updated = places.map((p) =>
            p.id === editingPlace.id
                ? { ...p, name: editFormName.trim(), review: editFormReview.trim(), rating: editFormRating }
                : p
        );
        setPlaces(updated);
        savePlaces(updated);
        setEditingPlace(null);
        const modal = document.getElementById("edit-pin-modal") as HTMLDialogElement;
        modal?.close();
    };

    return (
        <FoodMapPageContainer>
            <PageHeader
                crumbs={[{ name: "MUDMUE Chim" }, { name: "แผนที่ร้าน" }]}
                title="MUDMUE Chim"
                subtitle="บันทึกและค้นหาร้านอาหารที่คุณชิมมาแล้ว"
                actions={
                    <AddPlaceButton onClick={() => setShowAddHint(true)}>
                        + เพิ่มร้านอาหาร
                    </AddPlaceButton>
                }
            />

            <FoodMapContent>
                {/* Map */}
                <MapContainerStyled>
                    <FoodMap
                        places={places}
                        selectedPlaceId={selectedPlaceId}
                        currentLocation={currentLocation}
                        onMapClick={handleMapClick}
                    />
                    {showAddHint && (
                        <MapHint>
                            <span>คลิกตำแหน่งบนแผนที่เพื่อปักหมุดร้านอาหาร</span>
                            <button onClick={() => setShowAddHint(false)} title="ปิด">
                                ✕
                            </button>
                        </MapHint>
                    )}
                    {/* Pin list button for mobile/tablet */}
                    <PinListButton onClick={() => setShowPinListModal(true)}>
                        📌 รายการร้าน ({places.length})
                    </PinListButton>
                </MapContainerStyled>

                {/* Sidebar - desktop only */}
                <SidebarContainer>
                    <Sidebar
                        places={places}
                        search={search}
                        setSearch={setSearch}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        currentLocation={currentLocation}
                        selectedPlaceId={selectedPlaceId}
                        setSelectedPlaceId={setSelectedPlaceId}
                        onDeletePlace={handleDeletePlace}
                        onEditPlace={handleOpenEdit}
                    />
                </SidebarContainer>
            </FoodMapContent>

            {/* Add Pin Modal */}
            <dialog id="add-pin-modal" className="modal">
                <div className="modal-box" style={{ maxWidth: 420 }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: "var(--brand-pink)" }}>
                        📍 ปักหมุดร้านอาหาร
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="label text-sm font-semibold">ชื่อร้าน *</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="เช่น ก๋วยเตี๋ยวเรือ..."
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                maxLength={80}
                            />
                        </div>
                        <div>
                            <label className="label text-sm font-semibold">รีวิว / รายละเอียด</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                placeholder="รสชาติ บรรยากาศ สิ่งที่ชอบ..."
                                value={formReview}
                                onChange={(e) => setFormReview(e.target.value)}
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                        <div>
                            <label className="label text-sm font-semibold">คะแนน</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormRating(star)}
                                        style={{
                                            fontSize: 28,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            opacity: star <= formRating ? 1 : 0.25,
                                            transition: "opacity 0.15s",
                                        }}
                                    >
                                        ⭐
                                    </button>
                                ))}
                                <span style={{ fontSize: 14, color: "#888", marginLeft: 4 }}>
                                    {formRating} / 5
                                </span>
                            </div>
                        </div>
                        {pendingLocation && (
                            <div style={{ fontSize: 12, color: "#aaa" }}>
                                📌 {pendingLocation.lat.toFixed(5)}, {pendingLocation.lng.toFixed(5)}
                            </div>
                        )}
                    </div>
                    <div className="modal-action" style={{ gap: 12 }}>
                        <MudmueButton
                            size="small"
                            theme="outline-secondary"
                            onClick={() => {
                                setPendingLocation(null);
                                (document.getElementById("add-pin-modal") as HTMLDialogElement)?.close();
                            }}
                        >
                            ยกเลิก
                        </MudmueButton>
                        <MudmueButton
                            size="small"
                            theme="secondary"
                            onClick={handleAddPin}
                            disabled={!formName.trim()}
                        >
                            บันทึก
                        </MudmueButton>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setPendingLocation(null)}>close</button>
                </form>
            </dialog>

            {/* Edit Pin Modal */}
            <dialog id="edit-pin-modal" className="modal">
                <div className="modal-box" style={{ maxWidth: 420 }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: "var(--brand-pink)" }}>
                        ✏️ แก้ไขร้านอาหาร
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="label text-sm font-semibold">ชื่อร้าน *</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="เช่น ก๋วยเตี๋ยวเรือ..."
                                value={editFormName}
                                onChange={(e) => setEditFormName(e.target.value)}
                                maxLength={80}
                            />
                        </div>
                        <div>
                            <label className="label text-sm font-semibold">รีวิว / รายละเอียด</label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                placeholder="รสชาติ บรรยากาศ สิ่งที่ชอบ..."
                                value={editFormReview}
                                onChange={(e) => setEditFormReview(e.target.value)}
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                        <div>
                            <label className="label text-sm font-semibold">คะแนน</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditFormRating(star)}
                                        style={{
                                            fontSize: 28,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            opacity: star <= editFormRating ? 1 : 0.25,
                                            transition: "opacity 0.15s",
                                        }}
                                    >
                                        ⭐
                                    </button>
                                ))}
                                <span style={{ fontSize: 14, color: "#888", marginLeft: 4 }}>
                                    {editFormRating} / 5
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="modal-action" style={{ gap: 12 }}>
                        <MudmueButton
                            size="small"
                            theme="outline-secondary"
                            onClick={() => {
                                setEditingPlace(null);
                                (document.getElementById("edit-pin-modal") as HTMLDialogElement)?.close();
                            }}
                        >
                            ยกเลิก
                        </MudmueButton>
                        <MudmueButton
                            size="small"
                            theme="secondary"
                            onClick={handleSaveEdit}
                            disabled={!editFormName.trim()}
                        >
                            บันทึก
                        </MudmueButton>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setEditingPlace(null)}>close</button>
                </form>
            </dialog>

            {/* Pin List Modal - mobile/tablet */}
            {showPinListModal && (
                <dialog className="modal" style={{ display: "block" }}>
                    <div className="modal-box" style={{ maxWidth: "95vw", height: "80vh", maxHeight: "90vh" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                            }}
                        >
                            <h3 className="font-bold text-lg" style={{ color: "var(--brand-pink)" }}>
                                📌 รายการร้านอาหาร
                            </h3>
                            <button
                                onClick={() => setShowPinListModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        {/* ใช้ Sidebar ตัวเดียวกับฝั่ง desktop จะได้มีตัวกรอง/เรียงลำดับชุดเดียวกัน */}
                        <div style={{ height: "calc(80vh - 110px)" }}>
                            <Sidebar
                                places={places}
                                search={search}
                                setSearch={setSearch}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                minRating={minRating}
                                setMinRating={setMinRating}
                                currentLocation={currentLocation}
                                selectedPlaceId={selectedPlaceId}
                                setSelectedPlaceId={(id) => {
                                    setSelectedPlaceId(id);
                                    setShowPinListModal(false);
                                }}
                                onDeletePlace={handleDeletePlace}
                                onEditPlace={(id) => {
                                    setShowPinListModal(false);
                                    handleOpenEdit(id);
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => setShowPinListModal(false)}
                        style={{ cursor: "pointer" }}
                    />
                </dialog>
            )}
        </FoodMapPageContainer>
    );
};

export default FoodMapPage;