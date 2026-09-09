"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export function MotionReady() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    document.documentElement.dataset.motion = "ready";
  }, [reduceMotion]);

  return null;
}
