# FED v2 — Pending Work

Constraints: v2 only (do not touch `fed-wabis-v3/`); no external libraries or frameworks.

Completed items are recorded in [DONE.md](DONE.md). The pending list below covers the next refactor surface.

## Pending

_(none — the Phase 10 batch cleared the queue. See "Out of scope" for what's intentionally not on the list.)_

## Out of scope

- Further splitting of `app.js` (~450 lines): `FeDomeApp` data + lifecycle methods (`Init`, `Update`, `OnMouseMove`, `OnScroll`) are cohesive. Scattering them would be churn for no clear gain.
- Walter's library code (`jsg.js` + `jsgx3d.js`, ~1500 reformatted lines): keep as-is unless a concrete bug or feature requires touching. No replacement planned.
- DataX / ModelAnimation: reformatted to multi-line in Phase 9c but internals untouched. They're stable; don't rewrite.
- `xEvent` wrapper: still allocates a wrapper object per DOM event (via `xAddEvent`). Could be flattened to native `addEventListener`, but jsg's mouse handling uses `event.PreventDefault()` / `event.offsetX` from the wrapper API. Not worth the surgery.
- Two-finger pinch-zoom on touch: `jsgMouseHandler` only handles single-finger drag; pinch falls through to the browser. Adding it would mean tracking two simultaneous touches and computing distance deltas. Out of scope until someone uses the app on a phone and complains.
