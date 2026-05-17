/// <reference lib="webworker" />
import { expose } from 'comlink';
import { resizeImageData } from './resize';
import type { CompressionSettings } from '../lib/types';

export interface CompressResult {
  buffer: ArrayBuffer;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

async function decodeToImageData(file: File): Promise<{ imageData: ImageData; mimeType: string }> {
  // createImageBitmap works in workers and supports all browser-native formats
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return { imageData, mimeType: file.type };
}

async function encodeImageData(
  imageData: ImageData,
  format: CompressionSettings['format'],
  sourceMime: string,
  quality: number
): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const targetMime =
    format === 'keep' ? sourceMime : `image/${format}`;

  try {
    if (targetMime === 'image/jpeg' || targetMime === 'image/jpg') {
      const { encodeJpeg } = await import('./codecs/jpeg');
      return { buffer: await encodeJpeg(imageData, quality), mimeType: 'image/jpeg' };
    }
    if (targetMime === 'image/png') {
      const { encodePng } = await import('./codecs/png');
      return { buffer: await encodePng(imageData), mimeType: 'image/png' };
    }
    if (targetMime === 'image/webp') {
      const { encodeWebp } = await import('./codecs/webp');
      return { buffer: await encodeWebp(imageData, quality), mimeType: 'image/webp' };
    }
    if (targetMime === 'image/avif') {
      const { encodeAvif } = await import('./codecs/avif');
      return { buffer: await encodeAvif(imageData, quality), mimeType: 'image/avif' };
    }
    // GIF input with "keep" → encode as PNG (no GIF encoder)
    if (targetMime === 'image/gif') {
      const { encodePng } = await import('./codecs/png');
      return { buffer: await encodePng(imageData), mimeType: 'image/png' };
    }
  } catch (_e) {
    // Fall through to canvas fallback
  }

  // Canvas fallback (JPEG/PNG only)
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  const fallbackMime =
    targetMime === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvas.convertToBlob({
    type: fallbackMime,
    quality: quality / 100,
  });
  return { buffer: await blob.arrayBuffer(), mimeType: fallbackMime };
}

async function compress(
  file: File,
  settings: CompressionSettings
): Promise<CompressResult> {
  const { imageData, mimeType } = await decodeToImageData(file);

  const resized = resizeImageData(
    imageData,
    settings.maxWidth,
    settings.maxHeight,
    settings.lockAspectRatio
  );

  const { buffer, mimeType: outMime } = await encodeImageData(
    resized,
    settings.format,
    mimeType,
    settings.quality
  );

  return {
    buffer,
    mimeType: outMime,
    width: resized.width,
    height: resized.height,
    size: buffer.byteLength,
  };
}

expose({ compress });
