"use client";

import React, { useState } from "react";
import styles from "./LogoWall.module.css";

const LogoWall = ({
  items = [],
  direction = "left",
  pauseOnHover = true,
  speed = 100, // Duration in seconds (higher is slower)
  logoHeight = "40px",
  gap = "4rem",
  bgColor = "transparent",
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const containerStyle = {
    "--duration": `${speed}s`,
    "--gap": gap,
    "--logo-height": logoHeight,
    "--bg": bgColor,
  };

  const animationClass = direction === "left" ? styles.scrollLeft : styles.scrollRight;

  return (
    <div
      className={styles.container}
      style={containerStyle}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Optional: Fade effect on edges */}
      <div className={styles.overlay} />

      <div
        className={`${styles.marquee} ${isPaused ? styles.paused : ""} ${animationClass}`}
      >
        {/* Duplicate items multiple times to create seamless loop */}
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className={styles.logoItem}
          >
            {item.imgUrl ? (
              <img
                src={item.imgUrl}
                alt={item.altText || "Partner Logo"}
                className={styles.logoImage}
              />
            ) : (
              <span className={styles.logoText}>{item.altText}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoWall;
