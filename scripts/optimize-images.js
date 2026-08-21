#!/usr/bin/env node
/**
 * Compress raster assets and emit WebP siblings for OptimizedImage <picture> fallbacks.
 * Run: npm run optimize:images
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INPUT_DIRS = [
  path.join(ROOT, "src", "assets"),
  path.join(ROOT, "public"),
];
const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (RASTER_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);
  const webpOut = `${base}.webp`;

  const image = sharp(filePath);
  const meta = await image.metadata();

  if (ext === ".png") {
    await image.png({ quality: 80, compressionLevel: 9 }).toFile(filePath);
  } else {
    await image.jpeg({ quality: 80, mozjpeg: true }).toFile(filePath);
  }

  await sharp(filePath).webp({ quality: 75 }).toFile(webpOut);

  const [origStat, webpStat] = await Promise.all([stat(filePath), stat(webpOut)]);

  return {
    file: path.relative(ROOT, filePath),
    webp: path.relative(ROOT, webpOut),
    width: meta.width,
    height: meta.height,
    bytes: origStat.size,
    webpBytes: webpStat.size,
  };
}

async function main() {
  const allFiles = (
    await Promise.all(INPUT_DIRS.map((dir) => walk(dir)))
  ).flat();

  if (allFiles.length === 0) {
    console.log("No PNG/JPEG files found under src/assets or public.");
    return;
  }

  await mkdir(path.join(ROOT, "src", "assets-optimized"), { recursive: true });

  console.log(`Optimizing ${allFiles.length} image(s)…\n`);

  const results = [];
  for (const file of allFiles) {
    try {
      const result = await optimizeFile(file);
      results.push(result);
      console.log(
        `  ✓ ${result.file} → ${result.webp} (${result.webpBytes} B webp)`,
      );
    } catch (err) {
      console.error(`  ✗ ${path.relative(ROOT, file)}:`, err.message);
    }
  }

  console.log(`\n✅ Done — ${results.length} file(s) optimized.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
