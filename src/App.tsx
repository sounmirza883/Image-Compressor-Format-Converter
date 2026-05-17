import { useEffect, useCallback } from 'react';
import { useStore } from './lib/store';
import { initCompressionManager } from './lib/compressionManager';
import { DropZone } from './components/DropZone';
import { ImageQueue } from './components/ImageQueue';
import { BeforeAfterPreview } from './components/BeforeAfterPreview';
import { CompressionControls } from './components/CompressionControls';
import { StatsBar } from './components/StatsBar';
import { PrivacyBadge } from './components/PrivacyBadge';

initCompressionManager();

export default function App() {
  const jobs = useStore((s) => s.jobs);
  const addFiles = useStore((s) => s.addFiles);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const hasJobs = jobs.length > 0;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleFiles = useCallback(
    (files: File[]) => {
      addFiles(files);
    },
    [addFiles]
  );

  return (
    <div className="flex flex-col h-screen bg-surface-900 text-white overflow-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-700 flex-shrink-0 bg-surface-800">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tight">
            Image<span className="text-brand-400">Squeeze</span>
          </span>
          {hasJobs && (
            <label className="text-xs text-gray-600 hidden sm:block">
              Drop more images or paste (Ctrl+V)
            </label>
          )}
        </div>
        <div className="flex items-center gap-3">
          <PrivacyBadge />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main content */}
      {!hasJobs ? (
        <div className="flex-1 flex flex-col">
          <DropZone onFiles={handleFiles} />
        </div>
      ) : (
        <>
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Queue */}
            <aside className="w-72 flex-shrink-0 border-r border-surface-700 bg-surface-800 overflow-hidden flex flex-col">
              <ImageQueue />
            </aside>

            {/* Center: Preview */}
            <main className="flex-1 overflow-hidden flex flex-col">
              <BeforeAfterPreview />
            </main>

            {/* Right: Controls */}
            <aside className="w-56 flex-shrink-0 border-l border-surface-700 bg-surface-800 overflow-hidden flex flex-col">
              <CompressionControls />
            </aside>
          </div>

          <StatsBar />
        </>
      )}

      {/* Drag overlay when files are loaded */}
      {hasJobs && <DropZone onFiles={handleFiles} />}
    </div>
  );
}
