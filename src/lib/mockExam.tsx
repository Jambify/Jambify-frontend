import React from "react";
import { sanitizeHtml } from "./mockExamUtils";

export const HtmlContent: React.FC<{
  html?: string;
  as?: "div" | "p" | "span";
  className?: string;
}> = ({ html = "", as = "div", className }) => {
  const Component = as;
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

export const QuestionMedia: React.FC<{
  src?: string;
  alt?: string;
  className?: string;
}> = ({ src, alt = "Question diagram", className }) => {
  if (!src) return null;

  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="rounded-brand border-borderMuted bg-bgSurface max-h-72 w-full border object-contain"
      />
    </figure>
  );
};
