// Port: how an app obtains a 3D graph. Apps depend on this factory contract,
// NOT on the wabis global NewGraphX3D. Swapping the rendering engine later means
// writing a new adapter that satisfies Graph3DFactory — apps don't change.
//
// Phase 3 (minimal seam): only graph *creation* is ported. The returned graph is
// still the rich wabis instance; its drawing surface (g.Line3D, g.SetCamera, …) is
// not abstracted yet, so it is treated as opaque here. See ./Renderer3D.ts for the
// (future) full drawing port.

export interface Graph3DConfig {
  /** DOM id the graph mounts under. */
  readonly Id: string;
  /** CSS-style width, e.g. "100%". */
  readonly Width: string;
  /** CSS-style height, e.g. "66.67%". */
  readonly Height: string;
  /** Called on every redraw with the graph instance. */
  readonly DrawFunc: (g: Graph3D) => void;
  readonly AutoReset?: boolean;
  readonly AutoClear?: boolean;
  readonly AutoScalePix?: boolean;
}

/** Opaque until the drawing surface is ported (see header). */
export type Graph3D = unknown;

export type Graph3DFactory = (config: Graph3DConfig) => Graph3D;
