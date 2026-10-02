# D'Games

An instant-play browser arcade with eleven games, illustrated SVG covers, search, saved favorites, and genre collections.

## Run locally

Serve the `public` directory from a local web server, for example:

```sh
python3 -m http.server 8000 --directory public
```

Then open `http://localhost:8000`. Root-relative asset paths require serving `public` as the site root. The catalog games are static. Experimental API-backed pages are not part of the catalog and need the existing server environment.

## Development and tests

```sh
npm ci
npm run build:styles
CHROME_BIN=/path/to/chrome npm test
```

The smoke suite uses Playwright with an installed Chrome, serves the site on port 8123, and writes screenshots to `/tmp/dgames-test` (override with `ARTIFACTS_DIR`). It checks all catalog routes, starts games, checks 3XO board interaction, exercises search, empty/reset states, genre collections, favorites persistence and corrupted-storage recovery, player close/restart, and responsive widths.

`game-utilities.css` is checked in. Tailwind is used only at development time, not shipped as a runtime JavaScript compiler. Rebuild the styles if you change utility classes in the four classic games.

## Redesign scope

- Warm paper surfaces, lime accents, responsive sidebar/bottom navigation.
- Original local SVG covers for all eleven catalog games, with fixed image dimensions and lazy loading.
- Honest collections based on the catalog, not placeholder artwork or invented game counts.
- Player focus handling, loading feedback, source-checked Home messages, iframe teardown on close, and no duplicate embedded game navigation.
- Local compiled styles and system-font fallbacks for classic games.
- Fixes for the shared UI syntax, Ripple Reaction syntax and frame-rate timing, Orbit Guard's start-handler naming conflict, and 3XO full-board draw detection.
- The four classic games pause when their document is hidden; resuming remains a player action.
- Echo Drift's cache version updated for shared assets; missing assets no longer receive HTML as a fallback.

This review branch was prepared against main commit `ef3ccfa`. Existing open pull requests and experimental prototypes are intentionally unchanged. Smoke tests are not a substitute for extended gameplay testing on physical phones and multiple browsers.
