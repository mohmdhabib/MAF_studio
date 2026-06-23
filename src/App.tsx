import { useEffect } from 'react';
import { useUIStore } from './store/ui';
import { useAIStore } from './store/aiStore';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import { RightSidebar } from './components/RightSidebar';
import { ExportModal } from './components/ExportModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { showExportModal } = useUIStore();
  const fetchModels = useAIStore(state => state.fetchModels);
  useKeyboardShortcuts();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <div className="app-layout">
      <Toolbar />
      <div className="workspace-area animate-fade-in">
        <LayerPanel />
        <div className="canvas-container">
          <Canvas />
          <Timeline />
        </div>
        <RightSidebar />
      </div>
      {showExportModal && <ExportModal />}
    </div>
  );
}
