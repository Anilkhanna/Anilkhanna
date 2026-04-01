"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trendingSkills, techCategories, sectionHeadings } from "@/data/portfolio";

function CategoryRow({ label, items }: { label: string; items: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && contentRef.current) {
        setOverflows(contentRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [items]);

  const chipCls = "flex shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-surface px-5 py-2.5 font-mono text-sm font-medium transition-colors hover:border-accent hover:text-accent";

  return (
    <ScrollReveal>
      <div className="flex items-center gap-4 py-3">
        <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent shrink-0">
          {label}
        </span>
        <div ref={containerRef} className="group/marquee relative overflow-hidden flex-1">
          {overflows && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
            </>
          )}
          <div
            ref={contentRef}
            className={`flex gap-3 ${overflows ? "w-max animate-marquee group-hover/marquee:[animation-play-state:paused]" : ""}`}
          >
            {items.map((item) => (
              <div key={item} className={chipCls}>{item}</div>
            ))}
            {overflows && items.map((item) => (
              <div key={`dup-${item}`} className={chipCls}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function TechStack() {
  return (
    <section id="skills" className="px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.techStack.label}
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
            {sectionHeadings.techStack.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
        </ScrollReveal>
        <div className="space-y-1">
          {trendingSkills.length > 0 && (
            <CategoryRow label="TRENDING" items={trendingSkills} />
          )}
          {techCategories.map((cat) => (
            <CategoryRow key={cat.label} label={cat.label} items={cat.items} />
          ))}
        </div>
      </div>
    </section>
  );
}
