"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string }) => void };
  }
}

// GoatCounter counts the first page on its own. Moving between pages inside
// the site doesn't reload it, so count those visits here.
export function Analytics() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // the full address (with /home), the same way GoatCounter records the first page
    window.goatcounter?.count({ path: location.pathname });
  }, [path]);
  return null;
}
