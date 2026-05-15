import { Place, places as mockPlaces } from "./components/mockPlace";
import React, { useEffect, useState } from "react";

import FoodMap from "./components/FoodMap";
import Sidebar from "./components/Sidebar";
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

// Responsive breakpoints
const breakpoints = {
    tablet: 900,
    mobile: 600,
};

const FoodMapPageContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const FoodMapTitleContent = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 24px;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 16px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 8px;
    }
`;

const FoodMapContent = styled.div`
    width: 100%;
    height: calc(100% - 88px);
    padding: 0 16px;
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
    border: 2px solid #c05cb4;
    color: #c05cb4;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s;

    &:hover {
        background: #c05cb4;
        color: white;
    }

    @media (max-width: ${breakpoints.tablet}px) {
        display: block;
    }
`;

export const FoodMapPage: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>(loadPlaces);
    const [search, setSearch] = useState("");
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

    // Modal state
    const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [formName, setFormName] = useState("");
    const [formReview, setFormReview] = useState("");
    const [formRating, setFormRating] = useState<number>(5);
    const [showPinListModal, setShowPinListModal] = useState(false);

    const handleMapClick = (lat: number, lng: number) => {
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

    return (
        <FoodMapPageContainer>
            <FoodMapTitleContent>
                <span className="font-noto text-[24px]">
                    MUDMUE Chim
                </span>
               
            </FoodMapTitleContent>

            <FoodMapContent>
                {/* Map */}
                <MapContainerStyled>
                    <FoodMap
                        places={places}
                        selectedPlaceId={selectedPlaceId}
                        currentLocation={currentLocation}
                        onMapClick={handleMapClick}
                    />
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
                        selectedPlaceId={selectedPlaceId}
                        setSelectedPlaceId={setSelectedPlaceId}
                        onDeletePlace={handleDeletePlace}
                    />
                </SidebarContainer>
            </FoodMapContent>

            {/* Add Pin Modal */}
            <dialog id="add-pin-modal" className="modal">
                <div className="modal-box" style={{ maxWidth: 420 }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: "#c05cb4" }}>
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
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => {
                                setPendingLocation(null);
                                (document.getElementById("add-pin-modal") as HTMLDialogElement)?.close();
                            }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            className="btn"
                            style={{ background: "#c05cb4", color: "#fff", borderColor: "#c05cb4" }}
                            onClick={handleAddPin}
                            disabled={!formName.trim()}
                        >
                            บันทึก
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setPendingLocation(null)}>close</button>
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
                            <h3 className="font-bold text-lg" style={{ color: "#c05cb4" }}>
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
                        <div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ค้นหาร้านอาหาร..."
                                className="input input-bordered w-full mb-4"
                            />
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: "calc(80vh - 150px)" }}>
                            {places
                                .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                                .map((place) => (
                                    <div
                                        key={place.id}
                                        onClick={() => {
                                            setSelectedPlaceId(place.id);
                                            setShowPinListModal(false);
                                        }}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            background: selectedPlaceId === place.id ? "#f5c6ec44" : "transparent",
                                            cursor: "pointer",
                                            marginBottom: "8px",
                                            border: `1px solid ${selectedPlaceId === place.id ? "#c05cb4aa" : "#eee"}`,
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: "16px" }}>{place.name}</div>
                                        <div style={{ fontSize: "14px", color: "#777", margin: "4px 0" }}>
                                            {"⭐".repeat(Math.round(place.rating))} {place.rating}/5
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#999", fontStyle: "italic", marginBottom: "8px" }}>
                                            {place.review}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlace(place.id);
                                            }}
                                            style={{
                                                background: "#ff6b6b",
                                                color: "white",
                                                border: "none",
                                                padding: "4px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                            }}
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                ))}
                            {places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                                <div style={{ textAlign: "center", color: "#aaa", padding: "32px" }}>
                                    ไม่พบร้าน
                                </div>
                            )}
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