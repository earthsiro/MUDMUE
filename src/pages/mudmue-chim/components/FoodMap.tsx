import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import React, { useEffect } from "react";

import L from "leaflet";
import { Place } from "./mockPlace";

// Leaflet marker icon fix for Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FoodMapProps {
  places: Place[];
  selectedPlaceId: number | null;
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

const FoodMap: React.FC<FoodMapProps> = ({ places, selectedPlaceId }) => {
  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: 480 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]}>
          <Popup>
            <b>{place.name}</b><br />
            ⭐ {place.rating}<br />
            {place.review}
          </Popup>
        </Marker>
      ))}
      <FlyToSelected place={selectedPlace} />
    </MapContainer>
  );
};

export default FoodMap;