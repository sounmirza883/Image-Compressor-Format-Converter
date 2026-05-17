import type { ImageFormat } from './types';

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatReduction(original: number, compressed: number): string {
  const pct = ((original - compressed) / original) * 100;
  return `${pct >= 0 ? '-' : '+'}${Math.abs(pct).toFixed(1)}%`;
}

export function reductionPercent(original: number, compressed: number): number {
  return ((original - compressed) / original) * 100;
}

export function getMimeType(format: ImageFormat, originalType: string): string {
  if (format === 'keep') return originalType;
  return `image/${format}`;
}

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
  };
  return map[mimeType] ?? 'jpg';
}

export function getOutputFilename(
  originalName: string,
  outputMime: string
): string {
  const dotIdx = originalName.lastIndexOf('.');
  const stem = dotIdx >= 0 ? originalName.slice(0, dotIdx) : originalName;
  const ext = getExtension(outputMime);
  return `${stem}-compressed.${ext}`;
}

export function validateFile(file: File): string | null {
  const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!accepted.includes(file.type)) {
    return `Unsupported format: ${file.type || 'unknown'}`;
  }
  if (file.size > 50 * 1024 * 1024) {
    return `File too large (max 50 MB): ${file.name}`;
  }
  return null;
}
