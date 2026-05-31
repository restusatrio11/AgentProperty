"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import ScrollReveal from "@/components/ScrollReveal";
import SearchBar from "@/components/SearchBar";
import styles from "./page.module.css";

const slides = [
  // Modern Tropical Villa (Indonesia vibe)
  "https://images.unsplash.com/photo-1580587767303-93693f77a8c0?q=80&w=1600&fm=webp",
  // Luxury Modern Residence
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&fm=webp",
  // Modern Commercial/Minimalist
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&fm=webp",
  // Tropical Zen Architecture
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?q=80&w=1600&fm=webp"
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000); // Slightly longer for more "relaxing" feel
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero} style={{ backgroundImage: 'none' }}>
      {/* Background Slider with Ken Burns Effect */}
      <div className={styles.heroSlider}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ 
              opacity: { duration: 2, ease: "easeInOut" },
              scale: { duration: 8, ease: "linear" } 
            }}
            className={styles.heroSlide}
            style={{ backgroundImage: `url(${slides[current]})` }}
          />
        </AnimatePresence>
        <div className={styles.heroOverlay} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <ScrollReveal>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Premium Real Estate</span>
            <h1 className={styles.heroTitle}>
              Temukan Hunian Eksklusif <br />
              <span className={styles.heroTitleHighlight}>Prime Property</span>
            </h1>
            <p className={styles.heroDescription}>
              Rangkaian ruko komersial dan villa mewah dengan desain modern, tata letak strategis, 
              dan nilai investasi yang terus meningkat. Layanan profesional khusus untuk kenyamanan Anda.
            </p>

            <SearchBar />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
