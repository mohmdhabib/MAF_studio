import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSceneStore } from '../store/scene';

export function MafPanel() {
  const { scene, setScene } = useSceneStore();
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJson(JSON.stringify(scene, null, 2));
    }, 300);
    return () => clearTimeout(timer);
  }, [scene]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(json);
      setScene(parsed);
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadMaf = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${scene.meta.name.replace(/\s+/g, '-')}.maf.json`; a.click();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={applyJson} style={{ ...actionBtn, background: 'var(--accent)', color: '#fff', border: 'none' }}>↑ Apply</button>
        <button onClick={copyJson} style={actionBtn}>{copied ? '✓ Copied' : 'Copy'}</button>
        <button onClick={downloadMaf} style={actionBtn}>↓ .maf.json</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.3)', fontSize: 11, color: 'var(--error)', fontFamily: 'monospace' }}>
          ⚠ {error}
        </div>
      )}

      {/* Monaco editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language="json"
          value={json}
          onChange={v => setJson(v || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 11,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            folding: true,
            formatOnPaste: true,
            tabSize: 2,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{ padding: '4px 12px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', gap: 12 }}>
        <span>{scene.layers.length} layers</span>
        <span>{scene.meta.duration}ms</span>
        <span>MAF v{scene.version}</span>
        <span>{json.length} chars</span>
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 5, color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
};
