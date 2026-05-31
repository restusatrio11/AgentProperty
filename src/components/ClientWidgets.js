"use client";

import { usePathname } from "next/navigation";
import FloatingActions from "./FloatingActions";
import FeedbackWidget from "./FeedbackWidget";
import ScrollToTop from "./ScrollToTop";

export default function ClientWidgets() {
  const pathname = usePathname();
  
  // Hide widgets if we are in any agent-related page (login, dashboard, etc.)
  const isAgentPage = pathname?.startsWith("/agent");

  if (isAgentPage) return null;

  return (
    <>
      <ScrollToTop />
      <FloatingActions />
      <FeedbackWidget />
    </>
  );
}
