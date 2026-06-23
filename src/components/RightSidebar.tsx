import { useUIStore, RightPanel } from '../store/ui';
import { PropertiesPanel } from './PropertiesPanel';
import { PromptPanel } from './PromptPanel';
import { MafPanel } from './MafPanel';

const tabs: { id: RightPanel; label: string }[] = [
  { id: 'prompt', label: '✦ Prompt' },
  { id: 'properties', label: '⊞ Properties' },
  { id: 'json', label: '{ } JSON' },
];

export function RightSidebar() {
  const { rightPanel, setRightPanel } = useUIStore();

  return (
    <div className="glass-panel" style={{ width: 280, display: 'flex', flexDirection: 'column', margin: '0 0', flexShrink: 0, borderRadius: 0, borderRight: 'none', borderTop: 'none', borderBottom: 'none' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setRightPanel(t.id)} style={{
            flex: 1, padding: '9px 4px', background: 'none', border: 'none',
            borderBottom: rightPanel === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            color: rightPanel === t.id ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', overflow: 'hidden',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {rightPanel === 'prompt' && <PromptPanel />}
        {rightPanel === 'properties' && <PropertiesPanel />}
        {rightPanel === 'json' && <MafPanel />}
      </div>
    </div>
  );
}
