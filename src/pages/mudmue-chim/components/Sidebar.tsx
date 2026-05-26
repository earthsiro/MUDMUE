import IconBin from "../../../assets/bin.svg";
import IconGear from "../../../assets/icon-gear.png";
import { Place } from "./mockPlace";
import React from "react";

interface SidebarProps {
  places: Place[];
  search: string;
  setSearch: (val: string) => void;
  selectedPlaceId: number | null;
  setSelectedPlaceId: (id: number) => void;
  onDeletePlace?: (id: number) => void;
  onEditPlace?: (id: number) => void;
}



const Sidebar: React.FC<SidebarProps> = ({
  places,
  search,
  setSearch,
  selectedPlaceId,
  setSelectedPlaceId,
  onDeletePlace,
  onEditPlace,
}) => {
  const filtered = places.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      background: "#fff", borderRadius: 8, margin: 0,
      boxShadow: "0 0 8px #eee", display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden"
    }}>
      <div style={{ padding: "16px", paddingBottom: "8px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาร้านอาหาร..."
          className="input input-bordered w-full"
          style={{ fontSize: 14 }}
        />
        <div style={{ padding: "8px 0", fontSize: 12, color: "#aaa" }}>
          {filtered.length} ร้าน
        </div>
      </div>
      <div style={{ padding: "0 8px 8px", flex: 1, overflowY: "auto" }}>
        {filtered.map((place) => (
          <div
            key={place.id}
            onClick={() => setSelectedPlaceId(place.id)}
            style={{
              padding: "12px 8px",
              borderRadius: 6,
              background: selectedPlaceId === place.id ? "#f5c6ec44" : "#fafafa",
              cursor: "pointer",
              marginBottom: 8,
              border: `1px solid ${selectedPlaceId === place.id ? "#c05cb4aa" : "#eee"}`,
              transition: "background 0.2s",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 56, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>{place.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "#777", margin: "4px 0" }}>
              {"⭐".repeat(Math.round(place.rating))} {place.rating}/5
            </div>
            <div style={{ fontSize: 12, color: "#999", fontStyle: "italic", marginBottom: "6px", lineHeight: 1.3 }}>
              {place.review}
            </div>
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
              {onEditPlace && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditPlace(place.id); }}
                  style={{
                    background: "none",
                    color: "#6060c0",
                    width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  title="แก้ไข"
                >
                  <img src={IconGear} alt="แก้ไข" style={{ width: 22, height: 22 }} />
                </button>
              )}
              {onDeletePlace && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePlace(place.id); }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="ลบ"
                >
                  <img src={IconBin} alt="ลบ" style={{ width: 22, height: 22 }} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: "#aaa", padding: 16, textAlign: "center" }}>ไม่พบร้าน</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;