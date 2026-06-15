import { MAFScene, Layer } from '../schema/maf';

const cssEasingMap: Record<string, string> = {
  linear: 'linear',
  easeOutQuad: 'ease-out',
  easeInQuad: 'ease-in',
  easeInOutQuad: 'ease-in-out',
  easeOutCubic: 'cubic-bezier(0.33,1,0.68,1)',
  easeOutBack: 'cubic-bezier(0.34,1.56,0.64,1)',
  spring: 'cubic-bezier(0.34,1.56,0.64,1)',
  easeOutBounce: 'cubic-bezier(0.34,1.56,0.64,1)',
  easeOutElastic: 'cubic-bezier(0.34,1.56,0.64,1)',
};

function layerToCss(layer: Layer, duration: number): { keyframes: string; rule: string } {
  const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
  if (sorted.length < 2) return { keyframes: '', rule: '' };

  const name = `maf_${layer.id}`;
  const frames = sorted.map(kf => {
    const pct = ((kf.time / duration) * 100).toFixed(1);
    const transforms: string[] = [];
    if (kf.properties.scale) transforms.push(`scale(${kf.properties.scale.x}, ${kf.properties.scale.y})`);
    if (kf.properties.rotation) transforms.push(`rotate(${kf.properties.rotation}deg)`);
    if (kf.properties.position) transforms.push(`translate(${kf.properties.position.x - 400}px, ${kf.properties.position.y - 225}px)`);

    const props: string[] = [];
    if (kf.properties.opacity !== undefined) props.push(`  opacity: ${kf.properties.opacity};`);
    if (transforms.length) props.push(`  transform: ${transforms.join(' ')};`);
    if (kf.properties.fill) props.push(`  background: ${kf.properties.fill};`);

    return `  ${pct}% {\n${props.join('\n')}\n  }`;
  }).join('\n');

  const durationSec = (duration / 1000).toFixed(2);
  const ease = cssEasingMap[sorted[0].easing] || 'ease-out';
  const keyframes = `@keyframes ${name} {\n${frames}\n}`;
  const rule = `#${layer.id} { animation: ${name} ${durationSec}s ${ease} infinite; }`;

  return { keyframes, rule };
}

export function exportCss(scene: MAFScene): string {
  const elements = scene.layers.map(l => {
    const s = l.style as any;
    if (l.type === 'rect') return `  <div id="${l.id}" class="layer" style="width:${s.width}px;height:${s.height}px;background:${s.fill};border-radius:${s.borderRadius || 0}px;left:${l.transform.position.x - s.width / 2}px;top:${l.transform.position.y - s.height / 2}px"></div>`;
    if (l.type === 'circle') return `  <div id="${l.id}" class="layer" style="width:${s.radius * 2}px;height:${s.radius * 2}px;background:${s.fill};border-radius:50%;left:${l.transform.position.x - s.radius}px;top:${l.transform.position.y - s.radius}px"></div>`;
    if (l.type === 'text') return `  <div id="${l.id}" class="layer" style="font-family:${s.fontFamily};font-size:${s.fontSize}px;font-weight:${s.fontWeight};color:${s.fill};left:${l.transform.position.x}px;top:${l.transform.position.y}px;transform:translate(-50%,-50%)">${s.content}</div>`;
    return '';
  }).join('\n');

  const cssResults = scene.layers.map(l => layerToCss(l, scene.meta.duration));
  const keyframes = cssResults.map(r => r.keyframes).filter(Boolean).join('\n\n');
  const rules = cssResults.map(r => r.rule).filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${scene.meta.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${scene.meta.background}; width: ${scene.meta.canvas.width}px; height: ${scene.meta.canvas.height}px; overflow: hidden; position: relative; }
    .layer { position: absolute; }

${keyframes}

${rules}
  </style>
</head>
<body>
${elements}
</body>
</html>`;
}
