import { saveAs } from 'file-saver';
import type { ImageJob } from './types';
import { getMimeType, getOutputFilename } from './file-utils';

export function downloadJob(job: ImageJob) {
  if (!job.compressed) return;
  const mime = getMimeType(job.settings.format, job.file.type);
  const filename = getOutputFilename(job.file.name, mime);
  saveAs(job.compressed.blob, filename);
}

export async function downloadAllAsZip(jobs: ImageJob[]) {
  const done = jobs.filter((j) => j.status === 'done' && j.compressed);
  if (!done.length) return;

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (const job of done) {
    const mime = getMimeType(job.settings.format, job.file.type);
    const filename = getOutputFilename(job.file.name, mime);
    const buf = await job.compressed!.blob.arrayBuffer();
    zip.file(filename, buf);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'compressed-images.zip');
}
