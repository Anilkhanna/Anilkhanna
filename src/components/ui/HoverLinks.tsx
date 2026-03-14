"use client";

import { cn } from "@/lib/utils";

interface HoverLinksProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function HoverLinks({ text, href, onClick, className }: HoverLinksProps) {
  const Tag = href ? "a" : "button";

  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-block overflow-hidden",
        className
      )}
    >
      <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
        {text}
      </span>
      <span className="absolute left-0 top-full inline-block text-accent transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
        {text}
      </span>
    </Tag>
  );
}
