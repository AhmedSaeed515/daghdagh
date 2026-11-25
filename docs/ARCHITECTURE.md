# Architecture

دغدغ (Daghdagh) is a static, dependency-free PWA. No build step. Scripts load in order from `index.html`.

```
index.html          HTML shell only
manifest.json       PWA manifest
sw.js               service worker (cache daghdagh-v33)
assets/             icon.svg, logo.svg
css/base.css        layout and components
css/theme.css       palette B (paper, ink, red) and the animated logo
js/data/            question banks, categories, flags, avatars (plain data)
js/lib/             Util, Store, Sound (small helper classes)
js/online/online.js online rooms, relay client, host and guest logic
js/app/app.js       views, Classic and Bluff modes, events
js/main.js          boot and service worker registration
```

## Load order
data files, then `js/lib/*`, then `online.js`, then `app.js`, then `main.js`.

## Classes
- `Util`: DOM and text helpers (`$`, `app`, `esc`, `shuffle`, `norm`).
- `Store`: localStorage wrapper. Key prefix `lo3ba_` (kept so saved profiles keep working).
- `Sound`: small WebAudio sound effects.

Online rooms use the relay topic prefix `lgz-` (kept so existing rooms keep working).

## Rules baked into the game
Points: easy 5, medium 10, hard 20. At least 6 categories per game. 10 to 30 questions. Classic and Bluff are online only. Default max players 8, host can raise it to 16.

## Next
`app.js` and `online.js` are still closures. They will be split into classes (router, game engine, room client, views) with no behavior change.

## Question banks and media

- Banks live in `js/data/questions/qb*.js`; each pushes rows `[cat, difficulty, text, right, wrong1, wrong2, wrong3]` into `window.QX`. New batches are added as new files and wired in `index.html` and `sw.js` (bump `?v=` and the cache name). Old banks are never removed.
- Photo rows embed `§P:url|credit§`; portraits (text contains «صاحب») use a contain-fit box (`.pt`). Audio rows use short wav/mp3 clips.

## Online modes (js/online/online.js)

The host's phone is authoritative (state `H`) and broadcasts `pubState()` over the relay; clients render `S`. Phases: lobby, q/wr/vt/rv (classic, bluff), id/iv/ir (imposter), fin.
- Teams: `cfg.teams` (0, 2-4) and `p.tm`; `tmTotals` sums member scores. Default off.
- Imposter: the host picks theme, word and imposter from `js/data/imposter-words.js`, then sends the word privately to each non-imposter (`iw` messages, resent while discussing). Votes (`iv`) are tallied at reveal.
- Filter: `lgzBad` in `js/data/badwords.js` checks names (host replaces a bad name with "لاعب N") and bluff answers (rejected).
