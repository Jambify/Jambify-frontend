// scripts/prerender.mjs
//
// Runs AFTER `vite build`. Spins up a local static server for the built
// `dist/` folder, visits each public route in a real (headless) browser,
// waits for React + react-helmet-async to finish rendering, and saves the
// fully-rendered HTML to disk at that route's path.
//
// FIX: previously, the "/" route's prerendered HTML was written straight
// to dist/index.html — which is ALSO the file Vercel's catch-all rewrite
// (`/(.*) -> /`) falls back to for every route with no static file of its
// own (dashboard, admin, quiz, etc). That meant every one of those routes
// briefly rendered the full landing page on refresh, before React
// hydrated and the router swapped in the real content.
//
// Fix: copy the PRISTINE Vite-built index.html (bare shell, before any
// route overwrites it) to dist/app.html first. That becomes the fallback
// target in vercel.json. dist/index.html still gets the prerendered
// landing page for direct SEO hits on "/" — Vercel serves exact static
// file matches before applying rewrites, so that keeps working exactly
// as before.
//
// Why a fresh browser CONTEXT per route (not just a new page): a browser
// context is a fully isolated session — its own DOM/JS state, no shared
// carryover. Reusing a single page object across routes risked Helmet
// tags (or any other client state) from one route bleeding into the next,
// which is exactly what caused the duplicate/wrong-title bug on the
// first pass of this script.

import { chromium } from "playwright-core";
import chromiumBinary from "@sparticuz/chromium";
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

  // ── Preserve the pristine SPA shell BEFORE anything overwrites it ──
  // This is what Vercel's catch-all rewrite will fall back to for every
  // route that has no prerendered static file of its own.
  const pristineIndex = path.join("dist", "index.html");
  const appShell = path.join("dist", "app.html");
  fs.copyFileSync(pristineIndex, appShell);
  console.log(`Preserved pristine SPA shell → ${appShell}`);

  console.log("Launching headless browser...");
  // ADD THESE ARGS to handle the Vercel/Linux environment
  const browser = await chromium.launch({
  args: chromiumBinary.args,
  executablePath: await chromiumBinary.executablePath(),
  headless: true,
});

  const context = await browser.newContext();
const page = await context.newPage();

for (const route of routes) {
  const url = `${base}${route}`;
  console.log(`Rendering ${url} ...`);

await page.goto(url, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
  await page.waitForTimeout(600);

  const html = await page.content();

  const outDir =
    route === "/" ? "dist" : path.join("dist", route.replace(/^\//, ""));

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);

  console.log(`  → saved to ${path.join(outDir, "index.html")}`);
}

await context.close();

  await browser.close();
  await server.httpServer.close();
  console.log("Prerendering complete.");
}

main().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
