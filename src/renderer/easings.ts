export type EasingFn = (t: number) => number;

export const easings: Record<string, EasingFn> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t) => t * t * t,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  easeInBounce: (t) => 1 - easings.easeOutBounce(1 - t),
  spring: (t) => 1 - Math.cos(t * Math.PI * 2.5) * Math.pow(1 - t, 2.5),
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  },
  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3);
  },
  custom: (t) => t,
};

export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): EasingFn {
  return (t: number) => {
    // Newton-Raphson approximation
    let x = t;
    for (let i = 0; i < 8; i++) {
      const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
      const xv = ((ax * x + bx) * x + cx) * x;
      const dxv = (3 * ax * x + 2 * bx) * x + cx;
      if (Math.abs(dxv) < 1e-6) break;
      x -= (xv - t) / dxv;
    }
    const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    return ((ay * x + by) * x + cy) * x;
  };
}
