# jsgraph-workspace

Monorepo (pnpm + TypeScript) que unifica las dos apps construidas sobre el
framework **wabis** (jsg / jsgx3d, © Walter Bislins) y elimina la duplicación
del motor gráfico entre ellas.

> Alcance: solo las apps que usan wabis. Los demás proyectos de `wikiterra-apps/`
> (clock-24h-sun, moon-photos-map, sphere-drop-calc, aether-cosmology-fed-model)
> son repos independientes y **no** forman parte de este monorepo.

## Estructura

```
packages/
  jsgraph-vendor/   Copia única del framework wabis, INTACTA (no se refactoriza).
  jsgraph-core/     Capa de abstracción SOLID (ports + adapters) sobre el vendor.
apps/
  earth-drop-calc/  Calculadora de curvatura/caída (piloto de migración).
  fed-wabis-v2/     Flat Earth Dome Model (wabis-calc-v2).
```

## Principio de dependencias (DIP)

`apps → jsgraph-core (ports) → adapters → jsgraph-vendor`

Las apps dependen de las **interfaces** de `jsgraph-core`, nunca de los globals
del framework (`JsGraphX3D`, `JsgVect3`, …). Así, cambiar el motor de render en
el futuro (p. ej. a three.js) es escribir un adapter nuevo, sin tocar las apps.

## Comandos

```bash
pnpm install            # instala dependencias del workspace
pnpm --filter earth-drop-calc dev   # arranca una app (Vite)
pnpm --filter fed-wabis-v2 dev      # arranca la app del domo (Vite)
pnpm typecheck          # type-check de jsgraph-core
pnpm lint               # ESLint (ignora vendor y código legacy)
```

Hay que abrir las apps por la URL que imprime Vite (p. ej. `http://localhost:5173`).

> **No** abrir el `index.html` con VSCode Live Preview (ni cualquier servidor
> estático de archivos). Los imports son *bare specifiers* del paquete del
> workspace (`import 'jsgraph-vendor/src/wiki.js'`); solo Vite/pnpm los resuelven.
> Un servidor estático falla con
> `bare specifier ... was not remapped to anything`.

Ver [MIGRATION-PLAN.md](../MIGRATION-PLAN.md) para el plan por fases.
