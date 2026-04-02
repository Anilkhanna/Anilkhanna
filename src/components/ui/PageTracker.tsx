"use client";

import { useEffect, useRef } from "react";

export function PageTracker() {
  const lastPath = useRef("");

  useEffect(() => {
    const path = window.location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || "",
      }),
    }).catch(() => {});
  }, []);

  return null;
}
