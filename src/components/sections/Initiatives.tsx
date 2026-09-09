"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight, FiLock } from "react-icons/fi";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { initiatives, sectionHeadings } from "@/data/portfolio";

export function Initiatives() {
  if (!initiatives || initiatives.length === 0) return null;

  return (
    <section id="initiatives" className="bg-surface px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.initiatives.label}
          </span>
          <h2
            className="text-4xl font-bold"
            style={{
              backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {sectionHeadings.initiatives.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            Nobody assigned me these. I hit the same bottleneck twice, proposed a fix, and built
            it.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {initiatives.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4 rounded-lg border border-border bg-surface-hover p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                <span className="shrink-0 rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent">
                  {item.status}
                </span>
              </div>

              <span className="font-mono text-[11px] tracking-wider text-muted">
                {item.context}
              </span>

              <p className="flex-1 text-sm leading-relaxed text-muted">{item.description}</p>

              <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="font-mono text-[11px] text-muted">{item.stack}</span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-accent transition-colors hover:text-foreground"
                  >
                    Visit
                    <FiArrowUpRight size={13} />
                  </a>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted">
                    <FiLock size={12} />
                    Internal
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
