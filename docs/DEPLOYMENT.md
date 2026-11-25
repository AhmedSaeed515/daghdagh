# Deployment

## Hosting

The site is served by GitHub Pages from the `main` branch, root folder (`Settings > Pages`). URL: https://ahmedsaeed515.github.io/logz-plus/

## Release steps

1. Make and test changes locally (`python3 -m http.server 8080`).
2. If any cached file changed, bump `CACHE` in `sw.js` (for example `logz-plus-v5`).
3. Add an entry to `CHANGELOG.md`.
4. Commit and push to `main`.
5. Wait for the Pages build (usually under two minutes) and open the live URL. Reload twice so the new service worker takes over.

## Verifying a release

- Open the live URL on a phone-sized viewport and start one game in each mode.
- In browser dev tools, `Application > Service Workers` should show the worker active, and `Manifest` should show no errors.
- Check that the app loads in airplane mode after the first visit.

## Custom domain (optional)

Add a `CNAME` file with the domain and set it under `Settings > Pages`. Update `start_url` and `scope` in `manifest.json` only if the app moves to a sub-path.
