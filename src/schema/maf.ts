// Motion Animation Format — v0.2
// The IR that sits between Natural Language and the GPU renderer.

export type EasingType =
  | 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeOutCubic' | 'easeOutBack' | 'easeOutBounce' | 'spring'
  | 'easeInElastic' | 'easeOutElastic' | 'custom';

export type LayerType = 'rect' | 'circle' | 'text' | 'svg' | 'group' | 'path';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay';

export interface Vec2 { x: number; y: number; }

export interface Transform {
  position: Vec2;
  scale: Vec2;
  rotation: number;
  opacity: number;
  anchor: Vec2;
}

export interface BezierHandle { in: Vec2; out: Vec2; }

export interface KeyframeProperties {
  opacity?: number;
  scale?: Vec2;
  position?: Vec2;
  rotation?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export interface Keyframe {
  time: number;
  properties: KeyframeProperties;
  easing: EasingType;
  handle?: BezierHandle;
}

export interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface RectStyle {
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: Shadow;
}

export interface CircleStyle {
  radius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadow?: Shadow;
}

export interface TextStyle {
  content: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  fill: string;
  letterSpacing?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
}

export interface SvgStyle {
  assetId: string;
  width: number;
  height: number;
}

export interface PathStyle {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export type LayerStyle = RectStyle | CircleStyle | TextStyle | SvgStyle | PathStyle;

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;
  transform: Transform;
  keyframes: Keyframe[];
  style: LayerStyle;
  children?: Layer[];
}

export interface Asset {
  id: string;
  type: 'svg' | 'image' | 'font';
  src: string;
  name: string;
}

export interface Composition {
  id: string;
  name: string;
  layers: string[];
  duration: number;
}

export interface MAFMeta {
  name: string;
  duration: number;
  fps: number;
  canvas: { width: number; height: number };
  background: string;
  description: string;
}

export interface MAFScene {
  version: '0.2';
  meta: MAFMeta;
  assets: Asset[];
  layers: Layer[];
  compositions: Composition[];
  intent: string;
}

export const defaultTransform = (): Transform => ({
  position: { x: 400, y: 225 },
  scale: { x: 1, y: 1 },
  rotation: 0,
  opacity: 1,
  anchor: { x: 0, y: 0 },
});

export const emptyScene = (): MAFScene => ({
  version: '0.2',
  meta: {
    name: 'Untitled',
    duration: 2000,
    fps: 60,
    canvas: { width: 800, height: 450 },
    background: '#0f0f13',
    description: '',
  },
  assets: [],
  layers: [],
  compositions: [],
  intent: '',
});
