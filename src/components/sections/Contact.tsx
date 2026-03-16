"use client";

import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { siteConfig, sectionHeadings } from "@/data/portfolio";

export function Contact() {
  return (
    <section id="contact" className="bg-surface px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        {/* Header */}
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.contact.label}
          </span>
          <h2
            className="text-[clamp(2.5rem,6vw,3rem)] font-bold"
            style={{
              backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {sectionHeadings.contact.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
        </ScrollReveal>

        {/* Description */}
        <ScrollReveal delay={0.1}>
          <p className="mb-4 max-w-[600px] text-lg leading-relaxed text-muted">
            I&apos;m open to senior and lead roles in Munich (onsite/hybrid) or
            remote. Looking for teams that build mobile or full stack products
            at scale. Have a role in mind? Let&apos;s talk.
          </p>
          <p className="mb-10 max-w-[600px] text-base leading-relaxed text-muted/70">
            Also available for freelance and consulting engagements.
          </p>
        </ScrollReveal>

        {/* CTA Button */}
        <ScrollReveal delay={0.2}>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mb-12 inline-block rounded-md bg-accent px-10 py-4 font-mono text-base font-semibold text-background transition-colors hover:bg-accent-hover"
          >
            Say Hello
          </a>
        </ScrollReveal>

        {/* Contact info row */}
        <ScrollReveal delay={0.3}>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-2 transition-colors hover:text-accent"
            >
              <FiMail size={18} className="text-accent" />
              <span className="font-mono text-[13px] font-medium text-muted">
                {siteConfig.email}
              </span>
            </a>
            {siteConfig.phone && (
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <FiPhone size={18} className="text-accent" />
                <span className="font-mono text-[13px] font-medium text-muted">
                  {siteConfig.phone}
                </span>
              </a>
            )}
            <div className="flex items-center gap-2">
              <FiMapPin size={18} className="text-accent" />
              <span className="font-mono text-[13px] font-medium text-muted">
                {siteConfig.location}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
