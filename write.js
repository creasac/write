(() => {
  const editor = document.querySelector('textarea');
  let revision = 0;
  const storageKey = 'write.session.v1';
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && typeof saved.text === 'string' && saved.text.length <= 1000000 && Number.isSafeInteger(saved.revision) && saved.revision >= 0) {
      editor.value = saved.text;
      revision = saved.revision;
    }
  } catch { /* Editing remains available when session storage is blocked or malformed. */ }
  const persist = () => {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ text: editor.value, revision })); }
    catch { /* Storage failures must not interrupt editing or WebMCP. */ }
  };
  editor.addEventListener('input', () => { revision++; persist(); });
  const result = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }] });
  const read = () => result({ text: editor.value, revision });
  const write = ({ text, expected_revision }) => {
    if (typeof text !== 'string' || text.length > 1000000 || !Number.isSafeInteger(expected_revision)) return { isError: true, ...result({ error: 'Valid text and expected_revision required' }) };
    if (expected_revision !== revision) return { isError: true, ...result({ error: 'Revision conflict. Read again before a write.', revision }) };
    editor.value = text;
    revision++;
    persist();
    editor.focus();
    editor.setSelectionRange(text.length, text.length);
    return read();
  };
  const tools = [
    { name: 'read_text', description: 'Read the current text and revision from this open local Write page.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, execute: read },
    { name: 'write_text', description: 'Replace text in this open local Write page. Read first and supply its revision to avoid overwriting new typing.', inputSchema: { type: 'object', properties: { text: { type: 'string', maxLength: 1000000 }, expected_revision: { type: 'integer', minimum: 0 } }, required: ['text', 'expected_revision'], additionalProperties: false }, execute: write }
  ];
  function register() {
    const context = document.modelContext || navigator.modelContext;
    document.documentElement.dataset.webmcp = context ? 'available' : 'unavailable';
    if (!context) return false;
    for (const tool of tools) context.registerTool(tool);
    return true;
  }
  if (!register()) {
    const retry = setInterval(() => { if (register()) clearInterval(retry); }, 250);
    setTimeout(() => clearInterval(retry), 15000);
  }
})();
