import { create } from 'zustand';
import { MAFScene, Layer, emptyScene } from '../schema/maf';
import { nanoid } from 'nanoid';

interface SceneStore {
  scene: MAFScene;
  selectedLayerId: string | null;
  currentTime: number;
  isPlaying: boolean;
  history: MAFScene[];
  historyIndex: number;

  setScene: (scene: MAFScene) => void;
  patchScene: (patch: Partial<MAFScene>) => void;
  selectLayer: (id: string | null) => void;
  setCurrentTime: (t: number) => void;
  setIsPlaying: (v: boolean) => void;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  reorderLayers: (from: number, to: number) => void;
  duplicateLayer: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  scene: emptyScene(),
  selectedLayerId: null,
  currentTime: 0,
  isPlaying: false,
  history: [emptyScene()],
  historyIndex: 0,

  pushHistory: () => {
    const { scene, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(scene)));
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  setScene: (scene) => {
    set({ scene });
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(scene)));
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  patchScene: (patch) => {
    set(s => ({ scene: { ...s.scene, ...patch } }));
  },

  selectLayer: (id) => set({ selectedLayerId: id }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setIsPlaying: (v) => set({ isPlaying: v }),

  addLayer: (layer) => {
    set(s => ({ scene: { ...s.scene, layers: [layer, ...s.scene.layers] } }));
    get().pushHistory();
  },

  removeLayer: (id) => {
    set(s => ({ scene: { ...s.scene, layers: s.scene.layers.filter(l => l.id !== id) }, selectedLayerId: null }));
    get().pushHistory();
  },

  updateLayer: (id, patch) => {
    set(s => ({
      scene: {
        ...s.scene,
        layers: s.scene.layers.map(l => l.id === id ? { ...l, ...patch } : l)
      }
    }));
  },

  reorderLayers: (from, to) => {
    set(s => {
      const layers = [...s.scene.layers];
      const [moved] = layers.splice(from, 1);
      layers.splice(to, 0, moved);
      return { scene: { ...s.scene, layers } };
    });
    get().pushHistory();
  },

  duplicateLayer: (id) => {
    const layer = get().scene.layers.find(l => l.id === id);
    if (!layer) return;
    const clone = JSON.parse(JSON.stringify(layer));
    clone.id = nanoid(8);
    clone.name = layer.name + ' copy';
    clone.transform.position.x += 20;
    clone.transform.position.y += 20;
    set(s => ({ scene: { ...s.scene, layers: [clone, ...s.scene.layers] } }));
    get().pushHistory();
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ scene: JSON.parse(JSON.stringify(history[newIndex])), historyIndex: newIndex });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ scene: JSON.parse(JSON.stringify(history[newIndex])), historyIndex: newIndex });
  },
}));
