# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Privacy-first, browser-based image compression and format conversion tool. All processing runs client-side via WASM codecs and Web Workers — zero server uploads, ever.

## Commands

```bash
# Dev server
node node_modules/vite/bin/vite.js          # workaround for & in dir name
npm run dev                                  # works if shell escapes & correctly

# Build
npm run build                               # vite build only (no tsc step)
npm run typecheck                           # tsc -b separately
npm run preview
```

> The directory name contains `&` which breaks `npm run` on Windows. Run Vite directly via `node node_modules/vite/bin/vite.js` if npm scripts fail.

## Stack

- **React 19 + Vite 8 + TypeScript** — framework and bundler (Vite 8 uses rolldown)
- **Tailwind CSS v4 + @tailwindcss/vite** — no config file needed; configured via CSS `@theme`
- **Zustand v5** — global state (`src/lib/store.ts`)
- **@jsquash/jpeg|png|webp|avif** — Squoosh's WASM codecs, lazy-imported per format inside the worker
- **Comlink** — Web Worker RPC (`src/workers/compressor.worker.ts`)
- **JSZip** — lazy-imported only when "Download all" is triggered
- **file-saver** — cross-browser download triggers
- **p-limit** — concurrency cap on the worker pool

## Architecture

```
UI (React) → Zustand store → Compression Manager → Web Worker Pool (Comlink RPC)
```

1. **Zustand store** (`src/lib/store.ts`) holds `ImageJob[]` queue and global `CompressionSettings`. All UI reads/writes go through the store.
2. **Compression Manager** (`src/lib/compressionManager.ts`) subscribes to the store, detects newly-queued jobs, and dispatches them to the worker pool via `p-limit` (capped at `navigator.hardwareConcurrency || 4`, max 4).
3. **Worker** (`src/workers/compressor.worker.ts`) receives a job, decodes via `createImageBitmap` (universal, supports all browser-native formats including GIF), resizes via `OffscreenCanvas`, then encodes using the appropriate `@jsquash` codec. Returns `{ buffer, mimeType, width, height, size }` via Comlink.
4. **Codecs** (`src/workers/codecs/`) are per-format lazy imports — only the needed WASM loads per job.

## Core Types

```ts
// src/lib/types.ts
type ImageJob = {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'done' | 'error';
  original: { blob: Blob; width: number; height: number; size: number };
  compressed?: { blob: Blob; width: number; height: number; size: number };
  settings: CompressionSettings;
  error?: string;
};

type CompressionSettings = {
  quality: number;           // 0–100, default 75
  format: 'keep' | 'jpeg' | 'png' | 'webp' | 'avif';
  maxWidth?: number;
  maxHeight?: number;
  lockAspectRatio: boolean;
};
```

## Key Constraints

- **Zero network requests after initial load** — no analytics, no external resources.
- **Codecs are lazy** — `@jsquash/*` imports live only inside the worker, only triggered per format needed. This keeps the initial JS bundle small.
- **Blob lifecycle** — `useObjectUrl` hook in `BeforeAfterPreview.tsx` revokes URLs on cleanup; `QueueItem.tsx` does the same for thumbnails.
- **Decode strategy** — uses `createImageBitmap(file)` + `OffscreenCanvas.getImageData()` for universal decoding (handles GIF first-frame, AVIF, WebP natively). jsquash is used for *encoding* only.
- **GIF input** — decoded (first frame only) then re-encoded as PNG when format is "keep".
- **AVIF encode** — slow (5–30s); shown with "(slow)" label in the format selector.
- **Canvas fallback** — if a jsquash encoder throws, falls back to `OffscreenCanvas.convertToBlob()`.

## Vite 8 / Rolldown Notes

- `vite-plugin-top-level-await` is **NOT compatible** with Vite 8 (uses rolldown, not rollup). Removed — use `build.target: 'esnext'` instead.
- `vite-plugin-wasm` handles WASM imports from `@jsquash/*` in both main bundle and worker bundles.
- `worker.plugins: () => [wasm()]` is required so the worker bundle also gets WASM handling.
- `optimizeDeps.exclude: ['@jsquash/*']` prevents Vite from pre-bundling these WASM packages.

## Dark Mode

Tailwind v4 dark variant is configured as `@variant dark (&:where(.dark, .dark *))` in `src/index.css`. Toggle by adding/removing the `dark` class on `<html>`. The store's `toggleDarkMode` action handles this.

## GitHub Remote

`git@github.com:sounmirza883/Image-Compressor-Format-Converter.git`
