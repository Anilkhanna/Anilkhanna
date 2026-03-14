"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { techStack, sectionHeadings } from "@/data/portfolio";

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];

  return (
    <div className="group/marquee relative overflow-hidden py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex w-max gap-4 group-hover/marquee:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {doubled.map((tech, i) => (
          <div
            key={`${tech}-${i}`}
            className="flex items-center rounded-full border border-border bg-surface px-5 py-2.5 font-mono text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {tech}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  const mid = Math.ceil(techStack.length / 2);
  const row1 = techStack.slice(0, mid);
  const row2 = techStack.slice(mid);

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
        <div className="space-y-4">
          <MarqueeRow items={row1} />
          <MarqueeRow items={row2} reverse />
        </div>
      </div>
    </section>
  );
}
