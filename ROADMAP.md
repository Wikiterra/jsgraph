# ROADMAP — jsgraph-workspace

Tablero de estado a alto nivel. Detalle: fases en
[../MIGRATION-PLAN.md](../MIGRATION-PLAN.md), mejoras concretas en
[NEXT-STEPS.md](NEXT-STEPS.md).

> Red de seguridad antes de tocar nada: `pnpm characterize` (8 tests — 6 matemática
> + 2 render). Verde = no rompiste ni el cálculo ni el dibujo.

## ✅ Hecho

- Monorepo pnpm + Vite; ambas apps (earth-drop-calc, fed-wabis-v2) arrancan bajo Vite.
- **Vendor wabis único** para las dos apps (`packages/jsgraph-vendor/src`); copia local
  de earth-drop eliminada. Adaptado a carga dual classic/ESM. — `c1d0c28`
- **Costura Fase 3 (mínima):** `createGraph3D` (seam) sobre `NewGraphX3D`; earth-drop
  ya no nombra el motor. — `ec7c38f`
- Limpieza de andamiaje sin uso en core/vendor. — `29ec674`
- **Un solo package:** `jsgraph-core` (demasiado fino) fusionado en `jsgraph-vendor`;
  el seam vive en `jsgraph-vendor/src/core/`.
- **Build unificado** de las dos apps → `dist/` + workflow GitHub Pages. — `48c6e66`
- **Red de seguridad:** snapshots de matemática (Fase 2) + **screenshots de render**
  (canvas por app, deterministas). — `5d8c176`

## ⏳ Pendiente importante (por prioridad)

### 1. 🟢 Activar el deploy de Pages (acción manual, 1 vez)
El build y el workflow ya existen; falta conectar el repo:
`git remote add origin <url>` → push → **Settings → Pages → Source: GitHub Actions**.
Hasta esto, la web no se publica.

### 2. 🔴 earth-drop-calc → entrypoint ESM (PROYECTO, no quick win)
**Re-dimensionado:** no es solo el canvas. Los ~21 `<script>` de app en el `<body>` y
los paneles (`ControlPanel.Render → document.writeln`) se inyectan en **parse-time**,
posicionados por dónde está cada script. Migrar a ESM (deferred) exige rearquitecturar
toda la construcción del DOM (de `document.write` a montaje programático en divs target).
- **Gana:** Vite empaqueta edc como fed → se borra el plugin `copy-edc-static`, se va el
  `../../packages`, vuelve `pnpm --filter earth-drop-calc dev`, y habilita la Fase 3
  completa (depender de `core` por import, no por global).
- **Coste/riesgo:** medio-alto, ~21 ficheros + ruta de render de ControlPanel.
- **Mitigado por:** la red de render (#screenshots) ya cubre regresiones de dibujo.
- Hacer solo si se decide modernizar edc; no es obligatorio para que funcione hoy.

### 3. 🟡 Fase 4 — extraer la lógica común real entre edc y fed a `core`/`apps/shared`
Solo lo que de verdad se solape (no forzar). Requiere #2 hecho para edc.

### 4. 🟡 Fase 5 — modernizar UI / evaluar three.js — **solo si hay necesidad**
Hoy el render vectorial esquemático es una ventaja, no deuda. Si llega un 2º motor real,
la costura `createGraph3D` ya está: se extiende método a método en `wabisGraph3D.js`.

## 🔧 Mantenimiento (condicional)

- **wabis se actualiza:** re-copiar fuentes, correr `tools/esm-globalize.mjs`, reponer el
  parche de `CreateDomObjects` en `jsg.js` (`// ponytail:`), `pnpm characterize`.
  Detalle en MIGRATION-PLAN §8.
