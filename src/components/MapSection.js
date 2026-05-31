"use client";

import React, { useEffect, useState } from "react";
import styles from "./Footer.module.css"; // Reuse some styles or create new
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for MapContainer to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const MapSection = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      // Fix for default marker icons in Leaflet + Next.js
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const projects = [
    { name: "Golden Hill", position: [3.5952, 98.6722], address: "Medan Johor" },
    { name: "Mentari Residence", position: [3.6152, 98.6922], address: "Pancing" },
    { name: "Sinar Residence", position: [3.5852, 98.6522], address: "Helvetia" }
  ];

  if (!isMounted || !L) return <div style={{ height: "400px", background: "#f0f0f0" }} />;

  return (
    <div style={{ height: "450px", width: "100%", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
      <MapContainer center={[3.5952, 98.6722]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {projects.map((project, index) => (
          <Marker key={index} position={project.position}>
            <Popup>
              <strong>{project.name}</strong> <br /> {project.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapSection;
