// MAF Studio Figma Plugin — Main Thread
// Converts Figma nodes → MAF layers

figma.showUI(__html__, { width: 320, height: 480, title: 'MAF Studio' });

function hexFromFigmaRGB(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getFill(node: any): string {
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      return hexFromFigmaRGB(fill.color.r, fill.color.g, fill.color.b);
    }
  }
  return '#6c63ff';
}

function nodeToMAFLayer(node: SceneNode, canvasW = 800, canvasH = 450): any {
  const id = `layer_${node.id.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;
  const base = {
    id,
    name: node.name,
    visible: node.visible ?? true,
    locked: node.locked ?? false,
    blendMode: 'normal',
    transform: {
      position: {
        x: 'x' in node ? (node as any).x + (node as any).width / 2 : canvasW / 2,
        y: 'y' in node ? (node as any).y + (node as any).height / 2 : canvasH / 2,
      },
      scale: { x: 1, y: 1 },
      rotation: 'rotation' in node ? (node as any).rotation : 0,
      opacity: 'opacity' in node ? (node as any).opacity : 1,
      anchor: { x: 0, y: 0 },
    },
    keyframes: [],
  };

  if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
    const n = node as RectangleNode;
    return { ...base, type: 'rect', style: { width: n.width, height: n.height, fill: getFill(n), borderRadius: typeof n.cornerRadius === 'number' ? n.cornerRadius : 0 } };
  }
  if (node.type === 'ELLIPSE') {
    const n = node as EllipseNode;
    return { ...base, type: 'circle', style: { radius: Math.max(n.width, n.height) / 2, fill: getFill(n) } };
  }
  if (node.type === 'TEXT') {
    const n = node as TextNode;
    const fillColor = n.fills && (n.fills as any[])[0]?.color;
    return {
      ...base, type: 'text',
      style: {
        content: n.characters,
        fontSize: typeof n.fontSize === 'number' ? n.fontSize : 16,
        fontWeight: '700',
        fontFamily: typeof n.fontName !== 'symbol' ? n.fontName.family : 'Inter, sans-serif',
        fill: fillColor ? hexFromFigmaRGB(fillColor.r, fillColor.g, fillColor.b) : '#ffffff',
        align: 'center',
      }
    };
  }
  // Default fallback
  return { ...base, type: 'rect', style: { width: 100, height: 100, fill: '#6c63ff', borderRadius: 0 } };
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'export-selection') {
    const selection = figma.currentPage.selection;
    if (!selection.length) {
      figma.ui.postMessage({ type: 'error', message: 'Select at least one layer in Figma first.' });
      return;
    }

    const layers = selection.map(node => nodeToMAFLayer(node));
    const scene = {
      version: '0.2',
      meta: {
        name: figma.currentPage.name || 'Figma Import',
        duration: 2000, fps: 60,
        canvas: { width: 800, height: 450 },
        background: '#0d0d12',
        description: `Imported from Figma: ${figma.currentPage.name}`,
      },
      assets: [],
      layers,
      compositions: [],
      intent: 'Imported from Figma — add keyframes to animate',
    };

    figma.ui.postMessage({ type: 'scene-ready', scene });
  }

  if (msg.type === 'close') figma.closePlugin();
};
