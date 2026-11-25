# Changelog

All notable changes to this project are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/).

## [3.0.0] - 2026-11-25

### Changed
- The game is now called Daghdagh (دغدغ). Earlier entries below use the names it had at the time (Logz+, ZAKA ARENA, BOOM, Falta).
- Repository renamed to `daghdagh`; the live site moved to https://ahmedsaeed515.github.io/daghdagh/.
- Retro paper-and-ink look with a red accent; new animated controller logo (a fist breaks a controller in two).
- Riddles mode removed.
- Question banks expanded (Egypt governorates, science, capitals, flags and more).

### Added
- Slogan: العب، اتحدّى، دغدغ.
- Join by invite link or QR code with a nickname only.
- Helpers in online classic games: 50/50, skip, double points.
- Host board: skip the current question, end the game, remove a player.

## [2.1.0] - 2026-11-25

### Changed
- Question count is a free choice from 10 to 30.
- Difficulty picker removed. Every game mixes easy, medium and hard questions at random.
- Points by difficulty: easy 5, medium 10, hard 20.
- Category picker starts empty with a select-all button. A game needs at least 6 categories.
- Flags category now covers 225 countries and territories, embedded so it works offline.
- Docs updated to the new name.

## [2.0.0] - 2026-11-25

### Changed
- Renamed the game to Falta (فلتة) with a new logo.
- New playful pop redesign.

### Added
- Picture categories: flags, landmark photos, date cards, emoji movies.

## [1.2.1] - 2026-11-25

### Changed
- Renamed the game to BOOM (بوم).
- New owl mascot logo and app icon.

## [1.2.0] - 2026-11-25

### Added
- Bottom tab bar with Home, Categories, Online and Profile sections.
- Category browser with live search, all/selected filters and per-category question counts.
- Game setup with steppers for players and rounds.
- Room settings for online hosts: rounds, max players (2-8), and join mode (anyone with the code or host approval with accept/reject).
- Profile screen: saved display name (used in online rooms), best score, games played, sound toggle.
- Join requests wait up to 60 seconds while a host reviews them.

### Changed
- New "midnight arcade" visual theme: deep violet surfaces, lime accents, row-style mode cards.
- Logo and app icon recolored to lime and violet.
- Service worker cache bumped to `logz-plus-v6`.

## [1.1.0] - 2026-11-25

### Changed
- Renamed the game from Logz+ to ZAKA ARENA (ذكاء أرينا).
- New dark neon gaming theme (`theme.css`) and new logo and app icon.
- Service worker cache bumped to `logz-plus-v5` and now caches the theme and logo.
- Added project documentation, MIT license, and contributing guide.

## [1.0.0] - 2026-11-25

### Added
- First public release as an installable PWA on GitHub Pages.
- 698 questions in 32 categories, 35 riddles.
- Classic, riddles and bluff modes; lifelines and timer.
- Online rooms for playing with friends from separate devices.
- Offline support through a service worker (`logz-plus-v2` cache).
- SVG app icon and web app manifest (RTL, Arabic).
