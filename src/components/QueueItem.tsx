import { useCallback, useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { formatSize, formatReduction } from '../lib/file-utils';
import { downloadJob } from '../lib/download';
import type { ImageJob } from '../lib/types';

interface Props {
  job: ImageJob;
  isSelected: boolean;
}

const statusColors: Record<string, string> = {
  queued: 'text-gray-400',
  processing: 'text-brand-400',
  done: 'text-emerald-400',
  error: 'text-red-400',
};

const statusLabels: Record<string, string> = {
  queued: 'Queued',
  processing: 'Processing…',
  done: 'Done',
  error: 'Error',
};

export function QueueItem({ job, isSelected }: Props) {
  const { selectJob, removeJob, requeueJob } = useStore();
  const thumbUrl = useThumb(job.file);

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      downloadJob(job);
    },
    [job]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeJob(job.id);
    },
    [job.id, removeJob]
  );

  const handleRequeue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      requeueJob(job.id);
    },
    [job.id, requeueJob]
  );

  return (
    <button
      onClick={() => selectJob(job.id)}
      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
        isSelected
          ? 'bg-brand-500/15 ring-1 ring-brand-500/40'
          : 'hover:bg-surface-700'
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-surface-700 overflow-hidden flex-shrink-0">
        {thumbUrl && (
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{job.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${statusColors[job.status]}`}>
            {statusLabels[job.status]}
          </span>
          {job.status === 'done' && job.compressed && (
            <span className="text-xs text-emerald-400">
              {formatReduction(job.original.size, job.compressed.size)}
            </span>
          )}
          {job.status === 'error' && (
            <span className="text-xs text-red-400 truncate">{job.error}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {job.status === 'processing' && (
          <svg className="animate-spin w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
        )}
        {job.status === 'done' && (
          <button
            onClick={handleDownload}
            className="p-1 rounded-lg hover:bg-surface-600 text-gray-400 hover:text-white transition-colors"
            title="Download"
          >
            <DownloadIcon />
          </button>
        )}
        {job.status === 'error' && (
          <button
            onClick={handleRequeue}
            className="p-1 rounded-lg hover:bg-surface-600 text-gray-400 hover:text-white transition-colors"
            title="Retry"
          >
            <RetryIcon />
          </button>
        )}
        <button
          onClick={handleRemove}
          className="p-1 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
          title="Remove"
        >
          <CloseIcon />
        </button>
      </div>

    </button>
  );
}

function useThumb(file: File): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
