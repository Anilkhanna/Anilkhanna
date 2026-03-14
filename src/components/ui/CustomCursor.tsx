"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const requestRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });

  const cursorX = useSpring(0, { stiffness: 800, damping: 35 });
  const cursorY = useSpring(0, { stiffness: 800, damping: 35 });
  const ringX = useSpring(0, { stiffness: 120, damping: 20 });
  const ringY = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    // Watch for admin-page class on body
    const classObserver = new MutationObserver(() => {
      setVisible(!document.body.classList.contains("admin-page"));
    });
    classObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    setVisible(!document.body.classList.contains("admin-page"));

    const handleMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const addHoverListeners = () => {
      const els = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]'
      );
      els.forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };

    window.addEventListener("mousemove", handleMove);
    addHoverListeners();

    // Re-add listeners when DOM changes
    const domObserver = new MutationObserver(addHoverListeners);
    domObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(requestRef.current);
      classObserver.disconnect();
      domObserver.disconnect();
    };
  }, [cursorX, cursorY, ringX, ringY]);

  if (!visible) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6c3ff] mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
      />
      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6c3ff] mix-blend-difference"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hovered ? 60 : 50,
          height: hovered ? 60 : 50,
          opacity: hovered ? 0.6 : 0.4,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
