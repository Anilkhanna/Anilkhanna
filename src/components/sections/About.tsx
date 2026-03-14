"use client";

import { motion } from "framer-motion";
import { aboutData, sectionHeadings } from "@/data/portfolio";
import Image from "next/image";

export function About() {
  return (
    <section id="about" className="px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:gap-[60px]">
        {/* Left column: label, title, line, image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex shrink-0 flex-col gap-4 lg:w-[300px]"
        >
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.about.label}
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
            {sectionHeadings.about.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
          <div className="relative mt-2 h-[300px] w-[260px] overflow-hidden rounded-lg border-2 border-accent">
            <Image
              src="/images/profile.jpg"
              alt="Anil Khanna"
              fill
              className="object-cover saturate-[0.85] contrast-[1.1] brightness-[1.05]"
              sizes="260px"
            />
          </div>
        </motion.div>

        {/* Right column: paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-6 lg:pt-10"
        >
          {aboutData.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-[1.7] text-muted"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
