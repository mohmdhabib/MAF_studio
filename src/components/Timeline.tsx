import { useRef } from 'react';
import { useSceneStore } from '../store/scene';

const typeColor: Record<string, string> = {
  rect: '#6c63ff', circle: '#ec4899', text: '#3b82f6', svg: '#f97316', group: '#10b981',
};

export function Timeline() {
  const { scene, currentTime, isPlaying, setCurrentTime, setIsPlaying, selectedLayerId } = useSceneStore();
  const duration = scene.meta.duration;
  const rulerRef = useRef<HTMLDivElement>(null);
  const pausedAtRef = useRef(0);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = rulerRef.current!.getBoundingClientRect();
    const t = ((e.clientX - rect.left) / rect.width) * duration;
    const clamped = Math.max(0, Math.min(duration, t));
    pausedAtRef.current = clamped;
    setCurrentTime(clamped);
    setIsPlaying(false);
  };

  const pct = (currentTime / duration) * 100;
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(ms % 1000);
    return `${s.toString().padStart(2, '0')}:${m.toString().padStart(3, '0')}`;
  };

  const handlePlay = () => {
    if (!isPlaying && currentTime >= duration - 50) setCurrentTime(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ height: 180, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => { setIsPlaying(false); setCurrentTime(0); }} style={ctrlBtn}>⏹</button>
        <button onClick={handlePlay} style={{ ...ctrlBtn, background: 'linear-gradient(135deg,#6c63ff,#a855f7)', color: '#fff', border: 'none', width: 34 }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', minWidth: 70 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        {/* Ruler */}
        <div ref={rulerRef} onClick={handleRulerClick} style={{ flex: 1, height: 20, background: 'var(--bg-elevated)', borderRadius: 3, cursor: 'col-resize', position: 'relative', overflow: 'hidden' }}>
          {/* Tick marks */}
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${i * 10}%`, top: 0, height: i % 5 === 0 ? '60%' : '30%', width: 1, background: 'var(--border)' }} />
          ))}
          {/* Progress */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: `${pct}%`, height: '100%', background: 'rgba(108,99,255,0.2)' }} />
          {/* Playhead */}
          <div style={{ position: 'absolute', left: `${pct}%`, top: 0, width: 2, height: '100%', background: '#a855f7', transform: 'translateX(-50%)' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{duration}ms</span>
      </div>

      {/* Layer rows */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {scene.layers.length === 0 && (
          <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>Generate an animation to see keyframes here</div>
        )}
        {scene.layers.map(layer => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', height: 28, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 140, padding: '0 10px', fontSize: 11, color: layer.id === selectedLayerId ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: typeColor[layer.type] || '#888', flexShrink: 0 }} />
              {layer.name}
            </div>
            {/* Keyframe track */}
            <div style={{ flex: 1, height: '100%', position: 'relative', background: 'var(--bg-base)' }}>
              {/* Duration bar */}
              {layer.keyframes.length >= 2 && (() => {
                const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
                const left = (sorted[0].time / duration) * 100;
                const right = (sorted[sorted.length - 1].time / duration) * 100;
                return (
                  <div style={{ position: 'absolute', top: '30%', left: `${left}%`, width: `${right - left}%`, height: '40%', background: `${typeColor[layer.type]}22`, borderRadius: 2, border: `1px solid ${typeColor[layer.type]}44` }} />
                );
              })()}
              {/* Keyframe diamonds */}
              {layer.keyframes.map((kf, i) => (
                <div key={i} title={`${kf.time}ms · ${kf.easing}`} style={{
                  position: 'absolute', left: `${(kf.time / duration) * 100}%`,
                  top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)',
                  width: 8, height: 8, background: typeColor[layer.type] || '#888',
                  cursor: 'pointer', borderRadius: 1,
                }} />
              ))}
              {/* Playhead line */}
              <div style={{ position: 'absolute', left: `${pct}%`, top: 0, width: 1, height: '100%', background: 'rgba(168,85,247,0.4)', pointerEvents: 'none' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: 28, height: 28, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
