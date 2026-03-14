"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { whatIDo, sectionHeadings } from "@/data/portfolio";
import { FiSmartphone, FiGlobe, FiServer, FiUsers } from "react-icons/fi";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  "MOBILE APPS": FiSmartphone,
  "WEB APPS": FiGlobe,
  "BACKEND & APIs": FiServer,
  "TEAM & DELIVERY": FiUsers,
};

export function WhatIDo() {
  return (
    <section className="bg-surface px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header - centered */}
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.whatIDo.label}
          </span>
          <h2
            className="text-4xl font-bold text-foreground"
            style={{
              backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {sectionHeadings.whatIDo.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
        </ScrollReveal>

        {/* Cards row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whatIDo.map((item, i) => {
            const Icon = iconMap[item.title] || FiGlobe;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col gap-4 rounded-lg border border-border bg-surface-hover p-7"
              >
                <Icon className="text-accent" size={28} />
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
