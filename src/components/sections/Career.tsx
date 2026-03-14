"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { careerData, sectionHeadings } from "@/data/portfolio";

export function Career() {
  return (
    <section id="career" className="px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        {/* Heading */}
        <ScrollReveal className="mb-12 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.career.label}
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
            {sectionHeadings.career.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
        </ScrollReveal>

        {/* Career entries */}
        <div className="flex flex-col">
          {careerData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col gap-6 border-b border-border py-8 last:border-b-0 md:flex-row md:gap-8"
            >
              {/* Date */}
              <div className="shrink-0 md:w-[160px]">
                <span className="font-mono text-[13px] font-medium text-accent">
                  {item.period}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-accent">
                  {item.company}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
