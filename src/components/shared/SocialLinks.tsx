// src/components/shared/SocialLinks.tsx
import React from "react";
import {  SiInstagram, SiX } from "react-icons/si";
import { cn } from "../../lib/utils/utils";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/shreda_shadrach?igsh=MWdzYnQ4b2psenRvbQ==", 
    Icon:  SiInstagram,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/sha_dra_ch", 
    Icon: SiX,
  },
];

interface SocialLinksProps {
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="bg-bgSurface border-borderMuted text-textDim hover:text-brand hover:border-brand/30 flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-90"
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;