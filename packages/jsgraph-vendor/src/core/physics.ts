// =============================================================================
// physics.ts — Pure geometry / refraction / visibility functions (no `this`).
//   Extracted from CurveAppClass.Update() to isolate the math for testing and
//   potential reuse across apps.
//
//   Each function takes explicit inputs and returns computed values or objects.
//   No dependencies on global app state — only typed imports: trig helpers
//   (constants.ts) and the own vector module (vec3.ts, Phase-2 replacement for
//   the vendor JsgVect3/Limit1 globals).
// =============================================================================

import { JsgVect3, limit1, type Vec3 } from "./vec3.js";
import {
  REFR_COEFF_CONST,
  STD_TEMP_GRADIENT,
  toDeg,
  toRad,
} from "./constants.js";

// ---------------------------------------------------------------------------
// 3D vector helpers for object geometry
// ---------------------------------------------------------------------------

/**
 * Compute object position vector relative to observer.
 * @param dist  — surface distance along refracted earth
 * @param side  — lateral offset along surface
 * @param size  — object height above surface
 * @param rad   — (refracted) earth radius
 * @param h     — observer height above surface
 */
function compObjVect(dist: number, side: number, size: number, rad: number, h: number): Vec3 {
  const R = rad + size;
  const a1 = side / rad;
  const a2 = dist / rad;
  const r = R * Math.cos(a1);
  const vx = R * Math.sin(a1);
  const vy = r * Math.sin(a2);
  const vz = r * Math.cos(a2) - (rad + h);
  return [vx, vy, vz];
}

/** Angle (radians) between two 3D vectors. */
function compVectAng(v1: Vec3, v2: Vec3): number {
  const sp = JsgVect3.ScalarProd(JsgVect3.Norm(v1), JsgVect3.Norm(v2));
  return Math.acos(limit1(sp));
}

// ---------------------------------------------------------------------------
// Refraction
// ---------------------------------------------------------------------------

/**
 * Compute refraction coefficient k from pressure, temperature and lapse rate.
 * k = 503 · P/T² · (0.0343 + dT/dh)
 * @param P_mbar — pressure in mbar
 * @param T_K    — temperature in Kelvin
 * @param dTdh   — temperature gradient dT/dh in K/m
 */
export function computeRefractionCoeff(P_mbar: number, T_K: number, dTdh: number): number {
  return REFR_COEFF_CONST * (P_mbar / (T_K * T_K)) * (STD_TEMP_GRADIENT + dTdh);
}

/**
 * Inverse: compute temperature gradient from refraction coefficient.
 * dT/dh = (k · T²) / (503 · P) - 0.0343
 * @param k       — refraction coefficient
 * @param T_K     — temperature in Kelvin
 * @param P_mbar  — pressure in mbar
 */
export function computeTempGradientFromK(k: number, T_K: number, P_mbar: number): number {
  return (k * T_K * T_K) / (REFR_COEFF_CONST * P_mbar) - STD_TEMP_GRADIENT;
}

/** Compute refraction factor a from k: a = 1 / (1 - k). */
export function computeRefractionFactor(k: number): number {
  return 1 / (1 - k);
}

/** Compute refracted earth radius: R' = R · a. */
export function computeRefractedRadius(R: number, a: number): number {
  return R * a;
}

// ---------------------------------------------------------------------------
// Horizon geometry
// ---------------------------------------------------------------------------

export interface HorizonGeometry {
  horizDropAnglFromEyeLvl: number;
  horizDistOnEyeLvl: number;
  horizSurfDist: number;
  earthCentrToHorizDisc: number;
  horizDropFromObsSurf: number;
  horizDropFromEyeLvl: number;
  horizDistLineOfSight: number;
}

/**
 * Compute all horizon-dependent values for a given refracted earth radius and
 * observer height.
 */
export function computeHorizonGeometry(R_refr: number, height: number): HorizonGeometry {
  const dropAngl = Math.acos(R_refr / (R_refr + height));
  return {
    horizDropAnglFromEyeLvl: dropAngl,
    horizDistOnEyeLvl: R_refr * Math.sin(dropAngl),
    horizSurfDist: R_refr * dropAngl,
    earthCentrToHorizDisc: R_refr * Math.cos(dropAngl),
    horizDropFromObsSurf: R_refr - R_refr * Math.cos(dropAngl),
    horizDropFromEyeLvl: (R_refr - R_refr * Math.cos(dropAngl)) + height,
    horizDistLineOfSight: (height + R_refr) * Math.sin(dropAngl),
  };
}

export interface LeftRightDrop {
  horizLftRgtWidth: number;
  horizLftRgtDist: number;
  horizLftRgtDropAngl: number;
  horizLftRgtDrop: number;
}

/**
 * Compute the horizon left-right drop angle/distance (the "horseshoe" HUD).
 * @param viewAngle — camera FOV in degrees
 * @param deviceRatio — screen width/height
 */
export function computeLeftRightDrop(
  viewAngle: number,
  deviceRatio: number,
  horizDistLineOfSight: number,
  horizDistOnEyeLvl: number,
  horizDropAnglFromEyeLvl: number,
  horizDropFromEyeLvl: number,
): LeftRightDrop {
  const yFieldOfView2 = toRad(viewAngle) / Math.sqrt(1 + 1 / (deviceRatio * deviceRatio)) / 2;
  const width2HorLRDrop = horizDistLineOfSight * Math.sin(yFieldOfView2);

  if (width2HorLRDrop < horizDistOnEyeLvl) {
    const width = width2HorLRDrop * 2;
    const dist = Math.sqrt(horizDistOnEyeLvl * horizDistOnEyeLvl - width2HorLRDrop * width2HorLRDrop);
    const angVert = Math.atan(dist / horizDropFromEyeLvl);
    const angRad = Math.PI / 2 - horizDropAnglFromEyeLvl - angVert;
    return {
      horizLftRgtWidth: width,
      horizLftRgtDist: dist,
      horizLftRgtDropAngl: toDeg(angRad),
      horizLftRgtDrop: horizDistLineOfSight * Math.sin(angRad),
    };
  }

  return { horizLftRgtWidth: 0, horizLftRgtDist: 0, horizLftRgtDropAngl: 0, horizLftRgtDrop: 0 };
}

/**
 * Compute refraction angle — the angular difference between geometric and
 * refracted horizon vectors.
 * @param R_geom — true earth radius
 * @param R_refr — refracted earth radius
 * @param height — observer height
 * @param horizonSurfDist — refracted horizon surface distance
 * @param refractionCoeff — k
 * @returns horizon refraction angle in degrees
 */
export function computeHorizonRefractionAngle(
  R_geom: number,
  R_refr: number,
  height: number,
  horizonSurfDist: number,
  refractionCoeff: number,
): number {
  if (Math.abs(R_geom - R_refr) <= 1e-5) return 0;

  const dropAngleGeom = Math.acos(R_geom / (R_geom + height));
  const horizSurfDistGeom = R_geom * dropAngleGeom;
  const vGeom = compObjVect(horizSurfDistGeom, 0, 0, R_geom, height);
  const vRefr = compObjVect(horizonSurfDist, 0, 0, R_refr, height);
  const ang = toDeg(compVectAng(vGeom, vRefr));
  return refractionCoeff < 0 ? -ang : ang;
}

// ---------------------------------------------------------------------------
// Object geometry
// ---------------------------------------------------------------------------

export interface ObjectGeometry {
  objSurfDistAngl: number;
  objRealSurfDist: number;
  bulge: number;
  objDropFromObsSurf: number;
  objDropAnglFromObsSurf: number;
  objNearTilt: number;
  objSizeAngl: number;
  objRefrAngl: number;
  objLiftAbs: number;
  objLiftRelToHoriz: number;
  horizonLift: number;
  objHidden: number;
  objVisi: number;
  objHiddenAngl: number;
  objVisibleAngl: number;
  objTopAnglFromEyeLvl: number;
  objTopAnglFromEyeLvlFE: number;
}

/**
 * Compute geometry for the nearest reference object.
 * @param objSurfDist — object surface distance
 * @param objSidePos — lateral offset
 * @param objNearSize — object height (with size var applied)
 * @param R_refr — refracted earth radius
 * @param R_geom — true earth radius
 * @param height — observer height
 * @param horizDropAnglFromEyeLvl
 * @param horizRefrAngl — precomputed horizon refraction angle
 * @param refractionCoeff — k
 */
export function computeObjectGeometry(
  objSurfDist: number,
  objSidePos: number,
  objNearSize: number,
  R_refr: number,
  R_geom: number,
  height: number,
  horizDropAnglFromEyeLvl: number,
  horizRefrAngl: number,
  refractionCoeff: number,
): ObjectGeometry {
  // Surface distance angle & real surface distance
  const vectObjPos = compObjVect(objSurfDist, objSidePos, 0, R_refr, -R_refr);
  const objSurfDistAngl = compVectAng(vectObjPos, [0, 0, R_refr]);
  const objRealSurfDist = objSurfDistAngl * R_refr;

  // Bulge and drop
  const d2r = Math.sin(objRealSurfDist / (2 * R_refr));
  const bulge = R_refr * (1 - Math.sqrt(1 - d2r * d2r));
  const objDropFromObsSurf = R_refr * (1 - Math.cos(objRealSurfDist / R_refr));
  const hdist = R_refr * Math.sin(objRealSurfDist / R_refr);
  const objDropAnglFromObsSurf = toDeg(Math.atan(objDropFromObsSurf / hdist));

  // Object angular size and refraction
  const vBase_refr = compObjVect(objSurfDist, objSidePos, 0, R_refr, height);
  const vTop_refr = compObjVect(objSurfDist, objSidePos, objNearSize, R_refr, height);
  const vBase_geom = compObjVect(objSurfDist, objSidePos, 0, R_geom, height);

  const objUpDir = JsgVect3.Sub(vTop_refr, vBase_refr);
  const objNearTilt = toDeg(compVectAng([0, 0, 1], objUpDir));
  let objSizeAngl = toDeg(compVectAng(vBase_refr, vTop_refr));
  if (Math.abs(objSizeAngl) < 1e-5) objSizeAngl = 0;

  let objRefrAngl = toDeg(compVectAng(vBase_geom, vBase_refr));
  if (Math.abs(objRefrAngl) < 1e-5) objRefrAngl = 0;
  if (refractionCoeff < 0) objRefrAngl *= -1;

  // Lift
  let objLiftAbs = 0, objLiftRelToHoriz = 0, horizonLift = 0;
  if (objSizeAngl !== 0) {
    objLiftAbs = (objNearSize * objRefrAngl) / objSizeAngl;
    horizonLift = (objNearSize * horizRefrAngl) / objSizeAngl;
    objLiftRelToHoriz = objLiftAbs - horizonLift;
  }

  // Hidden / visible
  let objHidden: number, objVisi: number, objHiddenAngl: number, objVisibleAngl: number;
  if (objSurfDistAngl > horizDropAnglFromEyeLvl) {
    // Behind horizon
    const cosaHorObj = Math.cos(objSurfDistAngl - horizDropAnglFromEyeLvl);
    objHidden = (R_refr * (1 - cosaHorObj)) / cosaHorObj;
    objVisi = objNearSize - objHidden;
    if (objVisi < 0) objVisi = 0;
    objHiddenAngl = (objSizeAngl * objHidden) / objNearSize;
    objVisibleAngl = (objSizeAngl * objVisi) / objNearSize;
  } else {
    objHidden = 0;
    objVisi = objNearSize;
    objHiddenAngl = 0;
    objVisibleAngl = objSizeAngl;
  }

  // Top angle from eye level (globe model)
  const a = R_refr + height;
  const b = R_refr + objNearSize;
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(objRealSurfDist / R_refr));
  const a1 = (c * c - b * b + a * a) / (2 * a);
  const objTopAnglFromEyeLvl = -Math.asin(a1 / c) * (180 / Math.PI);

  // Top angle from eye level (flat earth model)
  const objTopAnglFromEyeLvlFE = Math.atan((objNearSize - height) / objRealSurfDist) * (180 / Math.PI);

  return {
    objSurfDistAngl, objRealSurfDist,
    bulge, objDropFromObsSurf, objDropAnglFromObsSurf,
    objNearTilt, objSizeAngl, objRefrAngl,
    objLiftAbs, objLiftRelToHoriz, horizonLift,
    objHidden, objVisi, objHiddenAngl, objVisibleAngl,
    objTopAnglFromEyeLvl, objTopAnglFromEyeLvlFE,
  };
}
