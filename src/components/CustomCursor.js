"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHoverStart = (e) => {
      const target = e.target;
      if (
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHoverStart);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHoverStart);
    };
  }, [cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <>
      <style jsx global>{`
        @media (min-width: 1025px) {
          html, body, a, button, * {
            cursor: none !important;
          }
        }
      `}</style>
      
      <motion.div
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          position: "fixed",
          left: 0,
          top: 0,
          pointerEvents: "none",
          zIndex: 999999, // Increased z-index to stay on top of everything including modals
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        animate={{
          scale: isHovering ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        <svg 
          width="26" 
          height="26" 
          viewBox="0 0 24 24" 
          fill="#B33A3A"
          style={{
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
            transform: "rotate(-5deg)",
            opacity: 1 /* Full opacity for maximum visibility */
          }}
        >
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.83-4.83 2.3 5.17c.14.33.52.48.85.34l2.21-.98c.33-.14.48-.52.34-.85l-2.3-5.17h6.05c.31 0 .47-.38.25-.6l-14.83-14.23c-.22-.22-.6-.06-.6.25z" />
        </svg>
      </motion.div>
    </>
  );
}
