# AGENTS.md

## Cursor Cloud specific instructions

This is a static HTML/CSS/JS project (Finnish savings calculator dashboard) with **zero dependencies** — no `package.json`, no build tools, no package manager.

### Running the app

Serve files over HTTP (required for iframe `postMessage` and IndexedDB to work — `file://` protocol will not work):

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in a browser.

### Project structure

- `index.html` — Slideshow controller, rotates between the three views via iframes (5s per view)
- `laskuri.html` — Real-time lunch savings calculator
- `kuvat.html` — Photo slideshow (images stored in browser IndexedDB)
- `goals.html` — Shared goals/todo list (data stored in browser localStorage)
- `style.css` — Shared styles

### Notes

- No lint, test, or build commands exist. Validation is manual (browser-based).
- All state is client-side (localStorage / IndexedDB). No server-side logic.
