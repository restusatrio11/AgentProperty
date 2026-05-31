import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <div className={styles.logoArea}>
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logoWrapper}>
                <Image 
                  src="/logo.png" 
                  alt="Prime Property Logo" 
                  width={40} 
                  height={40} 
                  className={styles.logoImage}
                />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoTextMain}>Prime</span>
                <span className={styles.logoTextSub}>- Property -</span>
              </div>
            </Link>
          </div>
          <p className={styles.description}>
            Prime Property menghadirkan hunian ruko dan villa premium dengan jaminan mutu terbaik di kelasnya. Kami melayani kebutuhan properti Anda dengan integritas dan profesionalisme tinggi.
          </p>
        </div>

        <div>
          <h4 className={styles.title}>Menu</h4>
          <ul className={styles.linksList}>
            <li className={styles.linkItem}>
              <Link href="/">Beranda</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/tentang-kami">Tentang Kami</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/kontak">Kontak</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/agent/login" style={{ opacity: 0.6, fontSize: "12px" }}>Portal Agent</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.title}>Hubungi Kami</h4>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>Jl. Cemara Asri Boulevard No. 88, Cemara Asri, Medan 20371</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span>+62 61 8888 1234</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <span>info@primeproperty.co.id</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--color-accent-gold)" }}>
                Hubungi via WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.copyright}>
        <span>&copy; {new Date().getFullYear()} Prime Property. Hak Cipta Dilindungi.</span>
        <span>Premium Real Estate Agency</span>
      </div>
    </footer>
  );
}
