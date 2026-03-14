"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCircleProps {
  className?: string;
  size?: number;
  color?: string;
}

export function GlowCircle({
  className,
  size = 300,
  color,
}: GlowCircleProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className={cn("pointer-events-none absolute rounded-full opacity-40 blur-[60px]", className)}
      style={{
        width: size,
        height: size,
        background: color || "var(--accent)",
        animation: "glow-pulse 4s ease-in-out infinite",
      }}
    />
  );
}
