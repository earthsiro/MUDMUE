import "leaflet/dist/leaflet.css";

import L, { LeafletMouseEvent } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import React, { useEffect } from "react";

import { Place } from "./mockPlace";

// Leaflet marker icon fix for Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CurrentLocation {
  lat: number;
  lng: number;
}

interface FoodMapProps {
  places: Place[];
  selectedPlaceId: number | null;
  currentLocation?: CurrentLocation | null;
  onMapClick?: (lat: number, lng: number) => void;
}

function FlyToSelected({ place }: { place: Place | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (place) {
      map.flyTo([place.lat, place.lng], 16, { duration: 1 });
    }
  }, [place]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom marker icon for current location (blue dot)
const currentLocationIcon = L.divIcon({
  className: 'current-location-marker',
  html: '<div style="width: 20px; height: 20px; background: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 3px #4285F4; box-sizing: border-box;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const FoodMap: React.FC<FoodMapProps> = ({ places, selectedPlaceId, currentLocation, onMapClick }) => {
  const mapRef = React.useRef<any>(null);
  const selectedPlace = places.find((p) => p.id === selectedPlaceId);
  const initialCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : [13.7563, 100.5018];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        ref={mapRef}
        center={initialCenter}
        zoom={13}
        style={{ width: "100%", height: "100%", minHeight: 480, cursor: onMapClick ? "crosshair" : "grab" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Current location marker */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
            <Popup>
              <b>📍 ตำแหน่งของคุณ</b>
            </Popup>
          </Marker>
        )}
        {/* Food places markers */}
        {places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]}>
            <Popup>
              <b>{place.name}</b><br />
              {"⭐".repeat(Math.round(place.rating))} {place.rating}/5<br />
              <span style={{ fontStyle: "italic", color: "#666" }}>{place.review}</span>
            </Popup>
          </Marker>
        ))}
        <FlyToSelected place={selectedPlace} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>
      {/* Locate button overlay (outside MapContainer) */}
      {currentLocation && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 400,
            background: "white",
            border: "2px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo([currentLocation.lat, currentLocation.lng], 16, { duration: 0.8 });
              }
            }}
            style={{
              width: "44px",
              height: "44px",
              border: "none",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
            title="ตำแหน่งปัจจุบัน"
          >
            🎯
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodMap;