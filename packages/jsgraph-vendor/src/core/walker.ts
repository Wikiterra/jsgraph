// =============================================================================
// walker.ts — first-person walker: pure state + step (no DOM, no renderer).
//
//   Phase 7 (PLAN.md): the character walks on the ACTIVE world shape, but its
//   state is geographic (lat/lng) — the shape is only the render mapping (see
//   worldGeometry.ts), so one geodesic step works for disc | rect | sphere.
//   Heading: 0° = north, 90° = east. Pitch: look up/down, clamped.
//
//   The app converts scene units ↔ meters via the model's earth radius
//   (EarthMap.Radius ↔ EARTH_RADIUS_MEAN); speed and radius are parameters.
// =============================================================================

import {
  EARTH_RADIUS_MEAN,
  createLocalFrame,
  destinationPoint,
  type GeoPoint,
} from "./geo.js";

export interface WalkerState {
  readonly latDeg: number;
  readonly lngDeg: number;
  /** Yaw in degrees, wrapped to [0, 360); 0 = north, 90 = east. */
  readonly headingDeg: number;
  /** Look up (+) / down (−) in degrees, clamped to ±PITCH_LIMIT_DEG. */
  readonly pitchDeg: number;
}

export interface WalkerInput {
  /** −1..1 — forward (W) / back (S). */
  readonly forward: number;
  /** −1..1 — strafe right (D) / left (A). */
  readonly strafe: number;
  /** Yaw rate in deg/s (mouse look / turning). */
  readonly yawRateDeg: number;
  /** Pitch rate in deg/s (mouse look). */
  readonly pitchRateDeg: number;
}

export interface WalkerParams {
  /** Ground speed in m/s (the app multiplies it, e.g. for a sprint key). */
  readonly walkSpeedMps: number;
  /** Geodesy sphere radius in meters (world model). */
  readonly planetRadiusM: number;
}

export const PITCH_LIMIT_DEG = 89;

export const DEFAULT_WALKER_PARAMS: WalkerParams = {
  walkSpeedMps: 1.4, // casual walk
  planetRadiusM: EARTH_RADIUS_MEAN,
};

function wrap360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function clampPitch(deg: number): number {
  return Math.max(-PITCH_LIMIT_DEG, Math.min(PITCH_LIMIT_DEG, deg));
}

/** New walker at a geographic position, looking along `headingDeg` (level pitch). */
export function createWalker(
  latDeg: number,
  lngDeg: number,
  headingDeg = 0,
): WalkerState {
  return { latDeg, lngDeg, headingDeg: wrap360(headingDeg), pitchDeg: 0 };
}

/**
 * Advance the walker by `dtSec` seconds: rotate by the look rates, then walk
 * `walkSpeedMps·dt` along the composed ground heading (forward+strafe normalize
 * to at most full speed). Movement is a spherical geodesic step — the same
 * lat/lng lands on a different scene position per world shape.
 */
export function stepWalker(
  state: WalkerState,
  input: WalkerInput,
  dtSec: number,
  params: WalkerParams = DEFAULT_WALKER_PARAMS,
): WalkerState {
  const headingDeg = wrap360(state.headingDeg + input.yawRateDeg * dtSec);
  const pitchDeg = clampPitch(state.pitchDeg + input.pitchRateDeg * dtSec);

  let latDeg = state.latDeg;
  let lngDeg = state.lngDeg;

  const mag = Math.hypot(input.forward, input.strafe);
  if (mag > 1e-9 && dtSec > 0) {
    // Ground heading: forward alone keeps the look heading; strafe adds 90°.
    const moveHeading = wrap360(
      headingDeg + (Math.atan2(input.strafe, input.forward) * 180) / Math.PI,
    );
    const distM = params.walkSpeedMps * Math.min(1, mag) * dtSec;
    const start: GeoPoint = { lat: state.latDeg, lon: state.lngDeg, alt: 0, crs: "EPSG:4326" };
    const frame = createLocalFrame(start, params.planetRadiusM);
    const dest = destinationPoint(frame, start, moveHeading, distM);
    latDeg = dest.lat;
    lngDeg = dest.lon;
  }

  return { latDeg, lngDeg, headingDeg, pitchDeg };
}
