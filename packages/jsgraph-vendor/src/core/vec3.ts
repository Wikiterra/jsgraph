// =============================================================================
// vec3.ts — Own minimal 3D vector module (ESM, pure, DOM-free).
//
//   Port of the vendor's JsgVect3 object (jsgx3d.js, classic script) so the
//   TS math core does NOT depend on vendor globals (PLAN.md / Phase 2). The
//   vendor global stays untouched for the browser runtime; this module mirrors
//   its API 1:1 (xArray → Array.isArray).
//
//   Consumed by physics.ts (and testable standalone under Vitest/Node).
// =============================================================================

/** 3-component vector. The vendor treats vectors as plain 3-arrays. */
export type Vec3 = [number, number, number];

export function vec3(x: number, y: number, z: number): Vec3 {
  return [x, y, z];
}

export function null3(): Vec3 {
  return [0, 0, 0];
}

export function isVec3(v: unknown): v is Vec3 {
  return Array.isArray(v) && v.length === 3;
}

export function isZero3(v: Vec3): boolean {
  return v[0] === 0 && v[1] === 0 && v[2] === 0;
}

export function copy3(src: Vec3): Vec3 {
  return [src[0], src[1], src[2]];
}

export function copyTo3(src: Vec3, dest: Vec3): Vec3 {
  dest[0] = src[0];
  dest[1] = src[1];
  dest[2] = src[2];
  return dest;
}

/** Unit vector from horizontal/vertical angles (degrees) and distance. */
export function fromAngle3(aHAngDeg: number, aVAngDeg: number, aDist: number): Vec3 {
  const aVAng = (aVAngDeg * Math.PI) / 180;
  const aHAng = (aHAngDeg * Math.PI) / 180;
  const z = aDist * Math.sin(aVAng);
  const a = aDist * Math.cos(aVAng);
  const x = a * Math.cos(aHAng);
  const y = a * Math.sin(aHAng);
  return [x, y, z];
}

export function scale3(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function length2_3(v: Vec3): number {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

export function length3(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function norm3(v: Vec3): Vec3 {
  const s = length3(v);
  if (s === 0) return [v[0], v[1], v[2]];
  return [v[0] / s, v[1] / s, v[2] / s];
}

export function add3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scalarProd3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Cross product a × b. */
export function mult3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** Angle (radians) between two vectors (clamped dot product). */
export function angle3(v1: Vec3, v2: Vec3): number {
  const sp = scalarProd3(norm3(v1), norm3(v2));
  return Math.acos(limit1(sp));
}

/** Clamp x into [-1, 1] (vendor Limit1, needed by acos/asin callers). */
export function limit1(x: number): number {
  return x < -1 ? -1 : x > 1 ? 1 : x;
}

// ---------------------------------------------------------------------------
// Object-shaped facade mirroring the vendor's JsgVect3, so migrated code can
// keep calling JsgVect3.Norm(...) style (used by physics.ts).
// ---------------------------------------------------------------------------
export const JsgVect3 = {
  New: vec3,
  Null: null3,
  Ok: isVec3,
  IsZero: isZero3,
  Copy: copy3,
  CopyTo: copyTo3,
  FromAngle: fromAngle3,
  Scale: scale3,
  Length2: length2_3,
  Length: length3,
  Norm: norm3,
  Add: add3,
  Sub: sub3,
  ScalarProd: scalarProd3,
  Mult: mult3,
  Angle: angle3,
} as const;
