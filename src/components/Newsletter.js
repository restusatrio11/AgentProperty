"use client";

import React, { useState } from "react";
import styles from "./Newsletter.module.css";
import { Send, CheckCircle } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <div className="container">
        <div className={styles.newsletterCard}>
          <div className={styles.content}>
            <h2 className={styles.title}>Dapatkan Katalog Eksklusif</h2>
            <p className={styles.description}>
              Berlangganan untuk mendapatkan informasi proyek terbaru, promo khusus, dan tips investasi properti langsung di email Anda.
            </p>
          </div>
          
          <div className={styles.formWrapper}>
            {subscribed ? (
              <div className={styles.successMessage}>
                <CheckCircle size={24} />
                <span>Terima kasih! Katalog telah dikirim ke email Anda.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                  type="email" 
                  placeholder="Alamat Email Anda" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">
                  <span>Daftar Sekarang</span>
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
