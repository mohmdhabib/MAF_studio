import { MAFScene } from '../schema/maf';
import { render } from '../renderer/engine';

export interface FrameCaptureOptions {
  scene: MAFScene;
  scale?: number; // resolution multiplier (1 = canvas size, 2 = 2x for higher quality)
  onProgress?: (current: number, total: number) => void;
}

/**
 * Renders every frame of the scene to PNG byte arrays (for ffmpeg)
 * or ImageData (for gif.js), at the scene's fps.
 */
export async function captureFrames(opts: FrameCaptureOptions): Promise<{
  frames: Uint8Array[];
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
}> {
  const { scene, scale = 1, onProgress } = opts;
  const width = scene.meta.canvas.width * scale;
  const height = scene.meta.canvas.height * scale;
  const fps = scene.meta.fps;
  const totalFrames = Math.round((scene.meta.duration / 1000) * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (scale !== 1) ctx.scale(scale, scale);

  const frames: Uint8Array[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const time = (i / fps) * 1000;
    render(ctx, scene, Math.min(time, scene.meta.duration - 0.001));

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'));
    const buf = new Uint8Array(await blob.arrayBuffer());
    frames.push(buf);

    if (onProgress) onProgress(i + 1, totalFrames);
    // Yield to UI thread periodically
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  return { frames, width, height, fps, totalFrames };
}

/**
 * Renders frames directly as ImageData (faster, no PNG encode) — used for GIF export.
 */
export async function captureFramesAsImageData(opts: FrameCaptureOptions): Promise<{
  frames: ImageData[];
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
}> {
  const { scene, scale = 1, onProgress } = opts;
  const width = scene.meta.canvas.width * scale;
  const height = scene.meta.canvas.height * scale;
  const fps = scene.meta.fps;
  const totalFrames = Math.round((scene.meta.duration / 1000) * fps);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (scale !== 1) ctx.scale(scale, scale);

  const frames: ImageData[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const time = (i / fps) * 1000;
    render(ctx, scene, Math.min(time, scene.meta.duration - 0.001));
    frames.push(ctx.getImageData(0, 0, width, height));

    if (onProgress) onProgress(i + 1, totalFrames);
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  return { frames, width, height, fps, totalFrames };
}
