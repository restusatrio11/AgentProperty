"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function DetailMap({ lat, lng, namaProperti, kawasan }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default marker icon issue in Leaflet + Next.js
    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ 
          height: "100%", 
          width: "100%", 
          minHeight: "350px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          background: "#f3f4f6",
          color: "#666",
          fontWeight: "600",
          borderRadius: "8px"
        }}
      >
        Memuat Peta...
      </div>
    );
  }

  const center = [lat || 3.5952, lng || 98.6722];

  return (
    <MapContainer 
      center={center} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>
          <strong>{namaProperti}</strong><br />
          {kawasan}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
