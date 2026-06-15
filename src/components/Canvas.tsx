import { useRef, useEffect, useCallback } from 'react';
import { useSceneStore } from '../store/scene';
import { useUIStore } from '../store/ui';
import { render } from '../renderer/engine';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);

  const { scene, isPlaying, currentTime, setCurrentTime, setIsPlaying, selectedLayerId, selectLayer } = useSceneStore();
  const { showGrid, zoom } = useUIStore();

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    render(ctx, scene, time);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(108,99,255,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < scene.meta.canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, scene.meta.canvas.height); ctx.stroke();
      }
      for (let y = 0; y < scene.meta.canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(scene.meta.canvas.width, y); ctx.stroke();
      }
    }
  }, [scene, showGrid]);

  useEffect(() => {
    if (isPlaying) {
      const loop = (ts: number) => {
        if (!startRef.current) startRef.current = ts - pausedAtRef.current;
        const elapsed = (ts - startRef.current) % scene.meta.duration;
        setCurrentTime(elapsed);
        draw(elapsed);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (startRef.current !== null) {
        pausedAtRef.current = currentTime;
        startRef.current = null;
      }
      draw(currentTime);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, scene]);

  useEffect(() => { draw(currentTime); }, [scene, currentTime, showGrid]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = scene.meta.canvas.width / rect.width;
    const scaleY = scene.meta.canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    // Hit test layers (front to back)
    for (const layer of scene.layers) {
      if (!layer.visible) continue;
      const p = layer.transform.position;
      const s = layer.style as any;
      let hit = false;
      if (layer.type === 'rect') {
        hit = cx >= p.x - s.width / 2 && cx <= p.x + s.width / 2 && cy >= p.y - s.height / 2 && cy <= p.y + s.height / 2;
      } else if (layer.type === 'circle') {
        hit = Math.hypot(cx - p.x, cy - p.y) <= s.radius;
      } else if (layer.type === 'text') {
        hit = Math.abs(cx - p.x) < 80 && Math.abs(cy - p.y) < 24;
      }
      if (hit) { selectLayer(layer.id); return; }
    }
    selectLayer(null);
  };

  const cw = scene.meta.canvas.width;
  const ch = scene.meta.canvas.height;

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={cw}
        height={ch}
        onClick={handleCanvasClick}
        style={{
          maxWidth: '90%', maxHeight: '90%', width: 'auto', height: 'auto',
          borderRadius: 8, cursor: 'crosshair',
          boxShadow: '0 0 0 1px var(--border), 0 24px 64px rgba(0,0,0,0.5)',
          imageRendering: 'pixelated',
        }}
      />
      {/* Canvas info badge */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
        {cw}×{ch} · {scene.meta.fps}fps
      </div>
    </div>
  );
}
