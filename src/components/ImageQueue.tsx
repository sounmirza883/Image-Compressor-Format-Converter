import { useStore } from '../lib/store';
import { QueueItem } from './QueueItem';
import { downloadAllAsZip } from '../lib/download';

export function ImageQueue() {
  const jobs = useStore((s) => s.jobs);
  const selectedJobId = useStore((s) => s.selectedJobId);
  const clearAll = useStore((s) => s.clearAll);
  const doneCount = jobs.filter((j) => j.status === 'done').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-surface-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Queue ({jobs.length})
        </span>
        <div className="flex items-center gap-1">
          {doneCount > 1 && (
            <button
              onClick={() => downloadAllAsZip(jobs)}
              className="text-xs px-2 py-1 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
            >
              ZIP all
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs px-2 py-1 rounded-lg text-gray-500 hover:text-white hover:bg-surface-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {jobs.map((job) => (
          <QueueItem
            key={job.id}
            job={job}
            isSelected={job.id === selectedJobId}
          />
        ))}
      </div>
    </div>
  );
}
