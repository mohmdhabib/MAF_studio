import { useUIStore } from './store/ui';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import { RightSidebar } from './components/RightSidebar';
import { ExportModal } from './components/ExportModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

console.log('[DEBUG] VITE_OLLAMA_API_BASE:', import.meta.env.VITE_OLLAMA_API_BASE);
console.log('[DEBUG] VITE_OLLAMA_MODEL:', import.meta.env.VITE_OLLAMA_MODEL);

export default function App() {
  const { showExportModal } = useUIStore();
  useKeyboardShortcuts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <LayerPanel />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Canvas />
          <Timeline />
        </div>
        <RightSidebar />
      </div>
      {showExportModal && <ExportModal />}
    </div>
  );
}
