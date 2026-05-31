"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    { label: "Beranda", path: "/" },
    { label: "Tentang Kami", path: "/tentang-kami" },
    { label: "Kontak", path: "/kontak" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoLink} onClick={closeMenu}>
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

        <nav className={styles.navWrapper}>
          <ul className={styles.navMenu}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actionArea}>
          <button
            className={`${styles.menuToggle} ${isOpen ? styles.menuToggleOpen : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavActive : ""}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
