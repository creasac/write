# Writing

A plain, full-page writing surface with browser WebMCP tools `read_text` and `write_text`.

## Run locally

From this folder:

```sh
python3 -m http.server 4392 --bind 127.0.0.1
```

Open http://127.0.0.1:4392/ in a browser. If that port is already serving the existing preview, use another port, such as 4393.

Typing works in ordinary browsers. WebMCP requires a browser exposing `document.modelContext` (or `navigator.modelContext`) and an assistant that can use page tools; it has been verified in the Codex in-app browser. The tools operate on this open page. Read first, then pass the returned revision as `expected_revision` when writing. A stale revision is rejected.

Text and its revision are saved in sessionStorage for this tab. Reloading restores them; closing the tab normally clears them. Browser session restore may recover a closed tab and its session data, and duplicating a tab may copy its initial session. Independently opened tabs have separate sessions. If storage is blocked or full, writing still works in memory but may not survive reload. No localStorage is used. There is no backend, remote MCP server, login, or saved text in this repository. No dependencies or build step are needed.
