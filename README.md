<p align="center"><img src="logo.svg" alt="Falta logo" width="120"></p>

# فلتة (Falta)

Formerly "Logz+", ZAKA ARENA and BOOM. Arabic-first trivia and riddles game, shipped as an installable, offline-capable Progressive Web App (PWA). Single-page, no build step, no backend to run.

**Live app:** https://ahmedsaeed515.github.io/logz-plus/

## Features

- 860+ questions across 36 categories (including flags of 225 countries and territories, landmark photos, date cards and emoji movies), plus 35 riddles
- Game modes: classic, riddles, bluff
- Mixed difficulty on every question: easy 5, medium 10, hard 20 points
- Pick 10 to 30 questions per game; choose at least 6 categories to start
- Category browser with live search, filters and per-category question counts
- Room settings: number of rounds, max players, and host-approved joins
- Player profile with saved name, best score and games played
- Lifelines, per-question timer, scoring
- Online rooms: friends join from their own phones with a room code
- Native-app feel: bottom tab bar, steppers, playful pop look (yellow, violet, pink, mint)
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
| `qx.js`, `flags1-3.js` | Picture questions and embedded flag images |
| `sw.js` | Service worker: offline cache for the app shell |
| `theme.css` | Playful pop theme, loaded after the base styles |
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
