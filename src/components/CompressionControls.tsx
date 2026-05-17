import { useStore } from '../lib/store';
import type { ImageFormat } from '../lib/types';
import { downloadJob } from '../lib/download';

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: 'keep', label: 'Keep original' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF (slow)' },
];

const PRESETS = [
  { label: '1920', value: 1920 },
  { label: '1280', value: 1280 },
  { label: '800', value: 800 },
];

export function CompressionControls() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const jobs = useStore((s) => s.jobs);
  const selectedJobId = useStore((s) => s.selectedJobId);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-2.5 border-b border-surface-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Quality */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Quality</label>
            <span className="text-sm font-mono text-brand-400">{settings.quality}</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Smaller</span>
            <span>Better</span>
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="text-sm font-medium text-white block mb-2">Output format</label>
          <div className="grid grid-cols-1 gap-1">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => updateSettings({ format: f.value })}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  settings.format === f.value
                    ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40'
                    : 'text-gray-400 hover:bg-surface-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resize */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Max width (px)</label>
            <button
              onClick={() =>
                updateSettings({
                  lockAspectRatio: !settings.lockAspectRatio,
                })
              }
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                settings.lockAspectRatio
                  ? 'border-brand-500/50 text-brand-400'
                  : 'border-surface-600 text-gray-500'
              }`}
            >
              {settings.lockAspectRatio ? '🔗 Locked' : '🔓 Free'}
            </button>
          </div>
          <input
            type="number"
            min={1}
            max={8000}
            placeholder="No limit"
            value={settings.maxWidth ?? ''}
            onChange={(e) =>
              updateSettings({
                maxWidth: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          <div className="flex gap-1 mt-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => updateSettings({ maxWidth: p.value })}
                className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
                  settings.maxWidth === p.value
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-surface-700 text-gray-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => updateSettings({ maxWidth: undefined })}
              className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
                !settings.maxWidth
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              Original
            </button>
          </div>

          <div className="mt-2">
            <label className="text-xs text-gray-500 block mb-1">Max height (px)</label>
            <input
              type="number"
              min={1}
              max={8000}
              placeholder="No limit"
              value={settings.maxHeight ?? ''}
              onChange={(e) =>
                updateSettings({
                  maxHeight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Per-image actions */}
        {selectedJob && (
          <div className="pt-2 border-t border-surface-700 space-y-2">
            {selectedJob.status === 'done' && (
              <button
                onClick={() => downloadJob(selectedJob)}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
              >
                Download
              </button>
            )}
            {(selectedJob.status === 'done' || selectedJob.status === 'error') && (
              <button
                onClick={() => useStore.getState().requeueJob(selectedJob.id)}
                className="w-full py-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-300 text-sm transition-colors"
              >
                Re-compress
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
