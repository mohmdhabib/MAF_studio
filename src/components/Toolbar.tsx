import { useSceneStore } from '../store/scene';
import { useUIStore, Tool } from '../store/ui';

export function Toolbar() {
  const { scene, undo, redo, historyIndex, history } = useSceneStore();
  const { tool, setTool, toggleGrid, showGrid, setShowExportModal, setRightPanel } = useUIStore();
  const patchScene = useSceneStore(s => s.patchScene);

  const tools: { id: Tool; label: string; key: string }[] = [
    { id: 'select', label: '↖', key: 'V' },
    { id: 'rect', label: '▭', key: 'R' },
    { id: 'circle', label: '○', key: 'C' },
    { id: 'text', label: 'T', key: 'T' },
  ];

  return (
    <div className="glass-header" style={{
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0, gap: 12, zIndex: 10
    }}>
      {/* Left: logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6c63ff,#ff6584)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>M</div>
        <input
          value={scene.meta.name}
          onChange={e => patchScene({ meta: { ...scene.meta, name: e.target.value } })}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, width: 140, outline: 'none', fontFamily: 'Outfit, sans-serif' }}
        />
      </div>

      {/* Center: tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--bg-surface)', borderRadius: 8, padding: '3px', border: '1px solid var(--border)' }}>
        {tools.map(t => (
          <button key={t.id} title={`${t.id} (${t.key})`} onClick={() => setTool(t.id)} style={{
            width: 32, height: 28, background: tool === t.id ? 'var(--bg-elevated)' : 'none',
            border: tool === t.id ? '1px solid var(--border)' : '1px solid transparent',
            borderRadius: 6, color: tool === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <button title="Grid (G)" onClick={toggleGrid} style={{
          width: 32, height: 28, background: showGrid ? 'var(--bg-elevated)' : 'none',
          border: showGrid ? '1px solid var(--border)' : '1px solid transparent',
          borderRadius: 6, color: showGrid ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        }}>⊞</button>
      </div>

      {/* Right: undo/redo + export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'flex-end' }}>
        <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" style={{ ...iconBtn, opacity: historyIndex <= 0 ? 0.3 : 1 }}>↩</button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)" style={{ ...iconBtn, opacity: historyIndex >= history.length - 1 ? 0.3 : 1 }}>↪</button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <button className="btn btn-primary" onClick={() => { setShowExportModal(true); }} style={{
          padding: '8px 16px', fontSize: 13
        }}>🎬 Export Video</button>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 30, height: 28, background: 'none', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
};
