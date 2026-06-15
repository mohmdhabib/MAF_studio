(async () => {
  try {
    const body = {
      model: 'llama3.1',
      messages: [{ role: 'user', content: 'Test short prompt for MAF JSON output' }],
      max_tokens: 200,
    };

    const r = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Upstream status:', r.status);
    const txt = await r.text();
    console.log('Upstream body length:', txt.length);
    console.log('Upstream body (first 2000 chars):');
    console.log(txt.slice(0, 2000));
  } catch (err) {
    console.error('Upstream test failed:', err);
  }
})();
