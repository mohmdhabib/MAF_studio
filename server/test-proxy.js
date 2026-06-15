(async () => {
  try {
    const health = await fetch('http://localhost:4000/api/health');
    const hj = await health.json();
    console.log('Proxy /api/health response:');
    console.log(JSON.stringify(hj, null, 2));

    const gen = await fetch('http://localhost:4000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Create a minimal MAF v0.2 scene with one rect and two keyframes', max_tokens: 800 }),
    });

    const txt = await gen.text();
    console.log('\nProxy /api/generate raw text response (trimmed 2000 chars):');
    console.log(txt.slice(0, 2000));
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
