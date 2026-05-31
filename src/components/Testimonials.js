"use client";

import React, { useEffect, useState } from "react";
import styles from "./Testimonials.module.css";
import { Quote, Star } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        if (data.testimonials) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error("Gagal mengambil testimoni:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <ScrollReveal>
          <div className={styles.header}>
            <span className={styles.subtitle}>Suara Pelanggan</span>
            <h2 className={styles.title}>Apa Kata Mereka?</h2>
          </div>
        </ScrollReveal>

        <div className={styles.carouselWrapper}>
          <Swiper
            key={testimonials.length} // Force re-mount when data arrives
            spaceBetween={0}
            slidesPerView={1}
            centeredSlides={false}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className={styles.swiper}
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={t.id || i}>
                <div className={styles.card}>
                  <Quote className={styles.quoteIcon} size={40} />
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={16} 
                        fill={idx < t.stars ? "var(--color-accent-gold)" : "none"} 
                        color={idx < t.stars ? "var(--color-accent-gold)" : "#ccc"} 
                      />
                    ))}
                  </div>
                  <p className={styles.content}>{t.content}</p>
                  <div className={styles.divider} />
                  <div className={styles.author}>
                    <div className={styles.avatar}>
                      {t.nama.charAt(0)}
                    </div>
                    <div>
                      <h4 className={styles.name}>{t.nama}</h4>
                      <p className={styles.role}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
