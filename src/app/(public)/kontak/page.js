"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import ScrollReveal from "@/components/ScrollReveal";
import { Clock, MessageSquare, ChevronDown, ChevronUp, Zap } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    hp: "",
    subjek: "Umum",
    pesan: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [activeFaq, setActiveFaq] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama wajib diisi.";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama minimal 3 karakter.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Format email tidak valid.";
    }

    const cleanHp = formData.hp.trim().replace(/[^0-9]/g, "");
    if (!formData.hp.trim()) {
      newErrors.hp = "Nomor HP wajib diisi.";
    } else if (cleanHp.length < 10) {
      newErrors.hp = "Nomor HP minimal 10 digit angka.";
    }

    if (!formData.pesan.trim()) {
      newErrors.pesan = "Pesan wajib diisi.";
    } else if (formData.pesan.trim().length < 5) {
      newErrors.pesan = "Pesan minimal 5 karakter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ nama: "", email: "", hp: "", subjek: "Umum", pesan: "" });
        setToastType("success");
        setToastMessage(data.message || "Pesan terkirim, tim kami akan menghubungi Anda.");
      } else {
        setToastType("error");
        setToastMessage(data.error || "Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      q: "Apakah saya bisa survei lokasi di hari libur?",
      a: "Tentu saja! Tim agen kami siap mendampingi Anda untuk survei lokasi setiap hari, termasuk Sabtu dan Minggu, dengan perjanjian terlebih dahulu."
    },
    {
      q: "Bagaimana proses pembayaran properti di Prime Property?",
      a: "Kami mendukung berbagai metode pembayaran mulai dari Cash Keras, Cash Bertahap, hingga KPR melalui berbagai bank mitra terkemuka kami."
    },
    {
      q: "Apakah harga yang tertera sudah termasuk biaya notaris?",
      a: "Setiap unit memiliki kebijakan berbeda. Umumnya harga belum termasuk biaya AJB, BBN, dan BPHTB, namun kami sering memberikan promo subsidi biaya-biaya tersebut."
    }
  ];

  const subjectOptions = [
    { value: "Umum", label: "Pertanyaan Umum" },
    { value: "Survei", label: "Jadwal Survei Lokasi" },
    { value: "KPR", label: "Konsultasi KPR / Cicilan" },
    { value: "Investasi", label: "Peluang Investasi" },
    { value: "Lainnya", label: "Lainnya" }
  ];

  return (
    <div className={styles.container}>
      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage(null)} 
        type={toastType} 
      />

      {/* Hero Header */}
      <div className={styles.hero}>
        <ScrollReveal>
          <span className={styles.subtitle}>Hubungi Kami</span>
          <h1 className={styles.title}>Kontak Kami</h1>
        </ScrollReveal>
      </div>

      <div className={styles.grid}>
        {/* Contact Info column */}
        <div className={styles.infoSection}>
          <ScrollReveal direction="left">
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Informasi Kontak</h2>
              <ul className={styles.contactList}>
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <span className={styles.contactLabel}>Alamat Kantor</span>
                    <span className={styles.contactVal}>Jl. Cemara Asri Boulevard No. 88, Medan 20371</span>
                  </div>
                </li>
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <MessageSquare size={18} />
                  </span>
                  <div>
                    <span className={styles.contactLabel}>WhatsApp Direct</span>
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                      +62 812-3456-7890
                    </a>
                  </div>
                </li>
              </ul>

              {/* Operating Hours */}
              <div className={styles.hoursSection}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px", color: "var(--color-primary-black)" }}>
                  <Clock size={18} color="var(--color-accent-gold)" />
                  <span style={{ fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Jam Operasional</span>
                </div>
                <ul className={styles.hoursList}>
                  <li className={styles.hoursItem}>
                    <span className={styles.day}>Senin - Jumat</span>
                    <span className={styles.time}>09:00 - 18:00</span>
                  </li>
                  <li className={styles.hoursItem}>
                    <span className={styles.day}>Sabtu</span>
                    <span className={styles.time}>09:00 - 15:00</span>
                  </li>
                  <li className={styles.hoursItem}>
                    <span className={styles.day}>Minggu</span>
                    <span className={styles.time}>Dengan Perjanjian</span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Embed Google Maps */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className={styles.mapWrapper}>
              <iframe 
                className={styles.mapIframe}
                title="Lokasi Kantor Prime Property"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.821!2d98.713!3d3.628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303133cb4111394f%3A0xe54e3d0c2e307774!2sCemara%20Asri%2C%20Medan!5e0!3m2!1sid!2sid!4v1716612345678"
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </ScrollReveal>
        </div>

        {/* Contact Form column */}
        <div className={styles.formCard}>
          <div className={styles.trustBadge}>
            <Zap size={14} fill="white" />
            <span>Respon Cepat &lt; 2 Jam</span>
          </div>
          <ScrollReveal direction="right">
            <h2 className={styles.formTitle}>Kirim Pesan</h2>
            <p className={styles.formDescription}>
              Isi formulir di bawah ini, tim konsultan properti kami akan segera menghubungi Anda secara personal.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <Input
                  label="Nama Lengkap"
                  id="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  error={errors.nama}
                  placeholder="Nama Anda"
                />
                <Input
                  label="Nomor WhatsApp"
                  id="hp"
                  type="tel"
                  value={formData.hp}
                  onChange={handleChange}
                  error={errors.hp}
                  placeholder="0812..."
                />
              </div>
              
              <Input
                label="Alamat Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="email@anda.com"
              />

              <Input
                label="Subjek Pertanyaan"
                id="subjek"
                select
                options={subjectOptions}
                value={formData.subjek}
                onChange={handleChange}
              />

              <Input
                label="Pesan Anda"
                id="pesan"
                textarea
                value={formData.pesan}
                onChange={handleChange}
                error={errors.pesan}
                placeholder="Tuliskan detail pertanyaan Anda..."
              />

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? "Sedang Mengirim..." : "Kirim Pesan Sekarang"}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </div>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <ScrollReveal>
          <h2 className={styles.faqTitle}>Sering Ditanyakan (FAQ)</h2>
        </ScrollReveal>
        <div className={styles.faqGrid}>
          {faqData.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div 
                className={styles.faqItem}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className={styles.faqQuestion}>
                  <span>{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {activeFaq === i && (
                  <div className={styles.faqAnswer}>
                    {faq.a}
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
