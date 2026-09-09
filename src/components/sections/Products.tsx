"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { FaApple } from "react-icons/fa";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { products, sectionHeadings } from "@/data/portfolio";

export function Products() {
  return (
    <section id="products" className="bg-background px-6 py-20 md:px-[120px] md:py-[80px]">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal className="mb-10 flex flex-col gap-4">
          <span className="font-mono text-[13px] font-semibold tracking-[2px] text-accent">
            {sectionHeadings.products.label}
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
            {sectionHeadings.products.title}
          </h2>
          <div className="h-0.5 w-[60px] bg-accent" />
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            My own products. I do the design, the code, and the App Store paperwork.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              data-reveal
      initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-muted">{product.number}</span>
                <span className="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent">
                  {product.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm font-medium leading-snug text-foreground/80">
                  {product.tagline}
                </p>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-muted">
                {product.description}
              </p>

              <div className="flex flex-col gap-1.5 border-t border-border pt-4 font-mono text-[11px] text-muted">
                <span>{product.stack}</span>
                <span className="text-accent">{product.model}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-accent transition-colors hover:text-foreground"
                >
                  Visit site
                  <FiArrowUpRight size={13} />
                </a>
                {product.storeUrl && (
                  <a
                    href={product.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-accent transition-colors hover:text-foreground"
                  >
                    <FaApple size={13} />
                    App Store
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
