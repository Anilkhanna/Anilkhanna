"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { navLinks, siteConfig } from "@/data/portfolio";
import { HoverLinks } from "./HoverLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, type: string) => {
    if (type === "page") {
      router.push(href);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Nav fade gradient at top */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-40 h-24 bg-gradient-to-b from-background/80 to-transparent" />

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-sm font-bold uppercase tracking-widest"
          >
            {siteConfig.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </a>

          {/* Center - Email (hidden on mobile) */}
          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden text-xs tracking-wider text-muted transition-colors hover:text-accent md:block"
          >
            {siteConfig.email}
          </a>

          {/* Right - Nav links + Theme toggle */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <HoverLinks
                key={link.href}
                text={link.label}
                onClick={() => handleNavClick(link.href, link.type)}
                className="text-xs font-medium uppercase tracking-[3px] text-foreground"
              />
            ))}
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>
    </>
  );
}
