import { create } from 'zustand';

export type Tool = 'select' | 'rect' | 'circle' | 'text';
export type RightPanel = 'properties' | 'prompt' | 'json';

interface UIStore {
  tool: Tool;
  rightPanel: RightPanel;
  zoom: number;
  showGrid: boolean;
  showExportModal: boolean;
  isGenerating: boolean;
  generationStatus: string;
  promptHistory: string[];

  setTool: (t: Tool) => void;
  setRightPanel: (p: RightPanel) => void;
  setZoom: (z: number) => void;
  toggleGrid: () => void;
  setShowExportModal: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setGenerationStatus: (s: string) => void;
  addPromptHistory: (p: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  tool: 'select',
  rightPanel: 'prompt',
  zoom: 1,
  showGrid: false,
  showExportModal: false,
  isGenerating: false,
  generationStatus: 'Ready — describe an animation below',
  promptHistory: [],

  setTool: (t) => set({ tool: t }),
  setRightPanel: (p) => set({ rightPanel: p }),
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(3, z)) }),
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  setShowExportModal: (v) => set({ showExportModal: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGenerationStatus: (s) => set({ generationStatus: s }),
  addPromptHistory: (p) => set(s => ({
    promptHistory: [p, ...s.promptHistory.filter(h => h !== p)].slice(0, 10)
  })),
}));
