"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/portfolio";
import { GlowCircle } from "@/components/ui/GlowCircle";
import dynamic from "next/dynamic";

const FloatingScene = dynamic(
  () =>
    import("@/components/three/FloatingScene").then((mod) => ({
      default: mod.FloatingScene,
    })),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Glow circles */}
      <GlowCircle className="-top-20 -left-20" size={350} />
      <GlowCircle className="top-1/3 -right-10" size={250} />

      {/* 3D Scene background */}
      <div className="absolute inset-0 z-0">
        <FloatingScene />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-24 md:px-[120px] md:py-[100px]">
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
        >
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-xs font-medium text-muted">
            Available for opportunities
          </span>
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 font-mono text-base font-medium tracking-wide text-accent"
        >
          {siteConfig.greeting}
        </motion.p>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-3 text-[clamp(3rem,8vw,4.5rem)] font-bold leading-[1.05] -tracking-[0.025em]"
          style={{
            backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {siteConfig.name}.
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-6 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.05] -tracking-[0.025em] text-muted"
        >
          {siteConfig.title}.
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-10 max-w-[680px] text-lg leading-relaxed text-muted"
        >
          {siteConfig.description}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex items-center gap-4"
        >
          <a
            href="#contact"
            className="rounded-md bg-accent px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-accent-hover"
          >
            Get In Touch
          </a>
          <a
            href={siteConfig.resumeUrl}
            className="rounded-md border border-accent px-8 py-4 text-base font-semibold text-accent transition-colors hover:bg-accent/10"
          >
            View Resume
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-2 pb-10"
      >
        <div className="h-[60px] w-px bg-accent" />
        <span className="font-mono text-[11px] font-medium tracking-[3px] text-muted">
          scroll down
        </span>
      </motion.div>
    </section>
  );
}
