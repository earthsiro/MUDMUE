import IconBin from "../../../assets/bin.svg";
import IconGear from "../../../assets/icon-gear.png";
import { Place } from "./mockPlace";
import React from "react";
import styled from "styled-components";

export type SortKey = "rating" | "distance" | "name";

export interface LatLng {
  lat: number;
  lng: number;
}

interface SidebarProps {
  places: Place[];
  search: string;
  setSearch: (val: string) => void;
  sortBy: SortKey;
  setSortBy: (val: SortKey) => void;
  /** 0 = ทั้งหมด */
  minRating: number;
  setMinRating: (val: number) => void;
  currentLocation?: LatLng | null;
  selectedPlaceId: number | null;
  setSelectedPlaceId: (id: number) => void;
  onDeletePlace?: (id: number) => void;
  onEditPlace?: (id: number) => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "คะแนน" },
  { key: "distance", label: "ระยะทาง" },
  { key: "name", label: "ชื่อร้าน" },
];

const RATING_FILTERS: { value: number; label: string }[] = [
  { value: 0, label: "ทั้งหมด" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

/** ระยะทางเส้นตรงระหว่างสองพิกัด (กม.) */
function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} ม. จากคุณ`;
  return `${km.toFixed(1)} กม. จากคุณ`;
}

const StarShape = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ display: "block" }}>
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

/** ดาวหนึ่งดวง — fill 0..1 เพื่อรองรับครึ่งดาว */
const Star = ({ fill }: { fill: number }) => (
  <span style={{ position: "relative", display: "inline-block", width: 14, height: 14 }}>
    <StarShape color="#dcdcdc" />
    <span style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
      <StarShape color="var(--brand-pink)" />
    </span>
  </span>
);

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} fill={Math.min(1, Math.max(0, rating - i))} />
    ))}
  </span>
);

const SidebarContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 8px #eee;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Controls = styled.div`
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldLabel = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;

const SearchField = styled.div`
  position: relative;

  input {
    padding-left: 34px;
    font-size: 14px;
  }

  svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #bbb;
    pointer-events: none;
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  background: ${({ $active }) => ($active ? "var(--brand-pink)" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#666")};
  border: 1px solid ${({ $active }) => ($active ? "var(--brand-pink)" : "#e0e0e0")};

  &:hover {
    border-color: var(--brand-pink);
    color: ${({ $active }) => ($active ? "#fff" : "var(--brand-pink)")};
  }
`;

const ResultCount = styled.div`
  font-size: 12px;
  color: #aaa;
  padding: 4px 16px 8px;
`;

const PlaceList = styled.div`
  padding: 0 8px 8px;
  flex: 1;
  overflow-y: auto;
`;

const Sidebar: React.FC<SidebarProps> = ({
  places,
  search,
  setSearch,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  currentLocation,
  selectedPlaceId,
  setSelectedPlaceId,
  onDeletePlace,
  onEditPlace,
}) => {
  const keyword = search.trim().toLowerCase();

  const filtered = places
    .filter((p) => {
      const matchKeyword =
        !keyword ||
        p.name.toLowerCase().includes(keyword) ||
        p.review.toLowerCase().includes(keyword);
      return matchKeyword && p.rating >= minRating;
    })
    .map((p) => ({
      place: p,
      distanceKm: currentLocation ? haversineKm(currentLocation, p) : null,
    }));

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        // ไม่รู้ตำแหน่งผู้ใช้ก็เรียงไม่ได้ — ปล่อยลำดับเดิมไว้
        if (a.distanceKm === null || b.distanceKm === null) return 0;
        return a.distanceKm - b.distanceKm;
      case "name":
        return a.place.name.localeCompare(b.place.name, "th");
      case "rating":
      default:
        return b.place.rating - a.place.rating;
    }
  });

  return (
    <SidebarContainer>
      <Controls>
        <div>
          <FieldLabel>ค้นหาร้านอาหาร</FieldLabel>
          <SearchField>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ชื่อร้าน หรือ รายละเอียด..."
              className="input input-bordered w-full"
            />
          </SearchField>
        </div>

        <div>
          <FieldLabel>เรียงลำดับ</FieldLabel>
          <ChipRow>
            {SORT_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                type="button"
                $active={sortBy === option.key}
                onClick={() => setSortBy(option.key)}
              >
                {option.label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <ChipRow>
          {RATING_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              type="button"
              $active={minRating === filter.value}
              onClick={() => setMinRating(filter.value)}
            >
              {filter.label}
            </Chip>
          ))}
        </ChipRow>
      </Controls>

      <ResultCount>{sorted.length} ร้าน</ResultCount>

      <PlaceList>
        {sorted.map(({ place, distanceKm }) => (
          <div
            key={place.id}
            onClick={() => setSelectedPlaceId(place.id)}
            style={{
              padding: "12px 8px",
              borderRadius: 6,
              background: selectedPlaceId === place.id ? "#f5c6ec44" : "#fafafa",
              cursor: "pointer",
              marginBottom: 8,
              border: `1px solid ${selectedPlaceId === place.id ? "var(--brand-pink)" : "#eee"}`,
              transition: "background 0.2s",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 56, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>{place.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0" }}>
              <Stars rating={place.rating} />
              <span style={{ fontSize: 12, color: "#777" }}>{place.rating}/5</span>
            </div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 6, lineHeight: 1.3 }}>
              {place.review}
            </div>
            {distanceKm !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#aaa" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {formatDistance(distanceKm)}
              </div>
            )}
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
        {sorted.length === 0 && (
          <div style={{ color: "#aaa", padding: 16, textAlign: "center" }}>ไม่พบร้าน</div>
        )}
      </PlaceList>
    </SidebarContainer>
  );
};

export default Sidebar;
