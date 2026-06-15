import { MAFScene, Layer, Keyframe } from '../schema/maf';

const easingMap: Record<string, string> = {
  linear: 'none',
  easeInQuad: 'power1.in',
  easeOutQuad: 'power1.out',
  easeInOutQuad: 'power1.inOut',
  easeOutCubic: 'power2.out',
  easeOutBack: 'back.out(1.7)',
  easeOutBounce: 'bounce.out',
  spring: 'elastic.out(1, 0.5)',
  easeOutElastic: 'elastic.out(1, 0.3)',
  easeInElastic: 'elastic.in(1, 0.3)',
};

function layerToGsap(layer: Layer, duration: number): string {
  if (!layer.keyframes || layer.keyframes.length < 2) return '';
  const sorted = [...layer.keyframes].sort((a, b) => a.time - b.time);
  const lines: string[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const kf1 = sorted[i];
    const kf2 = sorted[i + 1];
    const startSec = (kf1.time / 1000).toFixed(3);
    const dur = ((kf2.time - kf1.time) / 1000).toFixed(3);
    const ease = easingMap[kf1.easing] || 'power1.out';

    const props: string[] = [];
    if (kf2.properties.opacity !== undefined) props.push(`opacity: ${kf2.properties.opacity}`);
    if (kf2.properties.scale) props.push(`scale: ${kf2.properties.scale.x}`);
    if (kf2.properties.position) {
      props.push(`x: ${kf2.properties.position.x - 400}`);
      props.push(`y: ${kf2.properties.position.y - 225}`);
    }
    if (kf2.properties.rotation) props.push(`rotation: ${kf2.properties.rotation}`);
    if (!props.length) continue;

    lines.push(`  tl.to("#${layer.id}", { ${props.join(', ')}, duration: ${dur}, ease: "${ease}" }, ${startSec});`);
  }
  return lines.join('\n');
}

export function exportGsap(scene: MAFScene): string {
  const elements = scene.layers.map(l => {
    const s = l.style as any;
    if (l.type === 'rect') {
      return `  <div id="${l.id}" style="position:absolute;width:${s.width}px;height:${s.height}px;background:${s.fill};border-radius:${s.borderRadius || 0}px;left:${l.transform.position.x - s.width / 2}px;top:${l.transform.position.y - s.height / 2}px;opacity:${l.transform.opacity}"></div>`;
    } else if (l.type === 'circle') {
      return `  <div id="${l.id}" style="position:absolute;width:${s.radius * 2}px;height:${s.radius * 2}px;background:${s.fill};border-radius:50%;left:${l.transform.position.x - s.radius}px;top:${l.transform.position.y - s.radius}px;opacity:${l.transform.opacity}"></div>`;
    } else if (l.type === 'text') {
      return `  <div id="${l.id}" style="position:absolute;font-family:${s.fontFamily};font-size:${s.fontSize}px;font-weight:${s.fontWeight};color:${s.fill};left:${l.transform.position.x}px;top:${l.transform.position.y}px;transform:translate(-50%,-50%);opacity:${l.transform.opacity}">${s.content}</div>`;
    }
    return '';
  }).join('\n');

  const animations = scene.layers.map(l => layerToGsap(l, scene.meta.duration)).filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${scene.meta.name}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${scene.meta.background}; width: ${scene.meta.canvas.width}px; height: ${scene.meta.canvas.height}px; overflow: hidden; position: relative; }
  </style>
</head>
<body>
${elements}
<script>
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
${animations}
</script>
</body>
</html>`;
}
