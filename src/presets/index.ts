import { MAFScene } from '../schema/maf';

export const presets: { name: string; scene: MAFScene }[] = [
  {
    name: 'Logo Reveal',
    scene: {
      version: '0.2',
      meta: { name: 'Logo Reveal', duration: 2000, fps: 60, canvas: { width: 800, height: 450 }, background: '#0d0d18', description: 'Clean logo reveal animation' },
      assets: [],
      layers: [
        {
          id: 'layer_001', name: 'Background Card', type: 'rect', visible: true, locked: false, blendMode: 'normal',
          transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } },
          keyframes: [
            { time: 0, properties: { opacity: 0, scale: { x: 0.7, y: 0.7 } }, easing: 'easeOutBack' },
            { time: 700, properties: { opacity: 1, scale: { x: 1, y: 1 } }, easing: 'easeOutBack' },
          ],
          style: { width: 260, height: 100, fill: '#6c63ff', borderRadius: 16 } as any,
        },
        {
          id: 'layer_002', name: 'Logo Text', type: 'text', visible: true, locked: false, blendMode: 'normal',
          transform: { position: { x: 400, y: 220 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } },
          keyframes: [
            { time: 300, properties: { opacity: 0, position: { x: 400, y: 240 } }, easing: 'easeOutCubic' },
            { time: 900, properties: { opacity: 1, position: { x: 400, y: 220 } }, easing: 'easeOutCubic' },
          ],
          style: { content: 'MAF STUDIO', fontSize: 26, fontWeight: '800', fontFamily: 'Inter, sans-serif', fill: '#ffffff', letterSpacing: 5, align: 'center' } as any,
        },
        {
          id: 'layer_003', name: 'Tagline', type: 'text', visible: true, locked: false, blendMode: 'normal',
          transform: { position: { x: 400, y: 248 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } },
          keyframes: [
            { time: 600, properties: { opacity: 0 }, easing: 'easeOutCubic' },
            { time: 1200, properties: { opacity: 0.7 }, easing: 'easeOutCubic' },
          ],
          style: { content: 'Motion Animation Format', fontSize: 11, fontWeight: '400', fontFamily: 'Inter, sans-serif', fill: '#ffffff', letterSpacing: 2, align: 'center' } as any,
        },
      ],
      compositions: [],
      intent: 'Clean logo reveal with staggered fade and spring scale',
    }
  },
  {
    name: 'Text Sequence',
    scene: {
      version: '0.2',
      meta: { name: 'Text Sequence', duration: 2500, fps: 60, canvas: { width: 800, height: 450 }, background: '#0a0a0a', description: 'Staggered text lines' },
      assets: [],
      layers: [
        { id: 'layer_001', name: 'Line 1', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 180 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 0, properties: { opacity: 0, position: { x: 400, y: 200 } }, easing: 'easeOutCubic' }, { time: 500, properties: { opacity: 1, position: { x: 400, y: 180 } }, easing: 'easeOutCubic' }], style: { content: 'Build fast.', fontSize: 48, fontWeight: '800', fontFamily: 'Inter, sans-serif', fill: '#ffffff', align: 'center' } as any },
        { id: 'layer_002', name: 'Line 2', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 240 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 200, properties: { opacity: 0, position: { x: 400, y: 260 } }, easing: 'easeOutCubic' }, { time: 700, properties: { opacity: 1, position: { x: 400, y: 240 } }, easing: 'easeOutCubic' }], style: { content: 'Ship motion.', fontSize: 48, fontWeight: '800', fontFamily: 'Inter, sans-serif', fill: '#6c63ff', align: 'center' } as any },
        { id: 'layer_003', name: 'Line 3', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 300 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 400, properties: { opacity: 0, position: { x: 400, y: 320 } }, easing: 'easeOutCubic' }, { time: 900, properties: { opacity: 1, position: { x: 400, y: 300 } }, easing: 'easeOutCubic' }], style: { content: 'Stand out.', fontSize: 48, fontWeight: '800', fontFamily: 'Inter, sans-serif', fill: '#a855f7', align: 'center' } as any },
      ],
      compositions: [],
      intent: 'Staggered text reveal, each line slides up with offset timing',
    }
  },
  {
    name: 'Loading Spinner',
    scene: {
      version: '0.2',
      meta: { name: 'Loading Spinner', duration: 1200, fps: 60, canvas: { width: 800, height: 450 }, background: '#0d0d12', description: 'Pulsing dot spinner' },
      assets: [],
      layers: [0, 1, 2, 3, 4].map((i) => ({
        id: `layer_00${i + 1}`, name: `Dot ${i + 1}`, type: 'circle' as const, visible: true, locked: false, blendMode: 'normal' as const,
        transform: { position: { x: 360 + i * 20, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 0.2, anchor: { x: 0, y: 0 } },
        keyframes: [
          { time: i * 120, properties: { opacity: 0.2, scale: { x: 0.8, y: 0.8 } }, easing: 'easeOutCubic' as const },
          { time: i * 120 + 300, properties: { opacity: 1, scale: { x: 1.2, y: 1.2 } }, easing: 'easeOutCubic' as const },
          { time: i * 120 + 600, properties: { opacity: 0.2, scale: { x: 0.8, y: 0.8 } }, easing: 'easeOutCubic' as const },
        ],
        style: { radius: 7, fill: '#6c63ff' } as any,
      })),
      compositions: [],
      intent: 'Wave pulse loading indicator with staggered dots',
    }
  },
  {
    name: 'Product Card',
    scene: {
      version: '0.2',
      meta: { name: 'Product Card', duration: 1800, fps: 60, canvas: { width: 800, height: 450 }, background: '#111118', description: 'Animated product card' },
      assets: [],
      layers: [
        { id: 'layer_001', name: 'Card BG', type: 'rect', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 0, properties: { opacity: 0, scale: { x: 0.85, y: 0.85 } }, easing: 'easeOutBack' }, { time: 600, properties: { opacity: 1, scale: { x: 1, y: 1 } }, easing: 'easeOutBack' }], style: { width: 320, height: 200, fill: '#1e1e2e', borderRadius: 20, shadow: { color: 'rgba(108,99,255,0.3)', blur: 40, offsetX: 0, offsetY: 20 } } as any },
        { id: 'layer_002', name: 'Accent Dot', type: 'circle', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 290, y: 175 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 200, properties: { opacity: 0, scale: { x: 0, y: 0 } }, easing: 'easeOutBack' }, { time: 800, properties: { opacity: 1, scale: { x: 1, y: 1 } }, easing: 'easeOutBack' }], style: { radius: 18, fill: '#6c63ff' } as any },
        { id: 'layer_003', name: 'Product Name', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 400, properties: { opacity: 0, position: { x: 400, y: 240 } }, easing: 'easeOutCubic' }, { time: 900, properties: { opacity: 1, position: { x: 400, y: 225 } }, easing: 'easeOutCubic' }], style: { content: 'Pro Plan', fontSize: 28, fontWeight: '700', fontFamily: 'Inter, sans-serif', fill: '#ffffff', align: 'center' } as any },
        { id: 'layer_004', name: 'Price', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 262 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 600, properties: { opacity: 0 }, easing: 'easeOutCubic' }, { time: 1100, properties: { opacity: 0.6 }, easing: 'easeOutCubic' }], style: { content: '$29 / month', fontSize: 16, fontWeight: '400', fontFamily: 'Inter, sans-serif', fill: '#a0a0c0', align: 'center' } as any },
      ],
      compositions: [],
      intent: 'Clean product card reveal with depth and stagger',
    }
  },
  {
    name: 'Gradient Wipe',
    scene: {
      version: '0.2',
      meta: { name: 'Gradient Wipe', duration: 1500, fps: 60, canvas: { width: 800, height: 450 }, background: '#0d0d12', description: 'Horizontal wipe reveal' },
      assets: [],
      layers: [
        { id: 'layer_001', name: 'Wipe Bar', type: 'rect', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 0, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 0, properties: { width: 0, position: { x: 0, y: 225 } }, easing: 'easeOutCubic' }, { time: 900, properties: { width: 800, position: { x: 400, y: 225 } }, easing: 'easeOutCubic' }], style: { width: 0, height: 450, fill: '#6c63ff', borderRadius: 0 } as any },
        { id: 'layer_002', name: 'Reveal Text', type: 'text', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [{ time: 500, properties: { opacity: 0 }, easing: 'easeOutCubic' }, { time: 1100, properties: { opacity: 1 }, easing: 'easeOutCubic' }], style: { content: 'UNVEILED', fontSize: 56, fontWeight: '900', fontFamily: 'Inter, sans-serif', fill: '#ffffff', letterSpacing: 8, align: 'center' } as any },
      ],
      compositions: [],
      intent: 'Horizontal color wipe followed by text reveal',
    }
  },
];
