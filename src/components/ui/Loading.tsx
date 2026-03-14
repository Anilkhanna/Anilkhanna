"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingProps {
  onComplete: () => void;
}

export function Loading({ onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDone(true);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = useCallback(() => {
    if (!done) return;
    setExiting(true);
    setTimeout(onComplete, 800);
  }, [done, onComplete]);

  const displayProgress = Math.min(Math.floor(progress), 100);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          exit={{ scale: 3, opacity: 0, borderRadius: "50%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#e0f2f1] dark:bg-[#0a0e17]"
        >
          {/* Marquee background */}
          <div className="absolute inset-0 flex items-center overflow-hidden opacity-[0.06]">
            <div className="animate-marquee flex whitespace-nowrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="mx-8 text-[8vw] font-bold uppercase text-[#0a0e17] dark:text-[#e0f2f1]"
                >
                  Full Stack Developer &bull; Software Engineer &bull;
                </span>
              ))}
            </div>
          </div>

          {/* Loading button */}
          <motion.button
            onClick={handleEnter}
            whileHover={done ? { scale: 1.05 } : {}}
            whileTap={done ? { scale: 0.95 } : {}}
            className="relative z-10 overflow-hidden rounded-full bg-[#0a0e17] px-12 py-5 text-lg font-medium tracking-wider text-[#e0f2f1] transition-all dark:bg-[#e0f2f1] dark:text-[#0a0e17]"
          >
            <span className="relative z-10">
              {done ? "Welcome" : `Loading ${displayProgress}%`}
            </span>
            {!done && (
              <span
                className="ml-0.5 inline-block"
                style={{ animation: "blink 1s step-end infinite" }}
              >
                _
              </span>
            )}

            {/* Progress bar inside button */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-[#2dd4bf]"
              style={{ width: `${displayProgress}%` }}
              transition={{ ease: "linear" }}
            />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            clipPath: [
              "circle(100% at 50% 50%)",
              "circle(0% at 50% 50%)",
            ],
          }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-[#e0f2f1] dark:bg-[#0a0e17]"
        />
      )}
    </AnimatePresence>
  );
}
