import prisma from "@/lib/prisma";
import PropertySVGCard from "@/components/PropertySVGCard";
import Button from "@/components/Button";
import Link from "next/link";
import styles from "./page.module.css";
import ScrollReveal from "@/components/ScrollReveal";
import PropertyCarousel from "@/components/PropertyCarousel";

// Formatter for Indonesian Rupiah
function formatPrice(price) {
  const num = typeof price === "bigint" ? Number(price) : Number(price || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Safe parser for JSON fields (hadap, kawasan)
function parseJsonArray(val) {
  if (!val) return "";
  try {
    if (typeof val === "string") {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.join(", ");
    }
    if (Array.isArray(val)) {
      return val.join(", ");
    }
  } catch (e) {
    // fallback
  }
  return String(val);
}

// Fallback mock data in case DB is not seeded/available
const mockProperties = [
  {
    id: "mock-1",
    namaProperti: "Villa Golden Cemara Blok A-1",
    groupName: "Golden Hill",
    lebar: 8.0,
    panjang: 18.0,
    hadap: '["UTARA"]',
    tipe: "VILLA",
    tingkat: 2.0,
    price: 1850000000n,
    carport: true,
    status: "in_stock",
    siap: "siap_huni",
    kawasan: '["Cemara Asri"]',
    unit: "Hook unit",
  },
  {
    id: "mock-2",
    namaProperti: "Ruko Commercial Pancing Boulevard",
    groupName: "Mentari",
    lebar: 4.5,
    panjang: 20.0,
    hadap: '["TIMUR"]',
    tipe: "RUKO",
    tingkat: 3.0,
    price: 1250000000n,
    carport: false,
    status: "in_stock",
    siap: "siap_kosong",
    kawasan: '["Pancing"]',
    unit: "Ready siap huni",
  },
  {
    id: "mock-3",
    namaProperti: "Villa Modernist Sinar Helvetia",
    groupName: "Sinar Residence",
    lebar: 7.5,
    panjang: 15.0,
    hadap: '["SELATAN"]',
    tipe: "VILLA",
    tingkat: 2.0,
    price: 2100000000n,
    carport: true,
    status: "in_stock",
    siap: "siap_huni_renovasi",
    kawasan: '["Helvetia"]',
    unit: null,
  },
  {
    id: "mock-4",
    namaProperti: "Ruko Krakatau Grand Square",
    groupName: "Project Ville",
    lebar: 4.25,
    panjang: 18.0,
    hadap: '["BARAT", "UTARA"]',
    tipe: "RUKO",
    tingkat: 4.0,
    price: 1550000000n,
    carport: true,
    status: "sold_out",
    siap: "siap_kosong",
    kawasan: '["Krakatau"]',
    unit: "Corner lot",
  },
  {
    id: "mock-5",
    namaProperti: "Villa Luxury Johor Heights",
    groupName: "Golden Hill",
    lebar: 10.0,
    panjang: 22.0,
    hadap: '["SELATAN", "TIMUR"]',
    tipe: "VILLA",
    tingkat: 2.5,
    price: 3600000000n,
    carport: true,
    status: "in_stock",
    siap: "siap_huni",
    kawasan: '["Medan Johor"]',
    unit: "Ready Siap huni",
  },
  {
    id: "mock-6",
    namaProperti: "Ruko Central Setiabudi Kav 8",
    groupName: "Sinar Residence",
    lebar: 5.0,
    panjang: 16.0,
    hadap: '["BARAT"]',
    tipe: "RUKO",
    tingkat: 3.0,
    price: 2800000000n,
    carport: true,
    status: "in_stock",
    siap: "siap_huni",
    kawasan: '["Setiabudi"]',
    unit: null,
  },
];

import HeroSlider from "./HeroSlider";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import MapSection from "@/components/MapSection";

export const metadata = {
  title: "Prime Property | Hunian Eksklusif & Investasi Properti Premium",
  description: "Temukan koleksi villa mewah dan ruko strategis dari Prime Property. Investasi properti terbaik dengan desain modern dan lokasi prima di Medan.",
  openGraph: {
    title: "Prime Property | Hunian Eksklusif",
    description: "Koleksi properti premium untuk hunian dan investasi.",
    images: ["/logo.png"],
  },
};

export default async function HomePage() {
  let dbProperties = [];
  try {
    dbProperties = await prisma.property.findMany({
      where: { deletedAt: null },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Gagal mengambil data properti dari database, menggunakan data mock:", error);
  }

  // Get unique kawasans from DB or fallback to mock properties
  let allKawasans = [];
  try {
    const rawKawasans = await prisma.property.findMany({
      where: { deletedAt: null },
      select: { kawasan: true }
    });
    const set = new Set();
    rawKawasans.forEach(p => {
      try {
        const parsed = JSON.parse(p.kawasan);
        if (Array.isArray(parsed)) {
          parsed.forEach(k => set.add(k));
        } else {
          set.add(parsed);
        }
      } catch (e) {
        set.add(p.kawasan);
      }
    });
    allKawasans = Array.from(set).sort();
  } catch (error) {
    console.error("Gagal mengambil daftar kawasan dari DB:", error);
  }

  if (allKawasans.length === 0) {
    const set = new Set();
    mockProperties.forEach(p => {
      try {
        const parsed = JSON.parse(p.kawasan);
        if (Array.isArray(parsed)) {
          parsed.forEach(k => set.add(k));
        } else {
          set.add(parsed);
        }
      } catch (e) {
        set.add(p.kawasan);
      }
    });
    allKawasans = Array.from(set).sort();
  }

  // Choose DB properties if available and non-empty, otherwise use fallback mock data
  const rawProperties = dbProperties.length > 0 ? dbProperties : mockProperties;
  
  // Serialize for Client Component (Convert BigInt to Number)
  const displayProperties = rawProperties.map(p => ({
    ...p,
    price: Number(p.price)
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Prime Property",
    "image": "https://primeproperty.id/logo.png",
    "description": "Agen properti premium di Medan yang menawarkan villa mewah dan ruko komersial.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Medan",
      "addressRegion": "Sumatera Utara",
      "addressCountry": "ID"
    },
    "url": "https://primeproperty.id"
  };

  return (
    <div style={{ position: "relative" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section with Cinematic Slider */}
      <HeroSlider kawasans={allKawasans} />

      {/* Property Highlight Section */}
      <section className={styles.section} style={{ position: "relative", zIndex: 20, backgroundColor: "white" }}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionSubtitle}>Daftar Properti</span>
              <h2 className={styles.sectionTitle}>Properti Unggulan</h2>
              <p className={styles.sectionDescription}>
                Pilihan properti premium siap huni dan ruko komersial terbaik yang kami tawarkan.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <PropertyCarousel properties={displayProperties} />
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Link href="/properti" passHref>
                <Button variant="outline" size="md">
                  Lihat Semua Properti
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Value Proposition Section */}
      <section className={styles.sectionGray}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionSubtitle}>Kelebihan Kami</span>
              <h2 className={styles.sectionTitle}>Mengapa Prime Property?</h2>
              <p className={styles.sectionDescription}>
                Kami selalu berkomitmen memberikan pelayanan terbaik demi mewujudkan properti impian Anda.
              </p>
            </div>
          </ScrollReveal>

          <div className={styles.featuresGrid}>
            <ScrollReveal delay={0.1}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Lokasi Strategis</h3>
                <p className={styles.featureDescription}>
                  Seluruh proyek ruko dan villa kami berlokasi di kawasan prima yang berkembang pesat dengan aksesibilitas tinggi.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    <line x1="12" y1="22" x2="12" y2="125" />
                    <line x1="12" y1="12" x2="22" y2="8.5" />
                    <line x1="12" y1="12" x2="2" y2="8.5" />
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Arsitektur Modern</h3>
                <p className={styles.featureDescription}>
                  Didesain secara fungsional dengan sentuhan estetika kontemporer yang elegan untuk menunjang gaya hidup modern.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Jaminan Mutu</h3>
                <p className={styles.featureDescription}>
                  Menggunakan bahan bangunan berkualitas premium serta pengerjaan detail yang presisi demi ketahanan jangka panjang.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Pelayanan Profesional</h3>
                <p className={styles.featureDescription}>
                  Tim agen internal kami yang berdedikasi siap mendampingi Anda di setiap langkah, mulai dari survei lokasi hingga serah terima.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.section} style={{ backgroundColor: "white" }}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionTitleContainer}>
              <span className={styles.sectionSubtitle}>Lokasi Proyek</span>
              <h2 className={styles.sectionTitle}>Jangkauan Kami</h2>
              <p className={styles.sectionDescription}>
                Peta sebaran proyek properti unggulan kami di kawasan strategis.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <MapSection />
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
