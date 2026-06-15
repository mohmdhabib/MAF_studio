import { useEffect } from 'react';
import { useSceneStore } from '../store/scene';
import { useUIStore } from '../store/ui';

export function useKeyboardShortcuts() {
  const { undo, redo, removeLayer, selectedLayerId, duplicateLayer, setIsPlaying, isPlaying, setCurrentTime } = useSceneStore();
  const { setTool, toggleGrid, setShowExportModal } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === ' ') { e.preventDefault(); setIsPlaying(!isPlaying); return; }
      if (e.key === 'v' || e.key === 'V') { setTool('select'); return; }
      if (e.key === 'r' || e.key === 'R') { setTool('rect'); return; }
      if (e.key === 'c' || e.key === 'C') { setTool('circle'); return; }
      if (e.key === 't' || e.key === 'T') { setTool('text'); return; }
      if (e.key === 'g' || e.key === 'G') { toggleGrid(); return; }
      if (e.key === 'Escape') { useSceneStore.getState().selectLayer(null); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        removeLayer(selectedLayerId); return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === 'd' && selectedLayerId) { e.preventDefault(); duplicateLayer(selectedLayerId); return; }
        if (e.key === 'e') { e.preventDefault(); setShowExportModal(true); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, selectedLayerId]);
}
