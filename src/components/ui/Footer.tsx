"use client";

import { FiGithub, FiLinkedin } from "react-icons/fi";
import { siteConfig, socialLinks } from "@/data/portfolio";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FaGithub: FiGithub,
  FaLinkedin: FiLinkedin,
};

export function Footer() {
  return (
    <footer className="bg-surface px-6 py-10 md:px-[120px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6">
        {/* Divider */}
        <div className="h-px w-full bg-border" />

        {/* Content row */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-mono text-lg font-bold tracking-[2px] text-accent">
              AK
            </span>
            <span className="text-sm text-muted">
              Designed &amp; Built by {siteConfig.name}
            </span>
          </div>
          <div className="flex items-center gap-5">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return Icon ? (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition-colors hover:text-accent"
                >
                  <Icon size={24} />
                </a>
              ) : null;
            })}
          </div>
        </div>

        {/* Built with */}
        <p className="font-mono text-xs text-muted">
          Built with Next.js, Tailwind CSS &amp; Three.js
        </p>
      </div>
    </footer>
  );
}
