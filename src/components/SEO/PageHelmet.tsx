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

// Site-wide constants that used to live only in the static index.html
// "Primary Meta Tags" block. Moved here so PageHelmet is the single source
// of truth for every social/SEO tag — nothing left split between a static
// file and this component, which is what caused the duplicate-tag bug.
const DEFAULT_OG_IMAGE = "https://www.schooldra.com/SCHOOLDRA.LOGO.webp";
const SITE_NAME = "SCHOOLDRA";
const LOCALE = "en_NG";
const TWITTER_HANDLE = "@schooldra";

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
 *   canonical="https://www.schooldra.com/quiz"
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
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={LOCALE} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonical && <meta property="twitter:url" content={canonical} />}
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta property="twitter:creator" content={TWITTER_HANDLE} />

      {children}
    </Helmet>
  );
};

export default PageHelmet;