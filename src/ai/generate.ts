import { MAFScene } from '../schema/maf';
import { useAIStore } from '../store/aiStore';

const SYSTEM_PROMPT = `You are an expert motion graphics AI. Convert natural language into Motion Animation Format (MAF) v0.2 — a JSON scene graph.

MAF SCHEMA v0.2:
{
  "version": "0.2",
  "meta": { "name": string, "duration": number(ms), "fps": 60, "canvas": {"width":800,"height":450}, "background": hex, "description": string },
  "assets": [],
  "layers": [Layer],
  "compositions": [],
  "intent": string
}

Layer types:
- rect:   { id, name, type:"rect", visible:true, locked:false, blendMode:"normal", transform, keyframes, style:{width,height,fill(hex),stroke?,strokeWidth?,borderRadius?,shadow?} }
- circle: { id, name, type:"circle", visible:true, locked:false, blendMode:"normal", transform, keyframes, style:{radius,fill(hex),stroke?,strokeWidth?} }
- text:   { id, name, type:"text", visible:true, locked:false, blendMode:"normal", transform, keyframes, style:{content,fontSize,fontWeight,fontFamily,fill(hex),letterSpacing?,align?} }

Transform: { position:{x,y}, scale:{x,y}, rotation:number, opacity:number, anchor:{x:0,y:0} }
Keyframe: { time:number(ms), properties:{opacity?,scale?,position?,rotation?,fill?,width?,height?}, easing:string }

Easings: linear | easeInQuad | easeOutQuad | easeOutCubic | easeOutBack | easeOutBounce | spring | easeOutElastic

RULES (follow strictly):
- Canvas center = {x:400, y:225}. Position all elements relative to this.
- Always 2+ keyframes per animated layer, starting at time=0 or near it
- Use STAGGERED timing — layers don't all start at the same time
- Use spring/easeOutBack for organic, alive feel
- Vibrant, intentional color palettes — not boring grays
- duration between 1500ms and 3000ms
- Layer IDs: "layer_001", "layer_002", etc.
- Animate at least opacity and scale for every layer
- Set meaningful "intent" field describing the feel

EXAMPLE OUTPUT (logo reveal):
{
  "version":"0.2",
  "meta":{"name":"Logo Reveal","duration":2000,"fps":60,"canvas":{"width":800,"height":450},"background":"#0d0d18","description":"Clean logo reveal"},
  "assets":[],
  "layers":[
    {"id":"layer_001","name":"Background Rect","type":"rect","visible":true,"locked":false,"blendMode":"normal",
     "transform":{"position":{"x":400,"y":225},"scale":{"x":1,"y":1},"rotation":0,"opacity":1,"anchor":{"x":0,"y":0}},
     "keyframes":[
       {"time":0,"properties":{"opacity":0,"scale":{"x":0.8,"y":0.8}},"easing":"easeOutCubic"},
       {"time":600,"properties":{"opacity":1,"scale":{"x":1,"y":1}},"easing":"easeOutCubic"}
     ],
     "style":{"width":200,"height":80,"fill":"#6c63ff","borderRadius":12}},
    {"id":"layer_002","name":"Title","type":"text","visible":true,"locked":false,"blendMode":"normal",
     "transform":{"position":{"x":400,"y":225},"scale":{"x":1,"y":1},"rotation":0,"opacity":1,"anchor":{"x":0,"y":0}},
     "keyframes":[
       {"time":300,"properties":{"opacity":0,"position":{"x":400,"y":245}},"easing":"easeOutBack"},
       {"time":900,"properties":{"opacity":1,"position":{"x":400,"y":225}},"easing":"easeOutBack"}
     ],
     "style":{"content":"STUDIO","fontSize":28,"fontWeight":"800","fontFamily":"Inter, sans-serif","fill":"#ffffff","letterSpacing":6,"align":"center"}}
  ],
  "compositions":[],
  "intent":"Clean logo reveal with staggered fade-in and spring entrance"
}

Return ONLY valid JSON. No markdown. No explanation. No backticks.`;

const EDIT_SYSTEM_PROMPT = `You are an expert motion graphics AI. You receive a MAF v0.2 scene JSON and an edit instruction.
Return ONLY a JSON object with the fields that need to change, deep-merged into the existing scene.
If the user wants to change a layer, return: {"layers": [...all layers with the modification...]}.
If changing meta, return: {"meta": {...updated meta...}}.
Return ONLY valid JSON. No markdown. No explanation.`;

export async function generateScene(prompt: string, onToken?: (t: string) => void): Promise<MAFScene> {
  const apiBase = import.meta.env.VITE_OLLAMA_API_BASE;
  const model = useAIStore.getState().selectedModel;
  console.log('[generateScene] apiBase:', apiBase, 'model:', model);
  console.log('[generateScene] All env vars:', import.meta.env);
  if (!apiBase || !model) throw new Error('Set VITE_OLLAMA_API_BASE and select a model.');

  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      format: 'json',
      options: { num_ctx: 4096 },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create a motion animation for: "${prompt}"` }
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${err}`);
  }

  let data: any;
  try {
    data = await response.clone().json();
  } catch (err: any) {
    const txt = await response.clone().text();
    console.error('[generateScene] Failed to parse JSON response:', err?.message, 'body:', txt);
    // Try to parse the raw text as JSON as a fallback
    try {
      data = JSON.parse(txt);
    } catch (err2) {
      throw new Error(`Failed to parse JSON from API response: ${err?.message}. Response body: ${txt.slice(0,1000)}`);
    }
  }

  const raw = await extractRawText(data, response);
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean) as MAFScene;
  } catch {
    // Attempt auto-repair
    const repaired = await repairJson(clean);
    return repaired;
  }
}

export async function editScene(scene: MAFScene, instruction: string): Promise<Partial<MAFScene>> {
  const apiBase = import.meta.env.VITE_OLLAMA_API_BASE;
  const model = useAIStore.getState().selectedModel;
  if (!apiBase || !model) throw new Error('Set VITE_OLLAMA_API_BASE and select a model.');

  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      format: 'json',
      options: { num_ctx: 4096 },
      messages: [
        { role: 'system', content: EDIT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Current scene:\n${JSON.stringify(scene, null, 2)}\n\nEdit instruction: "${instruction}"`
        }
      ],
    }),
  });

  let data: any;
  try {
    data = await response.clone().json();
  } catch (err: any) {
    const txt = await response.clone().text();
    console.error('[editScene] Failed to parse JSON response:', err?.message, 'body:', txt);
    try {
      data = JSON.parse(txt);
    } catch (err2) {
      throw new Error(`Failed to parse JSON from API response: ${err?.message}. Response body: ${txt.slice(0,1000)}`);
    }
  }

  const raw = await extractRawText(data, response);
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err: any) {
    throw new Error(`Failed to parse generated JSON: ${err?.message}. Generated text: ${clean.slice(0,1000)}. Raw response: ${raw.slice(0,2000)}`);
  }
}

async function repairJson(broken: string): Promise<MAFScene> {
  const apiBase = import.meta.env.VITE_OLLAMA_API_BASE;
  const model = useAIStore.getState().selectedModel;
  if (!apiBase || !model) throw new Error('Set VITE_OLLAMA_API_BASE and select a model.');

  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      format: 'json',
      options: { num_ctx: 4096 },
      messages: [
        { role: 'system', content: 'Fix the following broken JSON so it is valid MAF v0.2. Return ONLY valid JSON, nothing else.' },
        { role: 'user', content: broken }
      ],
    }),
  });
  let data: any;
  try {
    data = await response.clone().json();
  } catch (err: any) {
    const txt = await response.clone().text();
    console.error('[repairJson] Failed to parse JSON response:', err?.message, 'body:', txt);
    try {
      data = JSON.parse(txt);
    } catch (err2) {
      throw new Error(`Failed to parse JSON from API response: ${err?.message}. Response body: ${txt.slice(0,1000)}`);
    }
  }

  const raw = await extractRawText(data, response);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  if (!cleaned) {
    const txt = await response.clone().text().catch(() => '');
    throw new Error(`repairJson returned empty content. Response body: ${txt.slice(0,2000)}`);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(`repairJson failed to parse repaired JSON: ${err?.message}. Response: ${cleaned.slice(0,2000)}`);
  }
}

async function extractRawText(data: any, response?: Response): Promise<string> {
  let raw = '';
  if (data) {
    if (Array.isArray(data.content)) {
      raw = data.content.map((b: any) => (b?.text ?? b)).join('');
    } else if (Array.isArray(data.choices)) {
      raw = data.choices.map((c: any) => (c.message?.content ?? c.text ?? JSON.stringify(c))).join('');
    } else if (typeof data === 'string') {
      raw = data;
    } else if (data.message && typeof data.message === 'string') {
      raw = data.message;
    } else {
      // Fallback: try to stringify small objects
      try {
        raw = JSON.stringify(data);
      } catch {
        raw = '';
      }
    }
  }

  if ((!raw || raw.trim() === '') && response) {
    try {
      raw = await response.clone().text();
    } catch {
      raw = raw || '';
    }
  }

  return raw || '';
}
