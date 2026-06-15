import { MAFScene, Layer } from '../schema/maf';

export function exportLottie(scene: MAFScene): string {
  const fps = scene.meta.fps;
  const op = (scene.meta.duration / 1000) * fps;

  const layers = scene.layers.map((layer, idx) => {
    const s = layer.style as any;
    const ip = layer.keyframes.length ? (layer.keyframes[0].time / 1000) * fps : 0;
    const op2 = layer.keyframes.length ? (layer.keyframes[layer.keyframes.length - 1].time / 1000) * fps : op;

    const kfs = [...layer.keyframes].sort((a, b) => a.time - b.time);
    const opacityKfs = kfs.filter(k => k.properties.opacity !== undefined).map(k => ({
      t: (k.time / 1000) * fps,
      s: [Math.round((k.properties.opacity ?? 1) * 100)],
      e: [100],
      i: { x: [0.5], y: [0.5] },
      o: { x: [0.5], y: [0.5] },
    }));

    return {
      ddd: 0,
      ind: idx + 1,
      ty: 4,
      nm: layer.name,
      ip, op: op2,
      st: 0,
      ks: {
        o: opacityKfs.length > 0
          ? { a: 1, k: opacityKfs }
          : { a: 0, k: Math.round(layer.transform.opacity * 100) },
        r: { a: 0, k: layer.transform.rotation },
        p: { a: 0, k: [layer.transform.position.x, layer.transform.position.y, 0] },
        s: { a: 0, k: [layer.transform.scale.x * 100, layer.transform.scale.y * 100, 100] },
        a: { a: 0, k: [0, 0, 0] },
      },
      shapes: layer.type === 'rect' ? [{
        ty: 'gr',
        nm: 'Rect Group',
        it: [
          { ty: 'rc', d: 1, s: { a: 0, k: [s.width || 100, s.height || 60] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: s.borderRadius || 0 }, nm: 'Rect' },
          { ty: 'fl', c: { a: 0, k: hexToLottieColor(s.fill || '#6c63ff') }, o: { a: 0, k: 100 }, r: 1, nm: 'Fill' },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: 'Transform' }
        ]
      }] : layer.type === 'circle' ? [{
        ty: 'gr',
        nm: 'Ellipse Group',
        it: [
          { ty: 'el', d: 1, s: { a: 0, k: [(s.radius || 40) * 2, (s.radius || 40) * 2] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse' },
          { ty: 'fl', c: { a: 0, k: hexToLottieColor(s.fill || '#ec4899') }, o: { a: 0, k: 100 }, r: 1, nm: 'Fill' },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: 'Transform' }
        ]
      }] : [],
    };
  });

  const lottie = {
    v: '5.7.14',
    fr: fps,
    ip: 0,
    op,
    w: scene.meta.canvas.width,
    h: scene.meta.canvas.height,
    nm: scene.meta.name,
    ddd: 0,
    assets: [],
    layers,
    markers: [],
    _maf_source: scene,
  };

  return JSON.stringify(lottie, null, 2);
}

function hexToLottieColor(hex: string): number[] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}
