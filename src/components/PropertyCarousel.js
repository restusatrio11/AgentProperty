"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import PropertySVGCard from "@/components/PropertySVGCard";
import Link from "next/link";
import styles from "@/app/(public)/page.module.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function PropertyCarousel({ properties }) {
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

  return (
    <Swiper
      spaceBetween={24}
      slidesPerView={1}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      breakpoints={{
        641: {
          slidesPerView: 2,
        },
        1025: {
          slidesPerView: 3,
        },
      }}
      modules={[Autoplay, Pagination, Navigation]}
      className="propertySwiper"
      style={{
        padding: "20px 4px 50px 4px",
        "--swiper-pagination-color": "var(--color-accent-gold)",
        "--swiper-pagination-bullet-inactive-color": "var(--color-gray-300)",
        "--swiper-pagination-bullet-inactive-opacity": "1",
        "--swiper-pagination-bullet-size": "10px",
        "--swiper-pagination-bullet-horizontal-gap": "6px"
      }}
    >
      {properties.map((property) => (
        <SwiperSlide key={property.id}>
          <Link href={`/properti/${property.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.card} style={{ height: "100%", margin: "0" }}>
              <PropertySVGCard 
                namaProperti={property.namaProperti} 
                tipe={property.tipe} 
                status={property.status} 
              />
              
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{property.namaProperti}</h3>
                </div>

                <div className={styles.badgeRow}>
                  <span className={`${styles.badge} ${property.tipe === "VILLA" ? styles.badgeVilla : styles.badgeRuko}`}>
                    {property.tipe}
                  </span>
                  <span className={`${styles.badge} ${property.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut}`}>
                    {property.status === "in_stock" ? "Tersedia" : "Terjual"}
                  </span>
                </div>

                <p className={styles.price}>{formatPrice(property.price)}</p>

                <div className={styles.specs}>
                  <div className={styles.specItem}>
                    <span>Dimensi: {Number(property.lebar)} x {Number(property.panjang)} m</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Lantai: {Number(property.tingkat)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
