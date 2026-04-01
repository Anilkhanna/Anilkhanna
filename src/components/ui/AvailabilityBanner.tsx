"use client";

import { availability } from "@/data/portfolio";

export function AvailabilityBanner() {
  if (!availability.isAvailable) return null;

  const parts = [availability.roles, availability.domains, availability.location];
  if (availability.freelance) parts.push("Also open to freelance");
  const message = parts.join(" · ");

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] w-full bg-accent text-white text-center py-2 px-4 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span><span className="font-medium">Available for hire</span> — {message}</span>
      </span>
    </div>
  );
}
