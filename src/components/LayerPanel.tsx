import { useSceneStore } from '../store/scene';
import { useUIStore } from '../store/ui';
import { Layer } from '../schema/maf';
import { nanoid } from 'nanoid';

const typeColor: Record<string, string> = {
  rect: 'var(--layer-rect)', circle: 'var(--layer-circle)',
  text: 'var(--layer-text)', svg: 'var(--layer-svg)', group: 'var(--layer-group)',
};

const typeIcon: Record<string, string> = {
  rect: '▭', circle: '○', text: 'T', svg: '◈', group: '⊞',
};

export function LayerPanel() {
  const { scene, selectedLayerId, selectLayer, removeLayer, updateLayer, duplicateLayer, addLayer } = useSceneStore();
  const { tool } = useUIStore();

  const handleAddLayer = (type: Layer['type']) => {
    const id = `layer_${nanoid(6)}`;
    const base = {
      id, visible: true, locked: false, blendMode: 'normal' as const,
      transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } },
      keyframes: [],
    };
    if (type === 'rect') {
      addLayer({ ...base, name: 'Rectangle', type: 'rect', style: { width: 120, height: 80, fill: '#6c63ff', borderRadius: 8 } as any });
    } else if (type === 'circle') {
      addLayer({ ...base, name: 'Circle', type: 'circle', style: { radius: 40, fill: '#ec4899' } as any });
    } else if (type === 'text') {
      addLayer({ ...base, name: 'Text', type: 'text', style: { content: 'Text', fontSize: 32, fontWeight: '700', fontFamily: 'Inter, sans-serif', fill: '#ffffff', align: 'center' } as any });
    }
    selectLayer(id);
  };

  return (
    <div style={{ width: 200, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--bg-base)', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layers</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {(['rect', 'circle', 'text'] as const).map(t => (
            <button key={t} onClick={() => handleAddLayer(t)} title={`Add ${t}`} style={{
              width: 22, height: 22, background: 'none', border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit',
            }}>{typeIcon[t]}</button>
          ))}
        </div>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {scene.layers.length === 0 && (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
            No layers yet.<br />Generate or add a layer.
          </div>
        )}
        {scene.layers.map((layer, idx) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            isSelected={selectedLayerId === layer.id}
            onSelect={() => selectLayer(selectedLayerId === layer.id ? null : layer.id)}
            onToggleVisible={() => updateLayer(layer.id, { visible: !layer.visible })}
            onToggleLock={() => updateLayer(layer.id, { locked: !layer.locked })}
            onDelete={() => { removeLayer(layer.id); }}
            onDuplicate={() => duplicateLayer(layer.id)}
            onRename={(name) => updateLayer(layer.id, { name })}
          />
        ))}
      </div>
    </div>
  );
}

function LayerRow({ layer, isSelected, onSelect, onToggleVisible, onToggleLock, onDelete, onDuplicate, onRename }: {
  layer: Layer; isSelected: boolean;
  onSelect: () => void; onToggleVisible: () => void; onToggleLock: () => void;
  onDelete: () => void; onDuplicate: () => void; onRename: (n: string) => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
        background: isSelected ? 'var(--bg-elevated)' : 'none',
        borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[layer.type] || '#888', flexShrink: 0 }} />
      <input
        value={layer.name}
        onChange={e => { e.stopPropagation(); onRename(e.target.value); }}
        onClick={e => e.stopPropagation()}
        style={{ flex: 1, background: 'none', border: 'none', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
      />
      <button onClick={e => { e.stopPropagation(); onToggleVisible(); }} style={{ ...actionBtn, opacity: layer.visible ? 0.6 : 0.2 }}>👁</button>
      <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ ...actionBtn, opacity: 0.4, fontSize: 10 }}>✕</button>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'inherit',
};
