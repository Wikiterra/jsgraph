// =============================================================================
// worldGeometry.ts — the world's SURFACE shape: disc | rect | sphere.
//
//   Phase 6 (PLAN.md): the same geographic point (lat, lng) maps to a
//   different scene position per shape, so the whole world can switch geometry
//   at runtime while the model stays geographic. All mappings share the same
//   degree-linear scene scale (radius = full pole-to-pole span for the flat
//   shapes), so switching shapes keeps the world roughly the same size.
//
//   Conventions (matching the app's existing drawing code):
//   - "disc"  — azimuthal equidistant centered on the NORTH POLE (r ∝
//               colatitude), lng 90°E along +x. Identical to
//               EarthMap.PointOnFE (fed's current world).
//   - "rect"  — plate carrée centered at (equator, prime meridian),
//               x = R·lng (rad), y = R·lat (rad), north = +y, lng ±180 at
//               x = ±R, poles at y = ±R/2.
//   - "sphere"— 3D embedding, z through the north pole. Identical to
//               EarthMap.PointOnGlobe.
//
//   Pure, strict TS: no DOM, no renderer (matemática ≠ render).
// =============================================================================

import type { Vec3 } from "./vec3.js";

export type WorldShape = "disc" | "rect" | "sphere";

export const WORLD_SHAPES: readonly WorldShape[] = ["disc", "rect", "sphere"];

export interface WorldGeometry {
  readonly shape: WorldShape;
  /**
   * Scene radius. For the flat shapes: the distance covering the full
   * pole-to-pole span in the shape's own scale (disc: south pole sits at
   * exactly `radius` from the center; rect: poles at ±radius/2).
   * For the sphere: the globe radius. Scale is linear — normalized units or
   * meters both work.
   */
  readonly radius: number;
}

/** A geographic position (degrees). */
export interface LatLng {
  readonly latDeg: number;
  readonly lngDeg: number;
}

export const DEFAULT_WORLD: WorldGeometry = { shape: "disc", radius: 1 };

const DEG = Math.PI / 180;

export function isWorldShape(s: unknown): s is WorldShape {
  return s === "disc" || s === "rect" || s === "sphere";
}

/** Validated constructor (throws on unknown shape or non-positive radius). */
export function createWorld(shape: unknown, radius: number): WorldGeometry {
  if (!isWorldShape(shape)) {
    throw new Error(`createWorld: unknown shape "${String(shape)}" (expected disc | rect | sphere)`);
  }
  if (!(radius > 0) || !Number.isFinite(radius)) {
    throw new Error(`createWorld: radius must be a positive finite number, got ${radius}`);
  }
  return { shape, radius };
}

/** Wrap longitude into (−180, 180]. */
export function wrapLng(lngDeg: number): number {
  const l = ((((lngDeg + 180) % 360) + 360) % 360) - 180;
  return l === -180 ? 180 : l;
}

/** Clamp latitude into [−90, 90]. */
export function clampLat(latDeg: number): number {
  return Math.max(-90, Math.min(90, latDeg));
}

/**
 * Geographic point → scene coordinates for the world's shape.
 * Flat shapes return z = 0 (the scene's FePlane maps them to the ground).
 */
export function latLngToSurface(w: WorldGeometry, p: LatLng): Vec3 {
  const lat = clampLat(p.latDeg);
  const lng = wrapLng(p.lngDeg);

  switch (w.shape) {
    case "disc": {
      const r = (w.radius * (90 - lat)) / 180;
      const a = (lng - 90) * DEG;
      return [r * Math.cos(a), r * Math.sin(a), 0];
    }
    case "rect": {
      return [(w.radius * lng) / 180, (w.radius * lat) / 180, 0];
    }
    case "sphere": {
      const phi = lat * DEG;
      const lam = lng * DEG;
      const rr = w.radius * Math.cos(phi);
      return [rr * Math.cos(lam), rr * Math.sin(lam), w.radius * Math.sin(phi)];
    }
  }
}

/** Inverse of latLngToSurface. Throws for degenerate inputs (zero vector). */
export function surfaceToLatLng(w: WorldGeometry, v: Vec3): LatLng {
  switch (w.shape) {
    case "disc": {
      const r = Math.hypot(v[0], v[1]);
      if (r === 0) return { latDeg: 90, lngDeg: 0 }; // the pole: lng undefined
      const lat = 90 - (180 * r) / w.radius;
      const lng = Math.atan2(v[1], v[0]) / DEG + 90;
      return { latDeg: clampLat(lat), lngDeg: wrapLng(lng) };
    }
    case "rect": {
      return {
        latDeg: clampLat((180 * v[1]) / w.radius),
        lngDeg: wrapLng((180 * v[0]) / w.radius),
      };
    }
    case "sphere": {
      const r = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      if (r === 0) throw new Error("surfaceToLatLng(sphere): zero-length vector has no direction");
      return {
        latDeg: Math.asin(Math.max(-1, Math.min(1, v[2] / r))) / DEG,
        lngDeg: wrapLng(Math.atan2(v[1], v[0]) / DEG),
      };
    }
  }
}
