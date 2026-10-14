// =============================================================================
// sliderMapping.ts — Bidirectional slider ↔ value mappings extracted from
//   CurveAppClass.Update() and UpdateObjectInput().
//
//   Each function encapsulates the log/linear mapping between a slider position
//   (0..1 or -1..+1) and its physical value. Extracting these simplifies Update()
//   and makes the mappings testable in isolation.
//
//   Phase-2 note: sliderToObjSurfDist's log branch previously used
//   Math.pow(10, slider) — the SIGNED slider — while its inverse uses the
//   magnitude, so negative distances did not round-trip (−1000 m → −0.1 m).
//   Fixed here to use the magnitude, matching sliderToObjSidePos.
// =============================================================================

import {
  FOCAL_LENGTH_MAX,
  FOCAL_LENGTH_MIN,
  SENSOR_DIAGONAL_35MM,
  toDeg,
  toRad,
} from "./constants.js";

// ---------------------------------------------------------------------------
// Height
// ---------------------------------------------------------------------------

export function sliderToHeight(slider: number): number {
  return Math.pow(10, -1 + 6 * slider);
}

export function heightToSlider(h: number): number {
  return (Math.log10(h) + 1) / 6;
}

// ---------------------------------------------------------------------------
// Refraction slider (k = refractionCoeff)
// ---------------------------------------------------------------------------

export function sliderToRefractionCoeff(slider: number, k_max: number): number {
  const s = Math.abs(slider) < 0.01 ? 0 : slider;
  return k_max * s;
}

// ---------------------------------------------------------------------------
// Focal length ↔ view angle (sensor diagonal: SENSOR_DIAGONAL_35MM)
// ---------------------------------------------------------------------------

export function focalLengthSliderToFocalLength(slider: number): number {
  return (FOCAL_LENGTH_MAX - FOCAL_LENGTH_MIN) * Math.pow(slider, 2) + FOCAL_LENGTH_MIN;
}

export function focalLengthToViewAngle(f: number): number {
  return toDeg(2 * Math.atan(SENSOR_DIAGONAL_35MM / 2 / f));
}

export function viewAngleToFocalLength(viewAngleDeg: number): number {
  return SENSOR_DIAGONAL_35MM / (2 * Math.tan(toRad(viewAngleDeg) / 2));
}

export function focalLengthToSlider(f: number): number {
  let ff = f - FOCAL_LENGTH_MIN;
  if (ff < 0) ff = 0;
  return Math.pow(ff / (FOCAL_LENGTH_MAX - FOCAL_LENGTH_MIN), 1 / 2);
}

// ---------------------------------------------------------------------------
// Tilt slider (asymmetric: ±45° / -85°)
// ---------------------------------------------------------------------------

export function tiltToSlider(tilt: number, tiltMin: number, tiltMax: number): number {
  if (tilt > 0) {
    return Math.sqrt(tilt / tiltMax);
  }
  return -Math.sqrt(-tilt / -tiltMin);
}

export function sliderToTilt(slider: number, tiltMin: number, tiltMax: number): number {
  if (slider > 0) {
    return Math.pow(slider, 2) * tiltMax;
  }
  return -Math.pow(slider, 2) * -tiltMin;
}

// ---------------------------------------------------------------------------
// Pan slider (symmetric ±180°, but slider sqrt uses 90° as divisor)
// Note: the original code uses sqrt(pan/90), not sqrt(pan/PAN_MAX).
// These are intentionally NOT parametrized by PAN_MIN/PAN_MAX.
// ---------------------------------------------------------------------------

export function panToSlider(pan: number): number {
  if (pan > 0) return Math.sqrt(pan / 90);
  return -Math.sqrt(-pan / 90);
}

export function sliderToPan(slider: number): number {
  if (slider > 0) return Math.pow(slider, 2) * 90;
  return -Math.pow(slider, 2) * 90;
}

// ---------------------------------------------------------------------------
// Object distance (logarithmic, with linear sub-range)
// ---------------------------------------------------------------------------

export function sliderToObjSurfDist(slider: number): number {
  const sign = slider < 0 ? -1 : 1;
  const val = Math.abs(slider);
  if (val < 1) return sign * 100 * val;
  // BUGFIX (Phase 2): was Math.pow(10, slider) — signed — breaking negative
  // round-trips; now uses the magnitude like sliderToObjSidePos.
  return sign * 10 * Math.pow(10, val);
}

export function objSurfDistToSlider(dist: number): number {
  const sign = dist < 0 ? -1 : 1;
  const val = Math.abs(dist);
  if (val < 100) return sign * (val / 100);
  return sign * Math.log10(val / 10);
}

// ---------------------------------------------------------------------------
// Object side position (logarithmic, with linear sub-range)
// ---------------------------------------------------------------------------

export function sliderToObjSidePos(slider: number): number {
  const sign = slider < 0 ? -1 : 1;
  const val = Math.abs(slider);
  if (val < 1) return sign * 100 * val;
  return sign * 10 * Math.pow(10, val);
}

export function objSidePosToSlider(pos: number): number {
  const sign = pos < 0 ? -1 : 1;
  const val = Math.abs(pos);
  if (val < 100) return sign * (val / 100);
  return sign * Math.log10(val / 10);
}

// ---------------------------------------------------------------------------
// Object side variation (hybrid log)
// ---------------------------------------------------------------------------

export function sliderToObjSideVar(slider: number): number {
  const sign = slider < 0 ? -1 : 1;
  const val = Math.abs(slider);
  if (val < 1) return sign * 10 * val;
  return sign * Math.pow(10, val);
}

export function objSideVarToSlider(v: number): number {
  const sign = v < 0 ? -1 : 1;
  const val = Math.abs(v);
  if (val < 10) return sign * (val / 10);
  return sign * Math.log10(val);
}

// ---------------------------------------------------------------------------
// Object size (simple log)
// ---------------------------------------------------------------------------

export function sliderToObjSize(slider: number): number {
  return Math.pow(10, slider);
}

export function objSizeToSlider(size: number): number {
  return Math.log10(size);
}

// ---------------------------------------------------------------------------
// Object delta distance (log, shifted)
// ---------------------------------------------------------------------------

export function sliderToObjDeltaDist(slider: number): number {
  return 10 * Math.pow(10, slider);
}

export function objDeltaDistToSlider(d: number): number {
  return Math.log10(d / 10);
}
