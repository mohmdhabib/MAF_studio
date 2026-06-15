import { MAFScene, Layer, Transform, RectStyle, CircleStyle, TextStyle, SvgStyle } from '../schema/maf';
import { getPropertiesAtTime } from './interpolate';

const assetCache = new Map<string, HTMLImageElement>();

function loadAsset(src: string): HTMLImageElement | null {
  if (assetCache.has(src)) return assetCache.get(src)!;
  const img = new Image();
  img.src = src;
  img.onload = () => assetCache.set(src, img);
  return null;
}

function getLayerTransformAtTime(layer: Layer, time: number): Transform {
  const props = getPropertiesAtTime(layer.keyframes, time);
  return {
    position: props.position ?? layer.transform.position,
    scale: props.scale ?? layer.transform.scale,
    rotation: props.rotation ?? layer.transform.rotation,
    opacity: props.opacity ?? layer.transform.opacity,
    anchor: layer.transform.anchor,
  };
}

function getLayerStyleAtTime(layer: Layer, time: number) {
  const props = getPropertiesAtTime(layer.keyframes, time);
  const style = { ...layer.style } as any;
  if (props.fill) style.fill = props.fill;
  if (props.width !== undefined) style.width = props.width;
  if (props.height !== undefined) style.height = props.height;
  return style;
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: Layer, time: number, assets: MAFScene['assets']) {
  if (!layer.visible) return;

  const transform = getLayerTransformAtTime(layer, time);
  const style = getLayerStyleAtTime(layer, time);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity));

  const blendMap: Record<string, GlobalCompositeOperation> = {
    normal: 'source-over', multiply: 'multiply', screen: 'screen', overlay: 'overlay'
  };
  ctx.globalCompositeOperation = blendMap[layer.blendMode] || 'source-over';

  ctx.translate(transform.position.x, transform.position.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale.x, transform.scale.y);

  if (layer.type === 'rect') {
    const s = style as RectStyle;
    if (s.shadow) {
      ctx.shadowColor = s.shadow.color;
      ctx.shadowBlur = s.shadow.blur;
      ctx.shadowOffsetX = s.shadow.offsetX;
      ctx.shadowOffsetY = s.shadow.offsetY;
    }
    ctx.fillStyle = s.fill || '#6c63ff';
    const w = s.width || 120, h = s.height || 60, r = s.borderRadius || 0;
    ctx.beginPath();
    if (r > 0) {
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
    } else {
      ctx.rect(-w / 2, -h / 2, w, h);
    }
    ctx.fill();
    if (s.stroke && s.strokeWidth) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.strokeWidth;
      ctx.stroke();
    }
  } else if (layer.type === 'circle') {
    const s = style as CircleStyle;
    if (s.shadow) {
      ctx.shadowColor = s.shadow.color;
      ctx.shadowBlur = s.shadow.blur;
      ctx.shadowOffsetX = s.shadow.offsetX;
      ctx.shadowOffsetY = s.shadow.offsetY;
    }
    ctx.fillStyle = s.fill || '#ec4899';
    ctx.beginPath();
    ctx.arc(0, 0, s.radius || 40, 0, Math.PI * 2);
    ctx.fill();
    if (s.stroke && s.strokeWidth) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.strokeWidth;
      ctx.stroke();
    }
  } else if (layer.type === 'text') {
    const s = style as TextStyle;
    ctx.fillStyle = s.fill || '#ffffff';
    ctx.font = `${s.fontWeight || '700'} ${s.fontSize || 32}px ${s.fontFamily || 'Inter, sans-serif'}`;
    ctx.textAlign = (s.align as CanvasTextAlign) || 'center';
    ctx.textBaseline = 'middle';
    if (s.letterSpacing && s.letterSpacing !== 0) {
      ctx.letterSpacing = `${s.letterSpacing}px`;
    }
    ctx.fillText(s.content || '', 0, 0);
  } else if (layer.type === 'svg') {
    const s = style as SvgStyle;
    const asset = assets.find(a => a.id === s.assetId);
    if (asset) {
      const img = loadAsset(asset.src);
      if (img && img.complete) {
        ctx.drawImage(img, -s.width / 2, -s.height / 2, s.width, s.height);
      }
    }
  } else if (layer.type === 'group' && layer.children) {
    ctx.restore();
    for (const child of layer.children) {
      drawLayer(ctx, child, time, assets);
    }
    return;
  }

  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, scene: MAFScene, time: number) {
  const { width, height } = scene.meta.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = scene.meta.background || '#0f0f13';
  ctx.fillRect(0, 0, width, height);

  const reversed = [...scene.layers].reverse();
  for (const layer of reversed) {
    drawLayer(ctx, layer, time, scene.assets);
  }
}
