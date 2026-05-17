export type ImageFormat = 'keep' | 'jpeg' | 'png' | 'webp' | 'avif';

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface ImageMeta {
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

export interface CompressionSettings {
  quality: number;
  format: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
  lockAspectRatio: boolean;
}

export interface ImageJob {
  id: string;
  file: File;
  status: JobStatus;
  original: ImageMeta;
  compressed?: ImageMeta;
  settings: CompressionSettings;
  error?: string;
  progress?: number;
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 75,
  format: 'keep',
  lockAspectRatio: true,
};

export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const MAX_FILES = 50;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
