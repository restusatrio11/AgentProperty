// src/app/agent/reset-password/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Criteria checks
  const [hasLength, setHasLength] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);

  const [strength, setStrength] = useState({
    entropy: 0,
    label: "Sangat Lemah",
    color: "#b33a3a",
    percentage: 10,
    status: "Weak",
  });

  // Calculate password strength whenever password changes
  useEffect(() => {
    const len = password.length >= 8;
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const num = /[0-9]/.test(password);
    const sym = /[^a-zA-Z0-9]/.test(password);

    setHasLength(len);
    setHasLower(lower);
    setHasUpper(upper);
    setHasNumber(num);
    setHasSymbol(sym);

    if (!password) {
      setStrength({
        entropy: 0,
        label: "Sangat Lemah",
        color: "#b33a3a",
        percentage: 10,
        status: "Weak",
      });
      return;
    }

    let poolSize = 0;
    if (lower) poolSize += 26;
    if (upper) poolSize += 26;
    if (num) poolSize += 10;
    if (sym) poolSize += 32;

    if (poolSize === 0) {
      setStrength({
        entropy: 0,
        label: "Sangat Lemah",
        color: "#b33a3a",
        percentage: 10,
        status: "Weak",
      });
      return;
    }

    // Entropy formula: E = L * log2(R)
    const entropy = password.length * Math.log2(poolSize);

    let label = "Lemah (Weak)";
    let color = "#b33a3a"; // Red
    let percentage = 33;
    let status = "Weak";

    if (password.length >= 8 && entropy >= 40 && entropy < 65) {
      label = "Sedang (Medium)";
      color = "#fd7e14"; // Orange
      percentage = 66;
      status = "Medium";
    } else if (password.length >= 8 && entropy >= 65) {
      label = "Kuat (Strong)";
      color = "#1b8a5a"; // Green
      percentage = 100;
      status = "Strong";
    }

    setStrength({ entropy, label, color, percentage, status });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate matching passwords
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    // Double check strength
    if (strength.status === "Weak") {
      setErrorMsg("Password Anda terlalu lemah. Silakan buat password yang lebih kuat.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengatur ulang password.");
      } else {
        setSuccessMsg(data.message || "Password berhasil diubah!");
        // The backend updated requiresPasswordReset = false and set a new cookie.
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/agent/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/agent/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      router.push("/agent/login");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.resetCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoContainer}>
            <span className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <div className={styles.logoText}>
              <span className={styles.logoTextMain}>Prime</span>
              <span className={styles.logoTextSub}>Property</span>
            </div>
          </div>
          <h1 className={styles.portalTitle}>Atur Ulang Password</h1>
          <p className={styles.portalSubtitle}>
            Akun Anda memerlukan pengaturan ulang password demi menjaga keamanan data listing properti.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && <div className={`${styles.alert} ${styles.alertDanger}`}>{errorMsg}</div>}
        {successMsg && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMsg}</div>}

        {/* Password Reset Form */}
        <form onSubmit={handleSubmit} className={styles.resetForm}>
          {/* New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password Baru
            </label>
            <input
              type="password"
              id="password"
              placeholder="Masukkan password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              disabled={loading}
              required
            />

            {/* Strength Meter Visualizer */}
            {password && (
              <div className={styles.strengthMeter}>
                <div className={styles.strengthLabel}>
                  <span style={{ color: "#a0a0a0" }}>Kekuatan Password:</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthProgress}
                    style={{
                      width: `${strength.percentage}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>

                {/* Checklist Criteria */}
                <div className={styles.strengthCriteria}>
                  <div className={`${styles.criterionItem} ${hasLength ? styles.criterionActive : ""}`}>
                    <span className={styles.criterionDot}></span>
                    Minimal 8 karakter
                  </div>
                  <div className={`${styles.criterionItem} ${hasUpper ? styles.criterionActive : ""}`}>
                    <span className={styles.criterionDot}></span>
                    Huruf besar (A-Z)
                  </div>
                  <div className={`${styles.criterionItem} ${hasLower ? styles.criterionActive : ""}`}>
                    <span className={styles.criterionDot}></span>
                    Huruf kecil (a-z)
                  </div>
                  <div className={`${styles.criterionItem} ${hasNumber ? styles.criterionActive : ""}`}>
                    <span className={styles.criterionDot}></span>
                    Angka (0-9)
                  </div>
                  <div className={`${styles.criterionItem} ${hasSymbol ? styles.criterionActive : ""}`} style={{ gridColumn: "span 2" }}>
                    <span className={styles.criterionDot}></span>
                    Karakter spesial (!@#$%^&*, dll)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.inputField}
              disabled={loading}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || strength.status === "Weak"}
          >
            {loading ? <span className={styles.spinner}></span> : "Simpan Password Baru"}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <button type="button" onClick={handleLogout} className={styles.backLink}>
            ← Batal & Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
