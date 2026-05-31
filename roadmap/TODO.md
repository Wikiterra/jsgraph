# FED v2 — Pending Work

Constraints: v2 only (do not touch `fed-wabis-v3/`); no external libraries or frameworks.

Completed items are recorded in [DONE.md](DONE.md). The pending list below covers the next refactor surface.

## High-priority — latent bugs

- [ ] **`Containes` typo in `xCallbackChain.prototype.Add`** ([assets/wiki.js:173](assets/wiki.js#L173)). Reads `this.Containes(aFunc)`; the actual method is `Contains`. Gated by `if (once && ...)` so it only fires when a caller passes `once=true` — which is why it has survived. Any such call today would throw `TypeError: this.Containes is not a function`. Fix: rename to `this.Contains(aFunc)`.
- [ ] **`arguments.lenth` typo in `xArrFind` / `xArrFindIndex`** ([assets/wiki.js:27](assets/wiki.js#L27), [:32](assets/wiki.js#L32)). The `thisArg` parameter is silently ignored because the check reads `lenth` (sic). No current caller passes a 4th arg, but the helper documents one — fix the typo so it actually works.
- [ ] **`aria-controls="FeGraph-Canvas"`** on the 6 visible demo tabs in [index.html:17-22](index.html#L17). The actual canvas id is `FeGraph` (set in [assets/app.js:219](assets/app.js#L219), `Id: 'FeGraph'`); `FeGraph-Canvas` doesn't exist. Either change the value to match the real id or remove the `aria-controls` attribute.

## Cleanup — modern-browser polyfills

- [ ] **Drop dead browser polyfills in [assets/wiki.js:237-252](assets/wiki.js#L237).** Three blocks target browsers older than anything we render to: the `requestAnimationFrame` vendor-prefix loop + `setTimeout` fallback, the `Object.create` shim, and the `Math.log10` shim. Total ~15 lines. The codebase already uses `ResizeObserver`, `MutationObserver`, native `classList`, and CSS custom properties, so the assumed browser floor is well above IE.
- [ ] **`Function.prototype.inheritsFrom`** ([assets/wiki.js:251](assets/wiki.js#L251)) — used once by `jsgx3d.js:145` (`JsGraphX3D.inheritsFrom(JsGraph)`). Either keep it (minor) or inline `JsGraphX3D.prototype = Object.create(JsGraph.prototype)` at that single call site and drop the prototype pollution.

## Cleanup — small consistency issues

- [ ] **`UpdateAll(stopAnimation)` declared as 1-arg, called as 2-arg.** Three call sites in [assets/app.js](assets/app.js) pass `UpdateAll(false, false)` / `UpdateAll(true, false)` (lines 384, 392, 400) and the second arg is silently dropped. Either drop the redundant arg from callers or restore the second arg's intended meaning (looking at git history may help — it was probably `redraw` in the legacy code).
- [ ] **`.TabActive` has no CSS rule.** [assets/demos-manager.js](assets/demos-manager.js) adds the `TabActive` class to the currently-playing demo button + the play button (when active), but `css/styles.css` has zero rules for `.TabActive`. The active state is currently invisible. Either add a styling rule (e.g., a subtle pulse / glow) or drop the dead `TabActive` toggles from demos-manager.js.
- [ ] **`gesture-hint` is mouse-only.** The hint pill in [index.html:238-241](index.html#L238) reads "Left-drag · Right-drag · Scroll" — these are mouse gestures. On touch devices, jsgMouseHandler may translate touch to mouse but pinch-to-zoom + two-finger rotate aren't mentioned. Either verify mobile gestures work and update the hint text, or document that the app is desktop-only.

## Out of scope

- Further splitting of `app.js` (453 lines): `FeDomeApp` data + lifecycle methods (`Init`, `Update`, `OnMouseMove`, `OnScroll`) are cohesive. Scattering them would be churn for no clear gain.
- Walter's library code (`jsg.js` + `jsgx3d.js`, ~1500 reformatted lines): keep as-is unless a concrete bug or feature requires touching. No replacement planned.
- DataX / ModelAnimation: reformatted to multi-line in Phase 9c but internals untouched. They're stable; don't rewrite.
