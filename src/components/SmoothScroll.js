"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Reset scroll position and resize on route change
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
    lenis.resize();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Timeout to ensure Next.js has completed rendering before calculating size
    const resizeTimeout = setTimeout(() => {
      lenis.resize();
    }, 150);

    return () => {
      clearTimeout(resizeTimeout);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
