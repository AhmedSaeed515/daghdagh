# Contributing

## Setup

There is no build step. Serve the repository root with a static server:

```bash
python3 -m http.server 8080
```

## Guidelines

- Keep the app dependency-free and in a single `index.html` unless a change clearly needs more files.
- Visual changes go in `theme.css`; keep the palette variables (paper, ink, red accent) at the top of that file.
- Keep the UI right-to-left and test on a phone-sized viewport (about 390px wide).
- When you change any cached file, bump the `CACHE` name in `sw.js` so users get the new version.
- New questions: keep the existing data shape, use Egyptian Arabic wording, and check every fact against a reliable source. Fewer verified questions beat more unverified ones.
- Use short, imperative commit messages, for example `Add history questions` or `Fix timer on bluff mode`.

## Pull requests

1. Branch from `main`.
2. Test classic and bluff modes with two devices (or two browser tabs) if you touched networking.
3. Describe what changed and attach a screenshot for visual changes.
