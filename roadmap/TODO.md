# FED v2 — Pending Work

Constraints: v2 only (do not touch `fed-wabis-v3/`); no external libraries or frameworks.

Completed items are recorded in [DONE.md](DONE.md). The pending list below covers the next refactor surface.

## Future cleanup candidates

- [x] **`wiki.js` (920 → 424 lines)** — deleted `WikiMenuBarHandling`, `MarkSearch`/`highlightWord`/`highlightRegExp`/`DoMarkSearch`/`ToggleMarks`, `OnOffSections`, wiki.js's own `UrlParams` (DataX has its own), `LayoutMaximize`/`Normal`/`Fullscreen*`/`IsLayout*`, `Zoom`/`CZoom` (+ all `Zoom*` shims), `CProgressbar`/`Progressbar`, `EditPage`/`ShowUploadForm`/`ShowWikiFunctions`/`OnDocKeyDown`/`UrlEncode`/`Trim`/`OnDblCklick`/`InitWikiJS`, `MarkupMathText`/`ProcessMathText`, `AddToCookie`/`AddCBReq`/`SEL`/`SplitWords`/`decodeHtml`, `xGreek*`, `xDebug`/`xDebugOutId`/`xClearLog`/`xDbg*`, `xClipboard*`, `xImage`/`xChangeImage`/`xMultiImage`, `htmlString`, and the `xOptions`+`xTransform*` cluster. Kept `xSetCookie`/`xGetCookie`/`xDeleteCookie` (DataX), `xTimeMS` (ModelAnimation), `CImgCache`+`IC` (jsg.js); `xLog` stubbed to no-op since `CImgCache.DisplayStatus` calls it. One leftover ref to `xOptions.Transform.OffsetElement` in `xEventManager.TriggerLayoutChange` cleared.
- [ ] **`Tabs.js`** — minified engine drives demo selection. Replace with a small handwritten tab state manager once the demo task-list format is reworked.
- [ ] **`jsg.js` + `jsgx3d.js`** — Walter's custom 2D canvas API (~900 lines). No replacement planned; keep as-is.
- [x] **`app.js` (2009 → 453 lines)** — fully decomposed. `assets/demos-data.js` (`Demos.AddState`/`AddDemo` payloads + `Tpse`/`Ttxt`/`Tpnt`/`Tval` helpers), `assets/app-math.js` (24 pure-math coord/transform methods of `FeDomeApp`), `assets/app-draw.js` (25 `FeDomeApp.Draw*` methods + `DateTimeToString`), both extra-method files via `Object.assign(FeDomeApp, {...})`. `assets/demos-manager.js` (`AnimationSpeed`, `Demos` registry, and the `xOnLoad`/`xOnDomReady` Tabs button wiring). Load order in `main-v2.js`: app → app-math → app-draw → demos-manager → demos-data.
- [x] **`save-restore` panel** — verified wired and live. `index.html` has `<details class="save-restore">` with `#SaveRestorePanel` textarea + screenshot button; `app.js:DataX.AssignSaveRestoreDomObj('SaveRestorePanel')` attaches keydown(Enter)=SetAppState handler and restores from `FeDomeAppAppState` cookie on load. DataX uses `xTextControl` (xtc.js) — both kept.
- [x] **`assets/NumFormatter.js` deleted** — 88-line module had zero external references. DataX's `FormatNum` is its own internal method, not from this file. Import removed from `main-v2.js`.
- [x] **`assets/EarthMap.js` split** — 12.8 KB of continent/land polygon data extracted to `assets/earth-map-data.js` (loaded after `EarthMap.js`, mutates `EarthMap.ContinentList`). EarthMap.js now holds only the drawing methods + config; the data file is pure tabular geometry.
- [x] **Inline `onclick` removed** — save-restore panel buttons now wired through `js/ui/save-restore.js` following the existing ui/* `init()`/`sync()` contract; `index.html` no longer contains any inline JS attributes.
