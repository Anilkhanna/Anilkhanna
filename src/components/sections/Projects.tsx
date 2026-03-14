"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { projectsData, sectionHeadings } from "@/data/portfolio";

export function Projects() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      const scrollWidth = trackRef.current.scrollWidth;
      const clientWidth = trackRef.current.clientWidth;
      setDragConstraint(-(scrollWidth - clientWidth));
    }
  }, []);

  return (
    <section id="work" className="bg-surface overflow-hidden px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.projects.label}
          </span>
          <div className="flex items-end justify-between">
            <h2
              className="text-4xl font-bold"
              style={{
                backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {sectionHeadings.projects.title}
            </h2>
            {/* Drag indicator */}
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="hidden items-center gap-2 text-muted md:flex"
            >
              <FiArrowLeft size={14} className="text-accent" />
              <span className="font-mono text-xs tracking-wider">Drag to explore</span>
              <FiArrowRight size={14} className="text-accent" />
            </motion.div>
          </div>
          <div className="h-0.5 w-[60px] bg-accent" />
        </ScrollReveal>

        {/* Draggable track */}
        <motion.div
          ref={trackRef}
          className="flex cursor-grab gap-6 pr-[40%] active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: dragConstraint, right: 0 }}
        dragElastic={0.1}
      >
        {projectsData.map((project, i) => (
          <motion.div
            key={project.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group w-[350px] shrink-0 overflow-hidden rounded-xl border border-border bg-surface-hover"
          >
            {/* Image */}
            <div className="relative h-[200px] overflow-hidden">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/5 via-surface to-accent/10">
                  <span className="text-[4rem] font-bold text-foreground/5">
                    {project.number}
                  </span>
                </div>
              )}
              {project.liveUrl && project.liveUrl !== "#" && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent text-accent">
                    <FiArrowUpRight size={18} />
                  </div>
                </a>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold tracking-[1px] text-accent">
                  {project.category}
                </span>
                <span className="text-border">·</span>
                <span className="font-mono text-[11px] text-muted">
                  {project.tools}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {project.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {project.description}
              </p>
            </div>
          </motion.div>
        ))}
        </motion.div>
      </div>
    </section>
  );
}
