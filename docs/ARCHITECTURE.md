# Architecture

## Overview

BOOM (formerly Logz+ and ZAKA ARENA) is a static single-page app. Everything the player needs ships in `index.html`; there is no server component owned by this project.

```
index.html   UI, base styles, question bank, game engine, online-room client
theme.css      dark neon theme (overrides the base styles)
logo.svg       logo emblem
manifest.json  PWA metadata
sw.js          offline cache
icon.svg       icon
```

## Game engine

- Questions and riddles are stored as data inside `index.html`, grouped into 32 categories with difficulty levels.
- A round is built from the selected categories, difficulty and round count.
- Modes: `classic` (multiple choice with timer and lifelines), `riddles`, `bluff` (players write fake answers and vote).
- Settings and local progress are saved in `localStorage` with the key prefix `lo3ba_`.

## Online rooms

Rooms use a host-authoritative model:

1. The host creates a room and gets a short code.
2. Players join with the code from their own devices.
3. The host runs the game state (phase, timers, scores) and broadcasts it to all players. Players send only their actions (join, answer, vote).
4. Messages are relayed through public ntfy topics over plain HTTPS. The client probes the servers `ntfy.envs.net`, `ntfy.adminforge.de` and `ntfy.sh` and uses the first one that responds, with retry on rate limiting.

Because relay topics are public, treat room messages as non-confidential. If the project needs private rooms later, replace the relay with an owned backend (for example WebSocket or a managed realtime service).

## Offline and caching

`sw.js` precaches the app shell (`./`, `index.html`, `theme.css`, `manifest.json`, `icon.svg`, `logo.svg`) and serves cache-first for same-origin requests. Cross-origin requests (the relay) always go to the network. Old caches are removed on activation. Bump the cache name in `sw.js` on every release that changes cached files.

## Known limitations

- The icon is SVG only. Some platforms prefer PNG icons (192px and 512px) for install prompts.
- Online rooms depend on third-party public relays and can be rate limited.
- The question bank lives inside `index.html`; moving it to a separate JSON file would make editing and review easier.
