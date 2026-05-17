import { create } from 'zustand';
import { nanoid } from './nanoid';
import type { ImageJob, CompressionSettings } from './types';
import { DEFAULT_SETTINGS, ACCEPTED_TYPES, MAX_FILES, MAX_FILE_SIZE } from './types';

interface AppStore {
  jobs: ImageJob[];
  selectedJobId: string | null;
  settings: CompressionSettings;
  darkMode: boolean;

  addFiles: (files: File[]) => string[];
  removeJob: (id: string) => void;
  clearAll: () => void;
  selectJob: (id: string | null) => void;
  updateJob: (id: string, patch: Partial<ImageJob>) => void;
  updateSettings: (patch: Partial<CompressionSettings>) => void;
  requeueAll: () => void;
  requeueJob: (id: string) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  jobs: [],
  selectedJobId: null,
  settings: DEFAULT_SETTINGS,
  darkMode: true,

  addFiles: (files) => {
    const { jobs } = get();
    const existing = jobs.length;
    const toAdd = files
      .filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false;
        if (f.size > MAX_FILE_SIZE) return false;
        return true;
      })
      .slice(0, MAX_FILES - existing);

    const newJobs: ImageJob[] = toAdd.map((file) => ({
      id: nanoid(),
      file,
      status: 'queued',
      original: {
        blob: file,
        width: 0,
        height: 0,
        size: file.size,
      },
      settings: { ...get().settings },
    }));

    set((s) => ({
      jobs: [...s.jobs, ...newJobs],
      selectedJobId: s.selectedJobId ?? (newJobs[0]?.id ?? null),
    }));

    return newJobs.map((j) => j.id);
  },

  removeJob: (id) =>
    set((s) => {
      const filtered = s.jobs.filter((j) => j.id !== id);
      const nextSelected =
        s.selectedJobId === id ? (filtered[0]?.id ?? null) : s.selectedJobId;
      return { jobs: filtered, selectedJobId: nextSelected };
    }),

  clearAll: () => set({ jobs: [], selectedJobId: null }),

  selectJob: (id) => set({ selectedJobId: id }),

  updateJob: (id, patch) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    // Re-queue all completed jobs when settings change
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.status === 'done' || j.status === 'error'
          ? { ...j, status: 'queued', settings: { ...s.settings } }
          : { ...j, settings: { ...s.settings } }
      ),
    }));
  },

  requeueAll: () =>
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.status !== 'processing'
          ? { ...j, status: 'queued', settings: { ...s.settings } }
          : j
      ),
    })),

  requeueJob: (id) =>
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id && j.status !== 'processing'
          ? { ...j, status: 'queued' }
          : j
      ),
    })),

  toggleDarkMode: () => {
    set((s) => {
      const next = !s.darkMode;
      document.documentElement.classList.toggle('dark', next);
      return { darkMode: next };
    });
  },
}));
