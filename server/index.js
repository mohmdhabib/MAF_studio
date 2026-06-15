import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const API_BASE = process.env.VITE_OLLAMA_API_BASE || 'http://localhost:11434';
const MODEL = process.env.VITE_OLLAMA_MODEL || 'llama3.1';

app.get('/api/health', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/tags`);
    const json = await r.json();
    return res.json({ ok: true, models: json.models || [] });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err) });
  }
});

// POST /api/generate { prompt: string, max_tokens?: number }
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, max_tokens = 1500 } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt in request body' });
    console.log('[proxy] /api/generate prompt length:', (prompt || '').length);

    const body = {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
    };

    // Add a timeout to avoid hanging on streaming responses
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let r;
    try {
      r = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('[proxy] fetch error:', fetchErr?.message || fetchErr);
      return res.status(502).json({ ok: false, error: String(fetchErr) });
    }

    clearTimeout(timeout);

    const text = await r.text().catch(e => {
      console.error('[proxy] error reading response text:', e?.message || e);
      return '';
    });
    // Try to parse JSON, else return raw text for debugging
    console.log('[proxy] /api/generate upstream status:', r.status, 'body length:', text.length);
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (err) {
      res.status(r.ok ? 200 : 502).json({ ok: false, parseError: String(err), body: text.slice(0, 2000) });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Temporary mock endpoint for debugging
app.post('/api/generate-mock', (req, res) => {
  const prompt = (req.body && req.body.prompt) || 'mock';
  const scene = {
    version: '0.2',
    meta: { name: 'Mock', duration: 2000, fps: 60, canvas: { width: 800, height: 450 }, background: '#000000', description: prompt },
    assets: [],
    layers: [
      { id: 'layer_001', name: 'Rect', type: 'rect', visible: true, locked: false, blendMode: 'normal', transform: { position: { x: 400, y: 225 }, scale: { x: 1, y: 1 }, rotation: 0, opacity: 1, anchor: { x: 0, y: 0 } }, keyframes: [ { time: 0, properties: { opacity: 0, scale: { x: 0.8, y: 0.8 } }, easing: 'easeOutBack' }, { time: 600, properties: { opacity: 1, scale: { x: 1, y: 1 } }, easing: 'easeOutBack' } ], style: { width: 200, height: 80, fill: '#6c63ff' } }
    ],
    compositions: [],
    intent: 'Mock scene for testing'
  };
  res.json({ ok: true, scene });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Ollama proxy server listening on http://localhost:${port}`);
});

// Note: For production, run this server on Node 18+ and protect access. If you want LangChain
// integration, install `langchain` on the server and build chains here, returning results to the client.
