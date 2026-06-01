"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Plus, Minus, Maximize, Search, MapPin, Layers, Ruler, LayoutGrid, Globe, List, X, ChevronLeft, ChevronRight } from "lucide-react";
import PropertySVGCard from "@/components/PropertySVGCard";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Leaflet with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Leaflet CSS needs to be loaded
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issues in React/Next.js
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Formatter for Indonesian Rupiah
const formatPrice = (price) => {
  const num = typeof price === "bigint" ? Number(price) : Number(price || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Skeleton Loader Component
const PropertySkeleton = () => (
  <div className={styles.skeletonCard}>
    <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
    <div className={styles.skeletonBody}>
      <div style={{ display: "flex", gap: "8px" }}>
        <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
        <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
      </div>
      <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonPrice}`} />
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <div className={`${styles.skeleton} ${styles.skeletonText}`} />
        <div className={`${styles.skeleton} ${styles.skeletonText}`} />
      </div>
    </div>
  </div>
);

import { useSearchParams } from "next/navigation";
import ModelViewer from "@/components/ModelViewer";
import GradualBlur from "@/components/GradualBlur";

export default function PropertyListingClient() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid, list, map
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    tipe: searchParams.get("tipe") || "Semua",
    kawasan: searchParams.get("lokasi") || "Semua",
    status: searchParams.get("status") || "Semua",
    harga: searchParams.get("harga") || "Semua",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Gagal mengambil data properti:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const uniqueKawasans = useMemo(() => {
    const set = new Set();
    properties.forEach(p => {
      if (Array.isArray(p.kawasan)) {
        p.kawasan.forEach(k => set.add(k));
      }
    });
    return Array.from(set).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchSearch = p.namaProperti.toLowerCase().includes(filters.search.toLowerCase()) ||
                         p.groupName?.toLowerCase().includes(filters.search.toLowerCase());
      const matchTipe = filters.tipe === "Semua" || p.tipe === filters.tipe;
      const matchStatus = filters.status === "Semua" || p.status === filters.status;
      const matchKawasan = filters.kawasan === "Semua" || 
                          (Array.isArray(p.kawasan) && p.kawasan.includes(filters.kawasan));

      // Price Filter Logic
      let matchHarga = true;
      if (filters.harga !== "Semua" && filters.harga !== "") {
        const price = Number(p.price);
        if (filters.harga === "0-1M") matchHarga = price < 1000000000;
        else if (filters.harga === "1M-2M") matchHarga = price >= 1000000000 && price <= 2000000000;
        else if (filters.harga === "2M-5M") matchHarga = price > 2000000000 && price <= 5000000000;
        else if (filters.harga === "5M+") matchHarga = price > 5000000000;
      }

      return matchSearch && matchTipe && matchStatus && matchKawasan && matchHarga;
    });
  }, [properties, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProperties.length / pageSize);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [filteredProperties, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="container" style={{ padding: "64px 0" }}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <GradualBlur text="Katalog Properti Kami" />
        </h1>
        <p className={styles.subtitle}>
          Jelajahi berbagai pilihan unit Ruko komersial dan Villa eksklusif di lokasi-lokasi paling strategis.
        </p>

        {/* 3D Model Preview Section */}
        <AnimatePresence>
          {filters.tipe !== "Semua" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: "40px", marginBottom: "40px", overflow: "hidden" }}
            >
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#c9a961", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Preview 3D Model: {filters.tipe}
                </span>
              </div>
              <ModelViewer 
                src={filters.tipe === "VILLA" 
                  ? "/modern_luxury_villa_house_building_home.glb" 
                  : "/comercial_buiding.glb"
                } 
                alt={`Preview 3D ${filters.tipe}`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px" }}>
          <button 
            onClick={() => setViewMode("grid")}
            className={styles.mapBtn}
            style={{ width: "auto", borderRadius: "30px", padding: "0 20px", height: "45px", backgroundColor: viewMode === "grid" ? "#1a1a1a" : "white", color: viewMode === "grid" ? "white" : "#1a1a1a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: "600" }}
          >
            <LayoutGrid size={18} style={{ marginRight: "8px" }} /> Galeri
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={styles.mapBtn}
            style={{ width: "auto", borderRadius: "30px", padding: "0 20px", height: "45px", backgroundColor: viewMode === "list" ? "#1a1a1a" : "white", color: viewMode === "list" ? "white" : "#1a1a1a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: "600" }}
          >
            <List size={18} style={{ marginRight: "8px" }} /> Daftar
          </button>
          <button 
            onClick={() => setViewMode("map")}
            className={styles.mapBtn}
            style={{ width: "auto", borderRadius: "30px", padding: "0 20px", height: "45px", backgroundColor: viewMode === "map" ? "#1a1a1a" : "white", color: viewMode === "map" ? "white" : "#1a1a1a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: "600" }}
          >
            <Globe size={18} style={{ marginRight: "8px" }} /> Peta Interaktif
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <section className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Cari Properti</label>
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              placeholder="Nama properti atau group..." 
              className={styles.input}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <Search size={18} color="#cbd5e0" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Tipe</label>
          <select 
            className={styles.select}
            value={filters.tipe}
            onChange={(e) => setFilters({...filters, tipe: e.target.value})}
          >
            <option value="Semua">Semua Tipe</option>
            <option value="VILLA">Villa</option>
            <option value="RUKO">Ruko</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Kawasan</label>
          <select 
            className={styles.select}
            value={filters.kawasan}
            onChange={(e) => setFilters({...filters, kawasan: e.target.value})}
          >
            <option value="Semua">Semua Kawasan</option>
            {uniqueKawasans.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Status</label>
          <select 
            className={styles.select}
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="Semua">Semua Status</option>
            <option value="in_stock">Tersedia</option>
            <option value="sold_out">Terjual</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Harga</label>
          <select 
            className={styles.select}
            value={filters.harga}
            onChange={(e) => setFilters({...filters, harga: e.target.value})}
          >
            <option value="Semua">Semua Harga</option>
            <option value="0-1M">&lt; 1 Miliar</option>
            <option value="1M-2M">1 - 2 Miliar</option>
            <option value="2M-5M">2 - 5 Miliar</option>
            <option value="5M+">&gt; 5 Miliar</option>
          </select>
        </div>
      </section>

      <div className={styles.resultsInfo}>
        <span>Menampilkan <strong>{currentData.length}</strong> dari <strong>{filteredProperties.length}</strong> properti</span>
        <span>Halaman {currentPage} dari {totalPages || 1}</span>
      </div>

      {/* Results View */}
      <div style={{ minHeight: "600px" }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.grid}>
              {[...Array(pageSize)].map((_, i) => <PropertySkeleton key={i} />)}
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.grid}>
              {currentData.length > 0 ? (
                currentData.map((property) => (
                  <Link href={`/properti/${property.id}`} key={property.id} className={styles.card}>
                    <PropertySVGCard namaProperti={property.namaProperti} tipe={property.tipe} status={property.status} />
                    <div className={styles.cardBody}>
                      <div className={styles.badgeRow}>
                        <span className={`${styles.badge} ${property.tipe === "VILLA" ? styles.badgeVilla : styles.badgeRuko}`}>{property.tipe}</span>
                        <span className={`${styles.badge} ${property.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut}`}>{property.status === "in_stock" ? "Tersedia" : "Terjual"}</span>
                      </div>
                      <h3 className={styles.cardTitle}>{property.namaProperti}</h3>
                      <p className={styles.price}>{formatPrice(property.price)}</p>
                      <div className={styles.specs}>
                        <div className={styles.specItem}><Ruler size={14} color="#c9a961" /> <span>{Number(property.lebar)}x{Number(property.panjang)} m</span></div>
                        <div className={styles.specItem}><Layers size={14} color="#c9a961" /> <span>{Number(property.tingkat)} Lantai</span></div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.noResults}>
                  <h3>Tidak ditemukan properti yang cocok.</h3>
                  <button onClick={() => setFilters({search: "", tipe: "Semua", kawasan: "Semua", status: "Semua", harga: "Semua"})} style={{ marginTop: "20px", color: "#c9a961", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Reset Filter</button>
                </div>
              )}
            </motion.div>
          ) : viewMode === "list" ? (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={styles.listView}>
              {currentData.map((property) => (
                <Link href={`/properti/${property.id}`} key={property.id} className={styles.listCard}>
                  <div className={styles.listImage}>
                    <PropertySVGCard namaProperti={property.namaProperti} tipe={property.tipe} status={property.status} />
                  </div>
                  <div className={styles.listBody}>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.badge} ${property.tipe === "VILLA" ? styles.badgeVilla : styles.badgeRuko}`}>{property.tipe}</span>
                      <span className={`${styles.badge} ${property.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut}`}>{property.status === "in_stock" ? "Tersedia" : "Terjual"}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{property.namaProperti}</h3>
                    <p className={styles.price}>{formatPrice(property.price)}</p>
                    <div className={styles.listSpecs}>
                       <div className={styles.specItem}><Ruler size={14} color="#c9a961" /> <span>{Number(property.lebar)}x{Number(property.panjang)} m</span></div>
                       <div className={styles.specItem}><Layers size={14} color="#c9a961" /> <span>{Number(property.tingkat)} Lantai</span></div>
                       <div className={styles.specItem}><MapPin size={14} color="#c9a961" /> <span>{Array.isArray(property.kawasan) ? property.kawasan.join(", ") : property.kawasan}</span></div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={styles.mapWrapper}>
               {typeof window !== "undefined" && (
                 <MapContainer center={[3.5952, 98.6722]} zoom={12} className={styles.leafletContainer}>
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                   {filteredProperties.map(p => (
                     <Marker key={p.id} position={[p.lat || 3.5952, p.lng || 98.6722]}>
                       <Popup>
                         <div style={{ width: "200px" }}>
                           <h4 style={{ margin: "0 0 5px 0" }}>{p.namaProperti}</h4>
                           <p style={{ color: "#c9a961", fontWeight: "800", margin: 0 }}>{formatPrice(p.price)}</p>
                           <Link href={`/properti/${p.id}`}><button style={{ width: "100%", marginTop: "10px", padding: "8px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Detail</button></Link>
                         </div>
                       </Popup>
                     </Marker>
                   ))}
                 </MapContainer>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {!loading && viewMode !== "map" && totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={20} /></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageBtnActive : ""}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
