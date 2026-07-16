// scripts/prerender.mjs
//
// Runs AFTER `vite build`. Spins up a local static server for the built
// `dist/` folder, visits each public route in a real (headless) browser,
// waits for React + react-helmet-async to finish rendering, and saves the
// fully-rendered HTML to disk at that route's path.
//
// Why a fresh browser CONTEXT per route (not just a new page): a browser
// context is a fully isolated session — its own DOM/JS state, no shared
// carryover. Reusing a single page object across routes risked Helmet
// tags (or any other client state) from one route bleeding into the next,
// which is exactly what caused the duplicate/wrong-title bug on the
// first pass of this script.

import { chromium } from "playwright";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";

// Only list PUBLIC routes here — routes a logged-out visitor or a search
// bot should be able to see. Do NOT add authenticated routes (/dashboard,
// /quiz, /performance, etc.) — those require a logged-in session and have
// no business being prerendered or indexed.
const routes = [
  "/",
  "/guest",
  "/guest/quiz",
  "/guest/mock",
  "/guest/past-questions",
  "/guest/privacy-policy",
  "/guest/terms-of-service",
  "/signin",
  "/signup",
];

async function main() {
  console.log("Starting local preview server of dist/ ...");
  const server = await preview({ preview: { port: 4173 } });
  const base = "http://localhost:4173";

  console.log("Launching headless browser...");
  // ADD THESE ARGS to handle the Vercel/Linux environment
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const route of routes) {
    // Fresh, fully isolated context per route — no shared state, no risk
    // of the previous route's title/meta tags leaking into this one.
    const context = await browser.newContext();
    const page = await context.newPage();

    const url = `${base}${route}`;
    console.log(`Rendering ${url} ...`);

    await page.goto(url, { waitUntil: "networkidle" });
    // Small buffer so react-helmet-async and any client-side fetches
    // (e.g. dynamic counts, dates) have settled before we snapshot.
    await page.waitForTimeout(600);

    const html = await page.content();

    const outDir =
      route === "/" ? "dist" : path.join("dist", route.replace(/^\//, ""));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);

    console.log(`  → saved to ${path.join(outDir, "index.html")}`);

    await context.close();
  }

  await browser.close();
  await server.httpServer.close();
  console.log("Prerendering complete.");
}

main().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
