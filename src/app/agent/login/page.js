// src/app/agent/login/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./page.module.css";

export default function AgentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutTime) return;

    const timer = setInterval(() => {
      const remainingMs = lockoutTime - Date.now();
      if (remainingMs <= 0) {
        setLockoutTime(null);
        setError("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  const validateForm = () => {
    if (!email || !email.includes("@")) {
      setError("Format email tidak valid.");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password minimal 6 karakter.");
      return false;
    }
    if (!captchaToken) {
      setError("Silakan centang 'I'm not a robot'.");
      return false;
    }
    return true;
  };

  const getRemainingTimeString = () => {
    if (!lockoutTime) return "";
    const remainingMs = lockoutTime - Date.now();
    if (remainingMs <= 0) return "";

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.ceil((remainingMs % 60000) / 1000);

    let timeStr = "";
    if (minutes > 0) {
      timeStr += `${minutes} menit `;
    }
    timeStr += `${seconds} detik`;
    return timeStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          captchaToken, // Use reCAPTCHA token instead of manual text
          rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Do not set loading to false here, so the button stays in "loading" state during redirect
        router.push("/agent/dashboard");
        router.refresh();
      } else {
        if (response.status === 423 || response.status === 429) {
          setError(data.error);
          if (response.status === 423) {
            setLockoutTime(Date.now() + 15 * 60 * 1000);
          }
        } else {
          setError(
            data.error ||
              "Gagal masuk. Silakan periksa kembali email dan password.",
          );
          // Reset captcha token after failure
          setCaptchaToken(null);
          if (window.grecaptcha) {
            window.grecaptcha.reset();
          }
        }
        setLoading(false); // Only stop loading on error
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Koneksi gagal. Silakan periksa koneksi internet Anda.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background House Decorations */}
      <div className={styles.backgroundDecor}>
        <div
          className={styles.houseElement}
          style={{ top: "10%", left: "5%", width: "120px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div
          className={styles.houseElement}
          style={{ top: "65%", left: "8%", width: "150px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M2 20v-8a2 2 0 0 1 2-2h1l1-6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1l1 6h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
            <rect x="10" y="14" width="4" height="8" />
          </svg>
        </div>
        <div
          className={styles.houseElement}
          style={{ top: "15%", right: "10%", width: "180px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
          </svg>
        </div>
        <div
          className={styles.houseElement}
          style={{ bottom: "15%", right: "5%", width: "130px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div
          className={styles.houseElement}
          style={{ top: "45%", right: "15%", width: "90px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M2 22h20V8L12 2L2 8v14zm10-14l5 5h-3v7h-4v-7H7l5-5z" />
          </svg>
        </div>
        <div
          className={styles.houseElement}
          style={{ bottom: "10%", left: "20%", width: "100px" }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
          </svg>
        </div>
      </div>

      <div className={styles.loginCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoContainer}>
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
          </div>
          <h1 className={styles.portalTitle}>Admin Panel</h1>
          <p className={styles.portalSubtitle}>
            Masuk untuk mengelola listing properti
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div
            className={`${styles.alert} ${lockoutTime ? styles.alertDanger : styles.alertWarning}`}
          >
            {lockoutTime ? (
              <div>
                <p className={styles.alertTitle}>Akun Terkunci Sementara</p>
                <p className={styles.alertContent}>
                  Silakan coba lagi dalam:{" "}
                  <strong>{getRemainingTimeString()}</strong>
                </p>
              </div>
            ) : (
              error
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email Agent
            </label>
            <input
              type="email"
              id="email"
              placeholder="agent@primeproperty.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              disabled={loading || !!lockoutTime}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <div className={styles.passwordFieldWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                style={{ paddingRight: "45px" }}
                disabled={loading || !!lockoutTime}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || !!lockoutTime}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Google reCAPTCHA Section */}
          <div
            className={styles.captchaContainer}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <ReCAPTCHA
              sitekey={siteKey || "MISSING_SITE_KEY"}
              onChange={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          <div className={styles.optionsGroup}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
                disabled={loading || !!lockoutTime}
              />
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !!lockoutTime}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            {loading && <span className={styles.spinner}></span>}
            {loading ? "Memproses..." : "Masuk Portal"}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <Link href="/" className={styles.backLink}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
