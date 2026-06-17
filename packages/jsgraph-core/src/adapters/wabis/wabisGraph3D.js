// jsgraph-core · wabis adapter for the Graph3D factory port.
// The ONE place that knows a 3D graph is created via the wabis global NewGraphX3D.
// Apps call createGraph3D(config) instead of NewGraphX3D directly, so swapping the
// rendering engine later (e.g. three.js) means rewriting only this file.
//
// Dual-loadable like the vendor: runs as a classic <script> (earth-drop, parse-time)
// AND as an ESM side-effect import (future TS consumers). No `export` statement so the
// classic load doesn't choke; the factory is published on globalThis.
//
// Satisfies the Graph3DFactory contract in ../../ports/Graph3D.ts.
// @typedef {import('../../ports/Graph3D.js').Graph3DConfig} Graph3DConfig
/* global NewGraphX3D */

function createGraph3D(config) {
  if (typeof NewGraphX3D !== "function") {
    throw new Error("createGraph3D: wabis NewGraphX3D not loaded — load jsgraph-vendor first");
  }
  return NewGraphX3D(config);
}

Object.assign(globalThis, { createGraph3D });
