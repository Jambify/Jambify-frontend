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
// UPDATE: added the 13 subject-level /guest/past-questions/:subject routes,
// generated from ALL_SUBJECTS below (kept in sync with GuestPastQuestions.tsx)
// rather than typed out by hand. Year-level routes (/:subject/:year, ~143
// pages) are deliberately NOT included yet — rolling those out in a second
// phase once the subject pages are confirmed indexing, per the staged
// launch plan (avoids a large batch of near-identical new pages tripping
// a thin/duplicate-content flag).
//
// Why a fresh browser CONTEXT per route (not just a new page): a browser
// context is a fully isolated session — its own DOM/JS state, no shared
// carryover. Reusing a single page object across routes risked Helmet
// tags (or any other client state) from one route bleeding into the next,
// which is exactly what caused the duplicate/wrong-title bug on the
// first pass of this script.

import { chromium } from "playwright";
import chromiumBinary from "@sparticuz/chromium";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";

// Keep this list in sync with ALL_SUBJECTS in GuestPastQuestions.tsx.
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

// Only list PUBLIC routes here — routes a logged-out visitor or a search
// bot should be able to see. Do NOT add authenticated routes (/dashboard,
// /quiz, /performance, etc.) — those require a logged-in session and have
// no business being prerendered or indexed.
//
// IMPORTANT: "/" is deliberately LAST, not first. Rendering it writes the
// fully-rendered Landing page HTML straight into dist/index.html — which
// is ALSO the file Vite's preview server falls back to (history-API
// fallback) for any route whose own static file doesn't exist yet. If "/"
// ran first, every route processed afterward would briefly load that
// now-poisoned index.html (Landing's title/meta baked in) as its shell
// before React mounts and corrects it — and since Helmet can't strip tags
// it didn't render, Landing's stale title would linger alongside the
// correct one in every other page's prerendered output. Running "/" last
// means every other route still sees the pristine, untouched shell.
const routes = [
  "/guest",
  "/guest/quiz",
  "/guest/mock",
  "/guest/past-questions",
  ...ALL_SUBJECTS.map((s) => `/guest/past-questions/${s.toLowerCase()}`),
  "/guest/privacy-policy",
  "/guest/terms-of-service",
  "/signin",
  "/signup",
  "/",
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
  // Plain Playwright-managed Chromium — works locally (Windows/Mac/Linux)
  // and in Vercel's build container, since this runs at BUILD time, not
  // inside a serverless function. (@sparticuz/chromium was the wrong tool
  // here — that package is built for unpacking a Lambda-specific binary
  // inside a running serverless function, not a normal build step.)
  const browser = await chromium.launch(
    process.env.VERCEL
      ? {
          // Vercel's build container has no apt-get and is missing shared
          // libraries (libnspr4.so etc.) that regular Chromium binaries
          // expect — that's the "error while loading shared libraries"
          // failure. @sparticuz/chromium ships a self-contained binary
          // built specifically to run without those system libraries, so
          // use it whenever the VERCEL env var is present (Vercel sets
          // this automatically on every build — nothing to configure).
          args: chromiumBinary.args,
          executablePath: await chromiumBinary.executablePath(),
          headless: true,
        }
      : {
          // Local machine (or any non-Vercel environment): plain
          // Playwright-managed Chromium, optionally the system-installed
          // Chrome if USE_SYSTEM_CHROME is set (skips downloading).
          ...(process.env.USE_SYSTEM_CHROME ? { channel: "chrome" } : {}),
          headless: true,
        },
  );

  const context = await browser.newContext();
  const page = await context.newPage();

  // Surface any client-side errors or console output during headless
  // rendering — if a route silently fails to mount (React error, route
  // mismatch, failed data fetch), this is how we'll actually see why.
  page.on("console", (msg) => {
    console.log(`  [browser console] ${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.error(`  [browser error] ${err.message}`);
  });

  for (const route of routes) {
    const url = `${base}${route}`;
    console.log(`Rendering ${url} ...`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log(`  [title right after load] ${await page.title()}`);

    // Subject pages fetch questions from Supabase after mount — a flat
    // 600ms wait risks snapshotting the loading spinner instead of real
    // question content. Wait for either the question list or the "no
    // results" state to actually appear before capturing HTML.
    if (route.startsWith("/guest/past-questions")) {
      try {
        await page.waitForSelector(
          '[data-testid="question-card"], [data-testid="no-results"]',
          { timeout: 15000 },
        );
      } catch {
        console.warn(
          `  ⚠ Timed out waiting for question content on ${route} — saving whatever rendered.`,
        );
      }
    } else {
      await page.waitForTimeout(600);
    }

    console.log(`  [title after wait] ${await page.title()}`);

    const html = await page.content();

    // Helmet inserts its <title> BEFORE the static placeholder already in
    // index.html (confirmed empirically: page.title() above always
    // reflects Helmet's title, and the HTML spec has document.title read
    // from the FIRST <title> in tree order — so Helmet's tag ends up
    // first, not appended last as originally assumed). Keep the FIRST
    // match, strip any that come after it.
    const titleMatches = [...html.matchAll(/<title>.*?<\/title>/gs)];
    const cleanedHtml =
      titleMatches.length > 1
        ? titleMatches.slice(1).reduce((acc, m) => acc.replace(m[0], ""), html)
        : html;

    // Sanity check: whatever we just kept should match what the live
    // browser reported as the title. Browsers HTML-escape special
    // characters (& -> &amp;, etc.) when serializing text content, so
    // apply the same escaping to liveTitle before comparing — otherwise
    // titles containing "&" (like the homepage's) trigger a false
    // mismatch even when everything is actually correct.
    const liveTitle = await page.title();
    const escapedLiveTitle = liveTitle
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (titleMatches.length > 0 && !cleanedHtml.includes(`<title>${escapedLiveTitle}</title>`)) {
      console.warn(
        `  ⚠ MISMATCH on ${route}: kept title doesn't match live page.title() ("${liveTitle}"). Check title ordering assumptions.`,
      );
    }

    const outDir =
      route === "/" ? "dist" : path.join("dist", route.replace(/^\//, ""));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), cleanedHtml);

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
