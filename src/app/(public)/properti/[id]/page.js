import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, MapPin, Ruler, Layers, Navigation, Home, CheckCircle2, ChevronLeft } from "lucide-react";
import PropertySVGCard from "@/components/PropertySVGCard";
import styles from "./page.module.css";
import DetailMap from "@/components/DetailMap";

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

// Safe parser for JSON fields (hadap, kawasan)
function parseJsonArray(val) {
  if (!val) return [];
  try {
    if (typeof val === "string") {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    }
    if (Array.isArray(val)) return val;
  } catch (e) {
    console.error("Parsing error:", e);
  }
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) return { title: "Properti Tidak Ditemukan" };

  const kawasan = parseJsonArray(property.kawasan).join(", ");
  return {
    title: `${property.namaProperti} | Prime Property`,
    description: `Dijual ${property.tipe} di ${kawasan}. Luas ${property.lebar}x${property.panjang}m, ${property.tingkat} lantai. Harga ${formatPrice(property.price)}.`,
    openGraph: {
      title: property.namaProperti,
      description: `Cek detail ${property.tipe} eksklusif di ${kawasan}.`,
      images: ["/logo.png"],
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = params;
  
  let property = null;
  try {
    property = await prisma.property.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Gagal mengambil detail properti:", error);
  }

  if (!property || property.deletedAt) {
    notFound();
  }

  const hadapArray = parseJsonArray(property.hadap);
  const kawasanArray = parseJsonArray(property.kawasan);

  const waMessage = `Halo, saya tertarik dengan properti "${property.namaProperti}" yang saya lihat di website. Mohon informasi lebih lanjut.`;
  const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.namaProperti,
    "description": `Dijual ${property.tipe} eksklusif di kawasan ${kawasanArray.join(", ")}.`,
    "brand": { "@type": "Brand", "name": "Prime Property" },
    "offers": {
      "@type": "Offer",
      "price": Number(property.price),
      "priceCurrency": "IDR",
      "availability": property.status === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://primeproperty.id/properti/${property.id}`
    }
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        {/* Navigation & Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <Link href="/properti" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#1a1a1a", fontWeight: "700", fontSize: "14px" }}>
            <ChevronLeft size={20} /> Kembali ke Katalog
          </Link>
          <nav className={styles.breadcrumb}>
            <Link href="/">Beranda</Link> / <Link href="/properti">Katalog</Link> / <span>{property.namaProperti}</span>
          </nav>
        </div>

        <div className={styles.layout}>
          {/* Top Section: Main Visuals & Contact */}
          <div className={styles.topSection}>
            {/* Main Info Card */}
            <div className={styles.mainInfo}>
              <div className={styles.svgHeader}>
                <PropertySVGCard 
                  namaProperti={property.namaProperti} 
                  tipe={property.tipe} 
                  status={property.status} 
                />
              </div>

              <div className={styles.detailsContent}>
                <div className={styles.headerRow}>
                  <div>
                    <h1 className={styles.title}>{property.namaProperti}</h1>
                    <p className={styles.price}>{formatPrice(property.price)}</p>
                  </div>
                </div>

                <div className={styles.badgeRow}>
                  <span className={`${styles.badge} ${property.tipe === "VILLA" ? styles.badgeVilla : styles.badgeRuko}`}>
                    {property.tipe}
                  </span>
                  <span className={`${styles.badge} ${property.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut}`}>
                    {property.status === "in_stock" ? "Tersedia" : "Terjual"}
                  </span>
                  <span className={styles.badge} style={{ background: "#f0f0f0", color: "#666" }}>
                    {property.siap === "siap_huni" ? "Siap Huni" : property.siap === "siap_kosong" ? "Siap Kosong" : "Siap Huni Renovasi"}
                  </span>
                </div>

                <h2 className={styles.sectionTitle}>Spesifikasi Unit</h2>
                <div className={styles.specsGrid}>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Dimensi Tanah</span>
                    <span className={styles.specValue}><Ruler size={18} color="#c9a961" /> {Number(property.lebar)} x {Number(property.panjang)} m</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Jumlah Lantai</span>
                    <span className={styles.specValue}><Layers size={18} color="#c9a961" /> {Number(property.tingkat)} Lantai</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Hadap Bangunan</span>
                    <span className={styles.specValue}><Navigation size={18} color="#c9a961" /> {hadapArray.join(", ") || "-"}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Carport</span>
                    <span className={styles.specValue}><CheckCircle2 size={18} color="#c9a961" /> {property.carport ? "Tersedia" : "Tidak Ada"}</span>
                  </div>
                  {property.unit && (
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Informasi Unit</span>
                      <span className={styles.specValue}><Home size={18} color="#c9a961" /> {property.unit}</span>
                    </div>
                  )}
                </div>

                <h2 className={styles.sectionTitle}>Deskripsi</h2>
                <p style={{ color: "#4a5568", lineHeight: "1.8", fontSize: "16px" }}>
                  Properti eksklusif persembahan Prime Property yang terletak di kawasan strategis <strong>{kawasanArray.join(", ")}</strong>. 
                  Unit ini merupakan pilihan ideal bagi Anda yang mencari hunian berkualitas tinggi atau instrumen investasi yang menguntungkan. 
                  Didesain dengan konsep modern kontemporer yang memaksimalkan sirkulasi udara dan pencahayaan alami.
                </p>
              </div>
            </div>

            {/* Sidebar with Contact & Quick Map */}
            <div className={styles.sidebar}>
              <div className={styles.contactCard}>
                <h3 className={styles.contactTitle}>Dapatkan Penawaran Eksklusif</h3>
                <p className={styles.contactDesc}>
                  Hubungi agen profesional kami untuk mendapatkan simulasi cicilan, jadwal survei lokasi, dan penawaran harga terbaik bulan ini.
                </p>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.waButton}>
                  <MessageCircle size={24} />
                  Hubungi via WhatsApp
                </a>
                <p style={{ textAlign: "center", fontSize: "12px", marginTop: "15px", color: "#888" }}>Respon cepat dalam waktu kurang dari 15 menit</p>
              </div>

              <div className={styles.mainInfo} style={{ padding: "24px" }}>
                <h3 className={styles.sectionTitle} style={{ border: "none", marginBottom: "15px" }}>Kawasan</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1a1a1a", fontWeight: "700" }}>
                  <MapPin size={20} color="#c9a961" />
                  {kawasanArray.join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Location Section with Interactive Map */}
          <div className={styles.locationSection}>
            <h2 className={styles.sectionTitle}>Lokasi Properti</h2>
            <div className={styles.mapWrapper}>
              <DetailMap 
                lat={property.lat} 
                lng={property.lng} 
                namaProperti={property.namaProperti} 
                kawasan={kawasanArray.join(", ")} 
              />
            </div>
            {property.mapsLink && (
              <div style={{ marginTop: "15px", textAlign: "right" }}>
                <a 
                  href={property.mapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#c9a961", fontWeight: "700", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Navigation size={16} /> Buka di Google Maps Navigasi
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
