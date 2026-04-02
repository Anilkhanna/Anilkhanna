"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
      }),
    }).catch(() => {}); // Silent fail
  }, [pathname]);

  return null;
}
