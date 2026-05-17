import { useStore } from '../lib/store';
import { formatSize, reductionPercent } from '../lib/file-utils';

export function StatsBar() {
  const jobs = useStore((s) => s.jobs);
  const done = jobs.filter((j) => j.status === 'done' && j.compressed);

  if (!done.length) return null;

  const totalOriginal = done.reduce((a, j) => a + j.original.size, 0);
  const totalCompressed = done.reduce((a, j) => a + j.compressed!.size, 0);
  const pct = reductionPercent(totalOriginal, totalCompressed);

  return (
    <div className="flex items-center justify-center gap-6 text-sm py-3 border-t border-surface-700 bg-surface-800/50">
      <span className="text-gray-400">
        {done.length} of {jobs.length} done
      </span>
      <span className="text-gray-400">
        {formatSize(totalOriginal)} → {formatSize(totalCompressed)}
      </span>
      <span className={pct >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
        {pct >= 0 ? '↓' : '↑'} {Math.abs(pct).toFixed(1)}% total savings
      </span>
    </div>
  );
}
