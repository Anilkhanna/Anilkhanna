"use client";

import { useRef, useCallback } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
} from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";
import { IconType } from "react-icons";
import { socialLinks, siteConfig } from "@/data/portfolio";
import { HoverLinks } from "./HoverLinks";

const iconMap: Record<string, IconType> = {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
};

function MagneticIcon({
  icon: Icon,
  href,
  label,
}: {
  icon: IconType;
  href: string;
  label: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex h-10 w-10 items-center justify-center text-muted transition-all duration-300 ease-out hover:text-accent"
      aria-label={label}
    >
      <Icon size={20} />
    </a>
  );
}

export function SocialIcons() {
  return (
    <>
      {/* Social icons - fixed left */}
      <div className="fixed bottom-8 left-6 z-40 hidden flex-col gap-4 lg:flex">
        {socialLinks.map((link) => {
          const Icon = iconMap[link.icon];
          if (!Icon) return null;
          return (
            <MagneticIcon
              key={link.name}
              icon={Icon}
              href={link.url}
              label={link.name}
            />
          );
        })}
      </div>

      {/* Resume button - fixed right */}
      <div className="fixed bottom-8 right-6 z-40 hidden lg:block">
        <a
          href="/resume"
          className="group flex items-center gap-1 text-xs font-medium uppercase tracking-[3px] text-muted transition-colors hover:text-accent"
        >
          <HoverLinks text="Resume" className="text-xs font-medium uppercase tracking-[3px]" />
          <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={14} />
        </a>
      </div>
    </>
  );
}
