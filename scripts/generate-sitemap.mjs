// scripts/generate-sitemap.mjs
//
// Runs as part of the build (before or after prerender.mjs — order doesn't
// matter, this only writes dist/sitemap.xml). Generates the sitemap from
// the same route data as prerender.mjs, so adding a subject or a new
// static route in one place doesn't require a second manual edit here.

import fs from "node:fs";

const SITE = "https://www.schooldra.com";
const today = new Date().toISOString().split("T")[0];

// Keep in sync with ALL_SUBJECTS in GuestPastQuestions.tsx and prerender.mjs.
const ALL_SUBJECTS = [
  "Biology",
  "Chemistry",
  "Commerce",
  "CRS",
  "Economics",
  "English",
  "Geography",
  "Government",
  "History",
  "IRS",
  "Literature",
  "Mathematics",
  "Physics",
];

const urls = [
  {
    loc: `${SITE}/`,
    changefreq: "weekly",
    priority: "1.0",
    image: { loc: `${SITE}/SCHOOLDRA.LOGO.webp`, title: "SCHOOLDRA Logo" },
  },
  { loc: `${SITE}/signin`, changefreq: "monthly", priority: "0.6" },
  { loc: `${SITE}/signup`, changefreq: "monthly", priority: "0.6" },
  { loc: `${SITE}/guest`, changefreq: "monthly", priority: "0.8" },
  { loc: `${SITE}/guest/quiz`, changefreq: "weekly", priority: "0.8" },
  { loc: `${SITE}/guest/mock`, changefreq: "weekly", priority: "0.8" },
  { loc: `${SITE}/guest/past-questions`, changefreq: "weekly", priority: "0.8" },
  ...ALL_SUBJECTS.map((s) => ({
    loc: `${SITE}/guest/past-questions/${s.toLowerCase()}`,
    changefreq: "weekly",
    priority: "0.7",
  })),
  { loc: `${SITE}/guest/privacy-policy`, changefreq: "yearly", priority: "0.3" },
  { loc: `${SITE}/guest/terms-of-service`, changefreq: "yearly", priority: "0.3" },
];

const urlBlock = (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${
      u.image
        ? `
    <image:image>
      <image:loc>${u.image.loc}</image:loc>
      <image:title>${u.image.title}</image:title>
    </image:image>`
        : ""
    }
  </url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(urlBlock).join("\n")}
</urlset>
`;

fs.writeFileSync("dist/sitemap.xml", xml);
console.log(`Wrote dist/sitemap.xml with ${urls.length} URLs.`);
