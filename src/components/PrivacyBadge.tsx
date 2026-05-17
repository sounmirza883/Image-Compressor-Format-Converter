import { useState } from 'react';

export function PrivacyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 hover:bg-emerald-400/20 transition-colors"
      >
        <span>🔒</span>
        <span>100% local — files never leave your device</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-3">How it works</h2>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                <span className="text-white font-medium">Zero uploads.</span> Your images are
                processed entirely inside your browser using WebAssembly codecs — the same
                technology used by Google's Squoosh.
              </p>
              <p>
                <span className="text-white font-medium">No server contact.</span> After this page
                loads, no network requests are made. You can disconnect from the internet and
                compression will still work.
              </p>
              <p>
                <span className="text-white font-medium">No storage.</span> Files are kept in
                memory and automatically released after you download. Closing the tab erases
                everything.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-white text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
