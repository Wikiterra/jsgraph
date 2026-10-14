// =============================================================================
// constants.ts - Shared constants and trig helpers used across the calculator
//
// Physical constants:
//   SENSOR_DIAGONAL_35MM — diagonal of a 35 mm full-frame sensor (43.2 mm).
//                          Used to convert focal length to view angle and back.
//   REFR_COEFF_CONST     — 503 K/mb, from the Edlén formula for refractive index
//                          of air: n ≈ 1 + 503·P/T² · (0.0343 + dT/dh).
//   STD_TEMP_GRADIENT    — 0.0343 K/m, the ICAO standard atmosphere lapse rate.
//   KELVIN_OFFSET        — 273.15, Celsius → Kelvin conversion.
//   FOCAL_LENGTH_MIN     — 21 mm, minimum focal length for the slider range.
//   FOCAL_LENGTH_MAX     — 10000 mm, maximum focal length for the slider range.
//   VIEW_ANGLE_MIN       — 0.1 °, minimum view angle clamp.
//   VIEW_ANGLE_MAX       — 160 °, maximum view angle clamp.
//   TILT_MIN             — -85 °, minimum tilt.
//   TILT_MAX             — 45 °, maximum tilt.
//   PAN_MIN              — -180 °, minimum pan.
//   PAN_MAX              — 180 °, maximum pan.
//   HEIGHT_MIN           — 0.001 m, minimum observer height.
//   HEIGHT_MAX           — 1e9 m, maximum observer height.
//   EARTH_RADIUS_MIN     — 100000 m, minimum earth radius clamp.
//
// Dual interface: exported ESM bindings for the TS core (physics.ts,
// sliderMapping.ts import from here) AND published on globalThis for the
// legacy JS panels/renderers that still read them as platform globals.
// =============================================================================

export const DefaultDigits = 2;
export const DeviceRatio_Off = 1.5;
export const PI90 = Math.PI / 2;

// —— Physical & optical constants ——
export const SENSOR_DIAGONAL_35MM = 43.2;   // mm
export const REFR_COEFF_CONST = 503;        // K/mb — Edlén formula constant
export const STD_TEMP_GRADIENT = 0.0343;    // K/m  — standard lapse rate
export const KELVIN_OFFSET = 273.15;        // °C → K

// —— Clamp limits ——
export const FOCAL_LENGTH_MIN = 21;         // mm
export const FOCAL_LENGTH_MAX = 10000;      // mm
export const VIEW_ANGLE_MIN = 0.1;          // °
export const VIEW_ANGLE_MAX = 160;          // °
export const TILT_MIN = -85;                // °
export const TILT_MAX = 45;                 // °
export const PAN_MIN = -180;                // °
export const PAN_MAX = 180;                 // °
export const HEIGHT_MIN = 0.001;            // m
export const HEIGHT_MAX = 1e9;              // m
export const EARTH_RADIUS_MIN = 100000;     // m

// —— Object / target clamp limits ——
export const OBJ_SIZE_MIN = 0.001;          // m
export const OBJ_SIZE_MAX = 1e9;            // m
export const OBJ_DELTA_DIST_MIN = 0.001;    // m

// —— Refraction / atmosphere clamp limits ——
export const TEMP_K_MIN = 3;                // K
export const TEMP_K_MAX = 10000;            // K
export const PRESSURE_MIN_MBAR = 0.001;     // mbar
export const PRESSURE_MAX_MBAR = 10000;     // mbar

export function toRad(a: number): number {
  return (a * Math.PI) / 180;
}

export function toDeg(a: number): number {
  return (a * 180) / Math.PI;
}

Object.assign(globalThis, {
  DefaultDigits, DeviceRatio_Off, PI90, toRad, toDeg,
  SENSOR_DIAGONAL_35MM, REFR_COEFF_CONST, STD_TEMP_GRADIENT, KELVIN_OFFSET,
  FOCAL_LENGTH_MIN, FOCAL_LENGTH_MAX,
  VIEW_ANGLE_MIN, VIEW_ANGLE_MAX,
  TILT_MIN, TILT_MAX, PAN_MIN, PAN_MAX,
  HEIGHT_MIN, HEIGHT_MAX, EARTH_RADIUS_MIN,
  OBJ_SIZE_MIN, OBJ_SIZE_MAX, OBJ_DELTA_DIST_MIN,
  TEMP_K_MIN, TEMP_K_MAX, PRESSURE_MIN_MBAR, PRESSURE_MAX_MBAR,
});
