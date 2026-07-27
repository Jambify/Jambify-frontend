// scripts/prerender.mjs
import { chromium } from "playwright";
import chromiumBinary from "@sparticuz/chromium";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";

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

  // Preserve pristine SPA shell BEFORE prerendering overwrites index.html
  const pristineIndex = path.join("dist", "index.html");
  const appShell = path.join("dist", "app.html");
  fs.copyFileSync(pristineIndex, appShell);
  console.log(`Preserved pristine SPA shell → ${appShell}`);

  console.log("Launching headless browser...");
  const browser = await chromium.launch(
    process.env.VERCEL
      ? {
          args: chromiumBinary.args,
          executablePath: await chromiumBinary.executablePath(),
          headless: true,
        }
      : {
          ...(process.env.USE_SYSTEM_CHROME ? { channel: "chrome" } : {}),
          headless: true,
        }
  );

  const context = await browser.newContext();
  const page = await context.newPage();

  // Log browser activity neatly without spamming stderr for non-critical assets
  page.on("console", (msg) => {
    const text = msg.text();
    // Ignore known font MIME errors during headless build
    if (text.includes("fonts.googleapis.com") && text.includes("MIME type")) return;
    
    if (msg.type() === "error") {
      console.log(`  [browser console error] ${text}`);
    } else {
      console.log(`  [browser console] ${msg.type()}: ${text}`);
    }
  });

  page.on("pageerror", (err) => {
    console.log(`  [browser uncaught error] ${err.message}`);
  });

  for (const route of routes) {
    const url = `${base}${route}`;
    console.log(`Rendering ${url} ...`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log(`  [title right after load] ${await page.title()}`);

    if (route.startsWith("/guest/past-questions")) {
      try {
        await page.waitForSelector(
          '[data-testid="question-card"], [data-testid="no-results"]',
          { timeout: 15000 }
        );
      } catch {
        console.log(
          `  ⚠ Timed out waiting for question content on ${route} — saving whatever rendered.`
        );
      }
    } else {
      await page.waitForTimeout(600);
    }

    console.log(`  [title after wait] ${await page.title()}`);

    const html = await page.content();

    // Clean duplicate title tags from react-helmet-async
    const titleMatches = [...html.matchAll(/<title>.*?<\/title>/gs)];
    const cleanedHtml =
      titleMatches.length > 1
        ? titleMatches.slice(1).reduce((acc, m) => acc.replace(m[0], ""), html)
        : html;

    const liveTitle = await page.title();
    const escapedLiveTitle = liveTitle
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    if (titleMatches.length > 0 && !cleanedHtml.includes(`<title>${escapedLiveTitle}</title>`)) {
      console.log(
        `  ⚠ MISMATCH on ${route}: kept title doesn't match live page.title() ("${liveTitle}").`
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