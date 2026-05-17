import { useRef, useCallback } from 'react';
import { useDropzone } from '../hooks/useDropzone';
import { useClipboardPaste } from '../hooks/useClipboardPaste';
import { validateFile } from '../lib/file-utils';
import { useStore } from '../lib/store';

interface Props {
  onFiles: (files: File[]) => void;
}

export function DropZone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const jobs = useStore((s) => s.jobs);

  const handleValidated = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => !validateFile(f));
      if (valid.length) onFiles(valid);
    },
    [onFiles]
  );

  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useDropzone(handleValidated);

  useClipboardPaste(handleValidated);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      handleValidated(files);
      e.target.value = '';
    },
    [handleValidated]
  );

  // Overlay drop zone when files are already loaded
  if (jobs.length > 0) {
    return (
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity ${
          isDragOver ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute inset-4 border-2 border-dashed border-brand-400 rounded-2xl bg-brand-500/10 backdrop-blur-sm flex items-center justify-center">
          <p className="text-brand-400 text-xl font-medium">Drop images to add to queue</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors ${
        isDragOver ? 'bg-brand-500/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleInput}
        className="hidden"
      />

      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-surface-600 hover:border-brand-500/50 hover:bg-surface-800'
        }`}
      >
        <div className="text-5xl mb-4">🖼️</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Drop images here
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          or click to browse · paste from clipboard (Ctrl+V)
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
          {['JPEG', 'PNG', 'WebP', 'GIF', 'AVIF'].map((f) => (
            <span key={f} className="px-2 py-1 bg-surface-700 rounded-full">
              {f}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-700 mt-4">
          Up to 50 files · 50 MB each
        </p>
      </div>
    </div>
  );
}
