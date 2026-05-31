"use client";

import React from "react";
import { MessageCircle, Camera, Globe, BookOpen } from "lucide-react";
import styles from "./FloatingActions.module.css";

const FloatingActions = () => {
  // Placeholder links - should be replaced with real ones
  const links = {
    whatsapp: "https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20properti%20Anda.",
    instagram: "https://instagram.com/primeproperty",
    facebook: "https://facebook.com/primeproperty",
    catalog: "/catalog-property.pdf"
  };

  return (
    <div className={styles.container}>
      {/* Catalog Button */}
      <a 
        href={links.catalog} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${styles.fab} ${styles.catalog}`}
        title="Unduh Katalog"
      >
        <BookOpen size={24} />
        <span className={styles.tooltip}>Katalog Properti</span>
      </a>

      {/* Facebook Button */}
      <a 
        href={links.facebook} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${styles.fab} ${styles.facebook}`}
        title="Facebook"
      >
        <Globe size={24} />
        <span className={styles.tooltip}>Facebook Kami</span>
      </a>

      {/* Instagram Button */}
      <a 
        href={links.instagram} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${styles.fab} ${styles.instagram}`}
        title="Instagram"
      >
        <Camera size={24} />
        <span className={styles.tooltip}>Instagram Kami</span>
      </a>

      {/* WhatsApp Button - Primary CTA */}
      <a 
        href={links.whatsapp} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${styles.fab} ${styles.whatsapp}`}
        title="Chat WhatsApp"
      >
        <MessageCircle size={26} />
        <span className={styles.tooltip}>Tanya via WhatsApp</span>
      </a>
    </div>
  );
};

export default FloatingActions;
