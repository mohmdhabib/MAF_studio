import { useState } from 'react';
import { useSceneStore } from '../store/scene';
import { exportVideo, VideoFormat } from '../export/video';

const formats: { id: VideoFormat; label: string; ext: string; desc: string; transparent?: boolean }[] = [
  { id: 'mp4', label: 'MP4', ext: '.mp4', desc: 'Best for sharing, social media, presentations' },
  { id: 'webm', label: 'WebM (Alpha)', ext: '.webm', desc: 'Transparent background — for overlays', transparent: true },
  { id: 'gif', label: 'GIF', ext: '.gif', desc: 'Looping animation for chat, docs, README' },
];

export function VideoExportPanel() {
  const { scene } = useSceneStore();
  const [activeFormat, setActiveFormat] = useState<VideoFormat>('mp4');
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fmt = formats.find(f => f.id === activeFormat)!;

  const runExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    try {
      const blob = await exportVideo({
        scene,
        format: activeFormat,
        transparent: fmt.transparent,
        scale,
        onProgress: (s, pct) => { setStage(s); setProgress(pct); },
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setStage(`⚠ Export failed: ${e.message || 'unknown error'}`);
    }

    setIsExporting(false);
  };

  const download = () => {
    if (!resultBlob) return;
    const url = resultUrl || URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.meta.name.replace(/\s+/g, '-')}${fmt.ext}`;
    a.click();
  };

  const estFrames = Math.round((scene.meta.duration / 1000) * scene.meta.fps);
  const outW = scene.meta.canvas.width * scale;
  const outH = scene.meta.canvas.height * scale;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Format tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 0' }}>
        {formats.map(f => (
          <button key={f.id} onClick={() => { setActiveFormat(f.id); setResultBlob(null); }} style={{
            flex: 1, padding: '10px 8px', background: activeFormat === f.id ? 'var(--bg-elevated)' : 'var(--bg-base)',
            border: activeFormat === f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 8, color: activeFormat === f.id ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text-muted)' }}>{fmt.desc}</div>

      {/* Preview / result area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden' }}>
        {resultUrl ? (
          activeFormat === 'gif' ? (
            <img src={resultUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
          ) : (
            <video src={resultUrl} controls autoPlay loop muted style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
          )
        ) : isExporting ? (
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stage}</div>
            <div style={{ width: '100%', height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#6c63ff,#a855f7)', transition: 'width 0.2s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{progress}%</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.3 }}>🎬</div>
            <div>{outW}×{outH} · {estFrames} frames · {scene.meta.duration}ms</div>
            <div>Click Export to render</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Resolution scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 70 }}>Resolution</span>
          {[1, 2].map(s => (
            <button key={s} onClick={() => setScale(s)} style={{
              padding: '5px 12px', background: scale === s ? 'var(--bg-elevated)' : 'none',
              border: scale === s ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 6, color: scale === s ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>{scene.meta.canvas.width * s}×{scene.meta.canvas.height * s}{s === 2 ? ' (2x)' : ''}</button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={runExport} disabled={isExporting} style={{
            flex: 1, padding: '10px', background: isExporting ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#6c63ff,#a855f7)',
            border: 'none', borderRadius: 8, color: isExporting ? 'var(--text-muted)' : '#fff',
            fontSize: 13, fontWeight: 700, cursor: isExporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>{isExporting ? '⏳ Rendering…' : `🎬 Export ${fmt.label}`}</button>

          {resultBlob && (
            <button onClick={download} style={{
              flex: 1, padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--accent)',
              borderRadius: 8, color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>↓ Download {fmt.ext}</button>
          )}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Rendered locally in your browser — nothing uploaded.
        </div>
      </div>
    </div>
  );
}
