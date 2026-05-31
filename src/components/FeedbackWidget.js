"use client";

import React, { useState } from "react";
import styles from "./FeedbackWidget.module.css";
import { MessageSquare, X, Star, Send } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import Toast from "./Toast";

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    role: "",
    content: "",
    stars: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.content) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ message: "Feedback berhasil terkirim! Terima kasih.", type: "success" });
        setFormData({ nama: "", role: "", content: "", stars: 5 });
        setIsOpen(false);
      } else {
        setToast({ message: "Gagal mengirim feedback.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Terjadi kesalahan koneksi.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast 
        message={toast?.message} 
        type={toast?.type} 
        onClose={() => setToast(null)} 
      />

      {/* Floating Button */}
      <button 
        className={styles.floatingBtn} 
        onClick={() => setIsOpen(true)}
        aria-label="Berikan Feedback"
      >
        <MessageSquare size={20} />
        <span>Feedback</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Berikan Feedback Anda</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.ratingRow}>
                <label>Rating Anda:</label>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={24} 
                      fill={s <= formData.stars ? "var(--color-accent-gold)" : "none"}
                      color={s <= formData.stars ? "var(--color-accent-gold)" : "#ccc"}
                      onClick={() => setFormData({ ...formData, stars: s })}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>
              </div>

              <Input 
                label="Nama Lengkap" 
                id="nama" 
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama Anda"
                required
              />

              <Input 
                label="Pekerjaan / Jabatan (Opsional)" 
                id="role" 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Contoh: Pembeli Villa Golden Hill"
              />

              <Input 
                label="Pesan Feedback" 
                id="content" 
                textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Ceritakan pengalaman Anda bersama Prime Property..."
                required
              />

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : (
                  <>
                    <span>Kirim Feedback</span>
                    <Send size={18} style={{ marginLeft: "10px" }} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
