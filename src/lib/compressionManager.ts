import { wrap, type Remote } from 'comlink';
import pLimit from 'p-limit';
import { useStore } from './store';
import type { CompressResult } from '../workers/compressor.worker';
import type { CompressionSettings } from './types';

const POOL_SIZE = Math.min(navigator.hardwareConcurrency || 4, 4);

type WorkerApi = Remote<{ compress: (file: File, settings: CompressionSettings) => Promise<CompressResult> }>;

let pool: WorkerApi[] | null = null;
let roundRobin = 0;

function getPool(): WorkerApi[] {
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const w = new Worker(
        new URL('../workers/compressor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      return wrap<{ compress: WorkerApi['compress'] }>(w) as WorkerApi;
    });
  }
  return pool;
}

function nextWorker(): WorkerApi {
  const p = getPool();
  const w = p[roundRobin % POOL_SIZE];
  roundRobin++;
  return w;
}

const limit = pLimit(POOL_SIZE);

async function processJob(jobId: string) {
  const store = useStore.getState();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job || job.status !== 'queued') return;

  store.updateJob(jobId, { status: 'processing' });

  try {
    const worker = nextWorker();
    const result = await worker.compress(job.file, job.settings);

    const blob = new Blob([result.buffer], { type: result.mimeType });
    useStore.getState().updateJob(jobId, {
      status: 'done',
      compressed: {
        blob,
        width: result.width,
        height: result.height,
        size: result.size,
      },
    });
  } catch (err) {
    useStore.getState().updateJob(jobId, {
      status: 'error',
      error: err instanceof Error ? err.message : 'Compression failed',
    });
  }
}

let processing = false;

function drainQueue() {
  if (processing) return;
  processing = true;

  const tick = () => {
    const { jobs } = useStore.getState();
    const queued = jobs.filter((j) => j.status === 'queued');
    if (queued.length === 0) {
      processing = false;
      return;
    }
    for (const job of queued) {
      limit(() => processJob(job.id));
    }
    setTimeout(tick, 200);
  };

  tick();
}

export function initCompressionManager() {
  // Pre-warm the worker pool
  getPool();

  useStore.subscribe((state, prev) => {
    const hasQueued = state.jobs.some((j) => j.status === 'queued');
    const hadQueued = prev.jobs.some((j) => j.status === 'queued');
    if (hasQueued && !hadQueued) drainQueue();
    if (hasQueued) drainQueue();
  });
}
