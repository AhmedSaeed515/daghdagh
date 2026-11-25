<p align="center"><img src="logo.svg" alt="ZAKA ARENA logo" width="120"></p>

# ZAKA ARENA (ذكاء أرينا)

Formerly "Logz+". Arabic-first trivia and riddles game, shipped as an installable, offline-capable Progressive Web App (PWA). Single-page, no build step, no backend to run.

**Live app:** https://ahmedsaeed515.github.io/logz-plus/

## Features

- 698 trivia questions across 32 categories, plus 35 riddles
- Game modes: classic, riddles, bluff
- Lifelines, per-question timer, scoring
- Online rooms: friends join from their own phones with a room code
- Dark neon gaming look: glowing cards, gradient accents, animated logo
- Arabic (Egyptian dialect), right-to-left layout, mobile-first
- Installable (Add to Home Screen) and works offline after the first load
- Progress and settings stored locally on the device

## Quick start

No dependencies. Serve the folder with any static server (a service worker requires `http://localhost` or HTTPS):

```bash
git clone https://github.com/AhmedSaeed515/logz-plus.git
cd logz-plus
python3 -m http.server 8080
# open http://localhost:8080
```

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole app: markup, styles, question bank and game logic |
| `manifest.json` | PWA manifest (name, RTL, theme, icons) |
| `sw.js` | Service worker: offline cache for the app shell |
| `theme.css` | Dark neon theme, loaded after the base styles |
| `logo.svg` | Logo emblem used in the app header and this README |
| `icon.svg` | App icon |
| `docs/ARCHITECTURE.md` | How the app is built and how online rooms work |
| `docs/DEPLOYMENT.md` | Hosting on GitHub Pages and release steps |

## Deployment

Hosted on GitHub Pages from the `main` branch, root folder. Every push to `main` updates the live site within a couple of minutes. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Privacy

The game has no accounts and no analytics. Settings and scores stay in the browser's `localStorage`. Online rooms relay small game messages through public ntfy topics, so do not type anything private into room names or player names. See the architecture notes.

## License

[MIT](LICENSE)
