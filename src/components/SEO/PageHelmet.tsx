import React from "react";
import { Helmet } from "react-helmet-async";

interface PageHelmetProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  keywords?: string;
  ogType?: string;
  children?: React.ReactNode;
}

/**
 * PageHelmet Component
 *
 * Provides per-page metadata management for SEO optimization.
 * Use this in any page component to set unique title, description, and OG tags.
 *
 * Example usage:
 * ```tsx
 * <PageHelmet
 *   title="Practice Quiz | SCHOOLDRA"
 *   description="Take a quick 10-question practice quiz to prepare for JAMB"
 *   ogImage="https://www.schooldra.com/quiz-og.png"
 * />
 * ```
 */
const PageHelmet: React.FC<PageHelmetProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  keywords,
  ogType = "website",
  children,
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {children}
    </Helmet>
  );
};

export default PageHelmet;
