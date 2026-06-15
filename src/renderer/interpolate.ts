import { Keyframe, KeyframeProperties, Vec2 } from '../schema/maf';
import { easings } from './easings';

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerpNum(a.x, b.x, t), y: lerpNum(a.y, b.y, t) };
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function lerpColor(a: string, b: string, t: number): string {
  try {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return rgbToHex(lerpNum(r1, r2, t), lerpNum(g1, g2, t), lerpNum(b1, b2, t));
  } catch { return a; }
}

function lerpProps(a: KeyframeProperties, b: KeyframeProperties, t: number): KeyframeProperties {
  const result: KeyframeProperties = {};
  if (a.opacity !== undefined && b.opacity !== undefined)
    result.opacity = lerpNum(a.opacity, b.opacity, t);
  else if (a.opacity !== undefined) result.opacity = a.opacity;

  if (a.scale !== undefined && b.scale !== undefined)
    result.scale = lerpVec2(a.scale, b.scale, t);
  else if (a.scale !== undefined) result.scale = a.scale;

  if (a.position !== undefined && b.position !== undefined)
    result.position = lerpVec2(a.position, b.position, t);
  else if (a.position !== undefined) result.position = a.position;

  if (a.rotation !== undefined && b.rotation !== undefined)
    result.rotation = lerpNum(a.rotation, b.rotation, t);
  else if (a.rotation !== undefined) result.rotation = a.rotation;

  if (a.fill !== undefined && b.fill !== undefined)
    result.fill = lerpColor(a.fill, b.fill, t);
  else if (a.fill !== undefined) result.fill = a.fill;

  if (a.width !== undefined && b.width !== undefined)
    result.width = lerpNum(a.width, b.width, t);
  if (a.height !== undefined && b.height !== undefined)
    result.height = lerpNum(a.height, b.height, t);

  return result;
}

export function getPropertiesAtTime(keyframes: Keyframe[], time: number): KeyframeProperties {
  if (!keyframes || keyframes.length === 0) return {};
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (time <= sorted[0].time) return sorted[0].properties;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].properties;

  for (let i = 0; i < sorted.length - 1; i++) {
    const kf1 = sorted[i], kf2 = sorted[i + 1];
    if (time >= kf1.time && time <= kf2.time) {
      const raw = (time - kf1.time) / (kf2.time - kf1.time);
      const easeFn = easings[kf1.easing] || easings.linear;
      const t = Math.max(0, Math.min(1, easeFn(raw)));
      return lerpProps(kf1.properties, kf2.properties, t);
    }
  }
  return {};
}
