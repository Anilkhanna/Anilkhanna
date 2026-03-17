"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { testimonials, sectionHeadings } from "@/data/portfolio";

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      const scrollWidth = trackRef.current.scrollWidth;
      const clientWidth = trackRef.current.clientWidth;
      setDragConstraint(-(scrollWidth - clientWidth));
    }
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="bg-surface overflow-hidden px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.testimonials.label}
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
              {sectionHeadings.testimonials.title}
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
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="w-[350px] shrink-0 rounded-xl border border-border bg-surface-hover p-6"
            >
              <div className="flex flex-col gap-4">
                {/* Quote */}
                <p className="text-sm italic leading-relaxed text-muted">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                  {testimonial.linkedinUrl && (
                    <a
                      href={testimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent transition-colors hover:text-foreground"
                    >
                      <FaLinkedin size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
