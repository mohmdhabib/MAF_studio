import { useState } from 'react';
import { useSceneStore } from '../store/scene';
import { useUIStore } from '../store/ui';
import { useAIStore } from '../store/aiStore';
import { generateScene, editScene } from '../ai/generate';
import { presets } from '../presets';

const EXAMPLE_PROMPTS = [
  'A purple logo bounces in with spring energy',
  'Three colored circles pulse in sequence like a loader',
  'Text slides up staggered with a glow effect',
  'A product card fades in with depth and shadow',
  'Neon rectangles wipe across the screen',
  'Confetti circles burst from center outward',
  'A countdown timer ticks with bold numbers',
  'Minimal text reveal with a horizontal line',
  'Overlapping circles animate like a Venn diagram',
  'A progress bar fills up smoothly',
];

type Mode = 'generate' | 'edit';

export function PromptPanel() {
  const { setScene, scene, patchScene } = useSceneStore();
  const { isGenerating, setIsGenerating, generationStatus, setGenerationStatus, addPromptHistory, promptHistory } = useUIStore();
  const { availableModels, selectedModel, setSelectedModel, isFetchingModels } = useAIStore();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('generate');

  const run = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    addPromptHistory(prompt);

    try {
      if (mode === 'generate') {
        setGenerationStatus('🤔 Thinking about your animation…');
        const newScene = await generateScene(prompt);
        setScene(newScene);
        setGenerationStatus(`✓ "${newScene.meta.name}" — ${newScene.layers.length} layers · ${newScene.meta.duration}ms`);
        useSceneStore.getState().setIsPlaying(true);
      } else {
        setGenerationStatus('✏️ Editing scene…');
        const patch = await editScene(scene, prompt);
        patchScene(patch as any);
        setGenerationStatus('✓ Scene updated');
      }
    } catch (e: any) {
      setGenerationStatus(`⚠ ${e.message || 'Generation failed. Check your API key.'}`);
    }

    setIsGenerating(false);
  };

  const loadPreset = (idx: number) => {
    setScene(presets[idx].scene);
    useSceneStore.getState().setIsPlaying(true);
    setGenerationStatus(`✓ Loaded preset: ${presets[idx].name}`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Model Selector */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={sectionLabel}>AI Model</div>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          disabled={isGenerating || isFetchingModels}
          style={{
            width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          {availableModels.length === 0 ? (
            <option value={selectedModel}>{selectedModel} (offline)</option>
          ) : (
            availableModels.map(m => <option key={m} value={m}>{m}</option>)
          )}
        </select>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', margin: '10px 12px 0', background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
        {(['generate', 'edit'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '5px', background: mode === m ? 'var(--bg-surface)' : 'none',
            border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
            borderRadius: 6, color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
            boxShadow: mode === m ? 'var(--shadow-sm)' : 'none'
          }}>{m === 'generate' ? '✦ Generate' : '✏ Edit'}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Textarea */}
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
          placeholder={mode === 'generate' ? 'Describe your animation…\ne.g. "A glowing circle bounces in from the top"' : 'Describe what to change…\ne.g. "Make it faster" or "Change the color to red"'}
          disabled={isGenerating}
          style={{
            width: '100%', minHeight: 90, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: 10,
            resize: 'vertical', fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
            opacity: isGenerating ? 0.6 : 1, boxSizing: 'border-box',
          }}
        />

        {/* Generate button */}
        <button className="btn btn-primary" onClick={run} disabled={isGenerating || !prompt.trim()} style={{
          width: '100%', padding: '10px', 
          opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
          cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
        }}>
          {isGenerating ? '⏳ Generating…' : mode === 'generate' ? '✦ Generate  ⌘↵' : '✏ Apply Edit  ⌘↵'}
        </button>

        {/* Status */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 6, fontFamily: 'monospace', lineHeight: 1.4 }}>
          {generationStatus}
        </div>

        {/* Presets */}
        <div>
          <div style={sectionLabel}>Presets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {presets.map((p, i) => (
              <button key={i} onClick={() => loadPreset(i)} style={chipBtn}>{p.name}</button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div>
          <div style={sectionLabel}>Examples</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button key={i} onClick={() => setPrompt(ex)} style={chipBtn}>{ex}</button>
            ))}
          </div>
        </div>

        {/* History */}
        {promptHistory.length > 0 && (
          <div>
            <div style={sectionLabel}>Recent</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {promptHistory.map((h, i) => (
                <button key={i} onClick={() => setPrompt(h)} style={{ ...chipBtn, color: 'var(--text-muted)', fontSize: 11 }}>↩ {h}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 6,
};

const chipBtn: React.CSSProperties = {
  padding: '6px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
  textAlign: 'left', fontFamily: 'inherit', lineHeight: 1.3,
};
