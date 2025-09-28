"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

// Create custom red pushpin icon with purple glow
const createCustomIcon = (isPreview = false) => {
  const color = isPreview ? "#8B5CF6" : "#DC2626"; // Purple for preview, red for reports
  const glowColor = isPreview ? "#A78BFA" : "#F87171"; // Lighter purple/red for glow
  
  return L.divIcon({
    className: 'custom-pushpin',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 32px;
        filter: drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor}40);
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(to bottom, ${color}, #991B1B);
          border-radius: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
  });
};

type MarkerItem = {
  id: string;
  position: LatLngExpression;
  popup?: string;
};

type Props = {
  center: LatLngExpression;
  markers: MarkerItem[];
  previewPosition?: LatLngExpression;
  onClickSetPosition?: (lat: number, lng: number) => void;
};

function ClickHandler({ onClickSetPosition }: { onClickSetPosition?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClickSetPosition?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ center, markers, previewPosition, onClickSetPosition }: Props) {
  return (
    <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClickSetPosition={onClickSetPosition} />
      {markers.map((m) => (
        <Marker key={m.id} position={m.position} icon={createCustomIcon(false)}>
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
      {previewPosition && (
        <Marker position={previewPosition} icon={createCustomIcon(true)}>
          <Popup>Selected location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}


