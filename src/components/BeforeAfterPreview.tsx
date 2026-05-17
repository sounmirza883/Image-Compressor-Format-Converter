import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../lib/store';
import { formatSize, formatReduction, reductionPercent } from '../lib/file-utils';

export function BeforeAfterPreview() {
  const jobs = useStore((s) => s.jobs);
  const selectedJobId = useStore((s) => s.selectedJobId);
  const job = jobs.find((j) => j.id === selectedJobId);

  const [divider, setDivider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<'split' | 'original' | 'compressed'>('split');
  const containerRef = useRef<HTMLDivElement>(null);

  const originalUrl = useObjectUrl(job?.original.blob ?? null);
  const compressedUrl = useObjectUrl(job?.compressed?.blob ?? null);

  const onMouseDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setDivider(Math.max(2, Math.min(98, x)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Select an image from the queue
      </div>
    );
  }

  const pct = job.compressed
    ? reductionPercent(job.original.size, job.compressed.size)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-700 flex-shrink-0">
        <div className="flex items-center gap-1 bg-surface-700 rounded-lg p-0.5">
          {(['split', 'original', 'compressed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-surface-600 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {pct !== null && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">
              {job.original.width}×{job.original.height}
            </span>
            {job.compressed && (
              <>
                <span className="text-gray-600">→</span>
                <span className="text-gray-400">
                  {job.compressed.width}×{job.compressed.height}
                </span>
              </>
            )}
            <span
              className={`font-semibold ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {formatReduction(job.original.size, job.compressed!.size)} •{' '}
              {formatSize(job.original.size)} → {formatSize(job.compressed!.size)}
            </span>
          </div>
        )}
      </div>

      {/* Preview area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#0a0a0f] select-none">
        {/* Checkerboard background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-conic-gradient(#1a1d27 0% 25%, #141620 0% 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        {tab === 'split' && originalUrl && (
          <>
            {/* Original (left side) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain relative z-10"
                draggable={false}
              />
            </div>

            {/* Compressed (right side, clipped) */}
            {compressedUrl && (
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - divider}% 0 0)` }}
              >
                <img
                  src={compressedUrl}
                  alt="Compressed"
                  className="max-w-full max-h-full object-contain relative z-10"
                  draggable={false}
                />
              </div>
            )}

            {/* Divider line */}
            {compressedUrl && (
              <div
                className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize"
                style={{ left: `${divider}%`, transform: 'translateX(-50%)' }}
                onMouseDown={onMouseDown}
              >
                <div className="w-0.5 h-full bg-white/60 pointer-events-none" />
                <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                  </svg>
                </div>
              </div>
            )}

            {/* Labels */}
            <div className="absolute bottom-3 left-3 z-30 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
              Original · {formatSize(job.original.size)}
            </div>
            {compressedUrl && job.compressed && (
              <div className="absolute bottom-3 right-3 z-30 text-xs bg-black/60 text-emerald-400 px-2 py-1 rounded-full">
                Compressed · {formatSize(job.compressed.size)}
              </div>
            )}
          </>
        )}

        {tab === 'original' && originalUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={originalUrl}
              alt="Original"
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </div>
        )}

        {tab === 'compressed' && compressedUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={compressedUrl}
              alt="Compressed"
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </div>
        )}

        {/* Processing overlay */}
        {job.status === 'processing' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-surface-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm text-gray-400">Compressing…</span>
            </div>
          </div>
        )}

        {job.status === 'error' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-400 text-sm font-medium">{job.error}</p>
            </div>
          </div>
        )}

        {job.status === 'queued' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            {originalUrl ? (
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain opacity-40"
                draggable={false}
              />
            ) : (
              <span className="text-gray-600 text-sm">Waiting to process…</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    const prev = prevRef.current;
    prevRef.current = next;
    return () => {
      if (prev) URL.revokeObjectURL(prev);
    };
  }, [blob]);

  return url;
}
