import React from "react";
import styles from "./page.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.skeletonHero}>
        <div className={styles.skeletonTextLarge}></div>
        <div className={styles.skeletonTextMedium}></div>
        <div className={styles.skeletonButton}></div>
      </div>
      
      <div className="container" style={{ marginTop: "60px" }}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
