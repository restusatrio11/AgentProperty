"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({
  message,
  type = "success", // success | error | info
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, type, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <span className={`${styles.icon} ${styles.successIcon}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </span>
        );
      case "error":
        return (
          <span className={`${styles.icon} ${styles.errorIcon}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </span>
        );
      default:
        return (
          <span className={`${styles.icon} ${styles.goldIcon}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </span>
        );
    }
  };

  const getToastClass = () => {
    switch (type) {
      case "success":
        return `${styles.toast} ${styles.toastSuccess}`;
      case "error":
        return `${styles.toast} ${styles.toastError}`;
      default:
        return styles.toast;
    }
  };

  return (
    <div className={styles.toastContainer}>
      <div className={getToastClass()} role="alert">
        {getIcon()}
        <span className={styles.message}>{message}</span>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
