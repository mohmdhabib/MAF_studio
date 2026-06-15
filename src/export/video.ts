import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { MAFScene } from '../schema/maf';
import { captureFrames } from './frameCapture';

export type VideoFormat = 'mp4' | 'webm' | 'gif';

export interface VideoExportOptions {
  scene: MAFScene;
  format: VideoFormat;
  transparent?: boolean; // for webm/mov — keep alpha channel
  scale?: number;
  onProgress?: (stage: string, pct: number) => void;
}

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on('log', ({ message }) => onLog(message));

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  ffmpegLoaded = true;
  return ffmpeg;
}

/**
 * Exports the scene as a video file. Returns a Blob ready for download.
 */
export async function exportVideo(opts: VideoExportOptions): Promise<Blob> {
  const { scene, format, transparent, scale = 1, onProgress } = opts;

  onProgress?.('Loading renderer…', 0);
  const ffmpeg = await getFFmpeg();

  onProgress?.('Rendering frames…', 5);
  const { frames, fps, totalFrames } = await captureFrames({
    scene, scale,
    onProgress: (cur, total) => onProgress?.('Rendering frames…', 5 + Math.round((cur / total) * 45)),
  });

  // Write frames to ffmpeg's virtual filesystem
  for (let i = 0; i < frames.length; i++) {
    const filename = `frame${String(i).padStart(5, '0')}.png`;
    await ffmpeg.writeFile(filename, frames[i]);
    onProgress?.('Preparing frames…', 50 + Math.round((i / totalFrames) * 15));
  }

  onProgress?.('Encoding video…', 65);

  let outputName: string;
  let args: string[];

  if (format === 'mp4') {
    outputName = 'output.mp4';
    args = [
      '-framerate', String(fps),
      '-i', 'frame%05d.png',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '18',
      '-movflags', '+faststart',
      outputName,
    ];
  } else if (format === 'webm') {
    outputName = 'output.webm';
    args = transparent
      ? ['-framerate', String(fps), '-i', 'frame%05d.png', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '2M', outputName]
      : ['-framerate', String(fps), '-i', 'frame%05d.png', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', '2M', outputName];
  } else {
    // GIF
    outputName = 'output.gif';
    args = [
      '-framerate', String(fps),
      '-i', 'frame%05d.png',
      '-vf', `fps=${Math.min(fps, 24)},scale=${scene.meta.canvas.width * scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      '-loop', '0',
      outputName,
    ];
  }

  await ffmpeg.exec(args);
  onProgress?.('Finalizing…', 95);

  const data = await ffmpeg.readFile(outputName);
  const mimeType = format === 'mp4' ? 'video/mp4' : format === 'webm' ? 'video/webm' : 'image/gif';
  const bytes = data as Uint8Array;
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });

  // Cleanup virtual filesystem
  for (let i = 0; i < frames.length; i++) {
    await ffmpeg.deleteFile(`frame${String(i).padStart(5, '0')}.png`).catch(() => {});
  }
  await ffmpeg.deleteFile(outputName).catch(() => {});

  onProgress?.('Done', 100);
  return blob;
}

/**
 * Quick PNG sequence export (zip of frames) — fallback when ffmpeg fails or for fast preview.
 */
export async function exportPngSequence(scene: MAFScene, scale = 1, onProgress?: (cur: number, total: number) => void): Promise<Blob[]> {
  const { frames } = await captureFrames({ scene, scale, onProgress });
  return frames.map(f => new Blob([new Uint8Array(f)], { type: 'image/png' }));
}
