import { Place } from "./mockPlace";
import React from "react";

interface SidebarProps {
  places: Place[];
  search: string;
  setSearch: (val: string) => void;
  selectedPlaceId: number | null;
  setSelectedPlaceId: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  places,
  search,
  setSearch,
  selectedPlaceId,
  setSelectedPlaceId,
}) => {
  const filtered = places.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      width: 280, background: "#fff", borderRadius: 8, margin: 16, marginRight: 0,
      boxShadow: "0 0 8px #eee", display: "flex", flexDirection: "column"
    }}>
      <div style={{ padding: 16, paddingBottom: 0 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          style={{
            width: "100%",
            border: "1px solid #bbb", borderRadius: 4, padding: "8px 12px",
            fontSize: 14
          }}
        />
      </div>
      <div style={{ padding: 8, flex: 1, overflowY: "auto" }}>
        {filtered.map((place) => (
          <div
            key={place.id}
            onClick={() => setSelectedPlaceId(place.id)}
            style={{
              padding: "10px 8px",
              borderRadius: 4,
              background: selectedPlaceId === place.id ? "#f5c6ec44" : "transparent",
              cursor: "pointer",
              marginBottom: 6,
              border: "1px solid #eee",
              transition: "background 0.2s",
            }}
          >
            <div style={{ fontWeight: 600 }}>{place.name}</div>
            <div style={{ fontSize: 13, color: "#777", margin: "2px 0 2px 0" }}>
              ⭐ {place.rating}
            </div>
            <div style={{ fontSize: 13, color: "#999", fontStyle: "italic" }}>
              {place.review}
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