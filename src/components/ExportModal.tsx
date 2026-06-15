import { useState } from 'react';
import { useSceneStore } from '../store/scene';
import { useUIStore } from '../store/ui';
import { exportGsap } from '../export/gsap';
import { exportCss } from '../export/css';
import { exportFramer } from '../export/framer';
import { exportLottie } from '../export/lottie';
import { VideoExportPanel } from './VideoExportPanel';

type Group = 'video' | 'code';
type CodeTab = 'gsap' | 'css' | 'framer' | 'lottie';

const codeTabs: { id: CodeTab; label: string; ext: string; desc: string }[] = [
  { id: 'gsap', label: 'GSAP', ext: '.html', desc: 'Production-ready HTML with GSAP animation' },
  { id: 'css', label: 'CSS', ext: '.html', desc: 'Pure CSS @keyframes animation' },
  { id: 'framer', label: 'Framer Motion', ext: '.tsx', desc: 'React component with Framer Motion' },
  { id: 'lottie', label: 'Lottie', ext: '.json', desc: 'Lottie JSON for LottieFiles / mobile' },
];

export function ExportModal() {
  const { scene } = useSceneStore();
  const { setShowExportModal } = useUIStore();
  const [group, setGroup] = useState<Group>('video');
  const [activeTab, setActiveTab] = useState<CodeTab>('gsap');
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    if (activeTab === 'gsap') return exportGsap(scene);
    if (activeTab === 'css') return exportCss(scene);
    if (activeTab === 'framer') return exportFramer(scene);
    if (activeTab === 'lottie') return exportLottie(scene);
    return '';
  };

  const code = getCode();
  const tab = codeTabs.find(t => t.id === activeTab)!;

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${scene.meta.name.replace(/\s+/g, '-')}${tab.ext}`; a.click();
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openCodeSandbox = () => {
    const files: any = {};
    if (activeTab === 'gsap' || activeTab === 'css') {
      files['index.html'] = { content: code };
    } else if (activeTab === 'framer') {
      files['App.tsx'] = { content: code };
      files['package.json'] = { content: JSON.stringify({ dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0', 'framer-motion': '^11.0.0' } }) };
    }
    const form = document.createElement('form');
    form.method = 'POST'; form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
    form.target = '_blank';
    const input = document.createElement('input');
    input.name = 'parameters';
    input.value = btoa(JSON.stringify({ files })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    form.appendChild(input); document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={e => { if (e.target === e.currentTarget) setShowExportModal(false); }}>
      <div style={{ width: 780, height: 600, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Export Animation</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{scene.meta.name} · {scene.layers.length} layers · {scene.meta.duration}ms</div>
          </div>
          <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
        </div>

        {/* Top-level group toggle */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setGroup('video')} style={groupBtn(group === 'video')}>🎬 Video</button>
          <button onClick={() => setGroup('code')} style={groupBtn(group === 'code')}>{'</>'} Code (Developer)</button>
        </div>

        {group === 'video' ? (
          <VideoExportPanel />
        ) : (
          <>
            {/* Code format tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', gap: 2 }}>
              {codeTabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '9px 16px', background: 'none', border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
              {tab.desc}
            </div>

            <div style={{ flex: 1, overflow: 'auto', background: '#0d0d12' }}>
              <pre style={{ margin: 0, padding: 16, fontSize: 11, color: '#a8e6cf', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {code.slice(0, 4000)}{code.length > 4000 ? '\n\n… (truncated for preview — download for full output)' : ''}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <button onClick={copy} style={{ ...footerBtn, flex: 1 }}>{copied ? '✓ Copied!' : 'Copy Code'}</button>
              <button onClick={download} style={{ ...footerBtn, flex: 1 }}>↓ Download {tab.ext}</button>
              {(activeTab === 'gsap' || activeTab === 'css' || activeTab === 'framer') && (
                <button onClick={openCodeSandbox} style={{ ...footerBtn, flex: 1, color: 'var(--accent)' }}>Open in CodeSandbox ↗</button>
              )}
              {activeTab === 'lottie' && (
                <a href="https://lottiefiles.com/preview" target="_blank" rel="noreferrer" style={{ ...footerBtn, flex: 1, color: 'var(--accent)', textDecoration: 'none', textAlign: 'center' }}>Preview on LottieFiles ↗</a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const groupBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px', background: active ? 'var(--bg-elevated)' : 'none',
  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
  borderRadius: 8, color: active ? 'var(--text-primary)' : 'var(--text-muted)',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
});

const footerBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
