import { useState } from 'react';
import { useSceneStore } from '../store/scene';
import { Layer, RectStyle, CircleStyle, TextStyle } from '../schema/maf';

type Tab = 'transform' | 'style' | 'keyframes';

export function PropertiesPanel() {
  const { scene, selectedLayerId, updateLayer, currentTime, pushHistory } = useSceneStore();
  const layer = scene.layers.find(l => l.id === selectedLayerId);
  const [tab, setTab] = useState<Tab>('transform');

  if (!layer) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, gap: 8 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>◈</div>
        <div>Select a layer to edit</div>
      </div>
    );
  }

  const updateTransform = (key: string, val: any) => {
    const t = { ...layer.transform, [key]: val };
    updateLayer(layer.id, { transform: t });
  };

  const updateStyle = (patch: any) => {
    updateLayer(layer.id, { style: { ...layer.style, ...patch } as any });
  };

  const addKeyframe = () => {
    const props: any = {
      opacity: layer.transform.opacity,
      scale: { ...layer.transform.scale },
      position: { ...layer.transform.position },
    };
    const newKf = { time: currentTime, properties: props, easing: 'easeOutCubic' as const };
    const keyframes = [...layer.keyframes.filter(k => k.time !== currentTime), newKf]
      .sort((a, b) => a.time - b.time);
    updateLayer(layer.id, { keyframes });
    pushHistory();
  };

  const s = layer.style as any;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {(['transform', 'style', 'keyframes'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 4px', background: 'none',
            border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'transform' && (
          <>
            <Row label="X" value={layer.transform.position.x} onChange={v => updateTransform('position', { ...layer.transform.position, x: v })} />
            <Row label="Y" value={layer.transform.position.y} onChange={v => updateTransform('position', { ...layer.transform.position, y: v })} />
            <Row label="Scale X" value={layer.transform.scale.x} onChange={v => updateTransform('scale', { ...layer.transform.scale, x: v })} step={0.01} />
            <Row label="Scale Y" value={layer.transform.scale.y} onChange={v => updateTransform('scale', { ...layer.transform.scale, y: v })} step={0.01} />
            <Row label="Rotation" value={layer.transform.rotation} onChange={v => updateTransform('rotation', v)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={labelStyle}>Opacity</span>
              <input type="range" min={0} max={1} step={0.01} value={layer.transform.opacity}
                onChange={e => updateTransform('opacity', parseFloat(e.target.value))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32 }}>{Math.round(layer.transform.opacity * 100)}%</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <button onClick={addKeyframe} style={{
                width: '100%', padding: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Add Keyframe at {Math.round(currentTime)}ms</button>
            </div>
          </>
        )}

        {tab === 'style' && (
          <>
            {(layer.type === 'rect' || layer.type === 'circle') && (
              <>
                <ColorRow label="Fill" value={s.fill || '#6c63ff'} onChange={v => updateStyle({ fill: v })} />
                {s.stroke !== undefined && <ColorRow label="Stroke" value={s.stroke} onChange={v => updateStyle({ stroke: v })} />}
                {layer.type === 'rect' && <Row label="Width" value={s.width} onChange={v => updateStyle({ width: v })} />}
                {layer.type === 'rect' && <Row label="Height" value={s.height} onChange={v => updateStyle({ height: v })} />}
                {layer.type === 'rect' && <Row label="Radius" value={s.borderRadius || 0} onChange={v => updateStyle({ borderRadius: v })} />}
                {layer.type === 'circle' && <Row label="Radius" value={s.radius} onChange={v => updateStyle({ radius: v })} />}
              </>
            )}
            {layer.type === 'text' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={labelStyle}>Content</span>
                  <textarea value={s.content} onChange={e => updateStyle({ content: e.target.value })}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: 12, padding: '6px 8px', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }} />
                </div>
                <ColorRow label="Color" value={s.fill || '#ffffff'} onChange={v => updateStyle({ fill: v })} />
                <Row label="Font Size" value={s.fontSize} onChange={v => updateStyle({ fontSize: v })} />
                <Row label="Letter Spacing" value={s.letterSpacing || 0} onChange={v => updateStyle({ letterSpacing: v })} />
              </>
            )}
          </>
        )}

        {tab === 'keyframes' && (
          <>
            <button onClick={addKeyframe} style={{ width: '100%', padding: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 4, fontFamily: 'inherit' }}>
              + Add Keyframe at {Math.round(currentTime)}ms
            </button>
            {layer.keyframes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 12 }}>No keyframes yet</div>}
            {[...layer.keyframes].sort((a, b) => a.time - b.time).map((kf, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: 'monospace' }}>{kf.time}ms</span>
                  <button onClick={() => {
                    updateLayer(layer.id, { keyframes: layer.keyframes.filter((_, j) => j !== i) });
                  }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>✕</button>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{kf.easing}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{Object.keys(kf.properties).join(', ')}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={labelStyle}>{label}</span>
      <input type="number" value={value} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: 12, padding: '4px 8px', outline: 'none', fontFamily: 'monospace' }} />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={labelStyle}>{label}</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 4, padding: 2, background: 'var(--bg-elevated)', cursor: 'pointer' }} />
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: 12, padding: '4px 8px', outline: 'none', fontFamily: 'monospace' }} />
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--text-muted)', minWidth: 72 };
