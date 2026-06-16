// Ambient type declarations for the wabis framework globals.
//
// The framework is untyped JS, so these types are pragmatic: precise where the
// shape is well-known (vectors/colors are plain number arrays), loose elsewhere
// via index signatures. Expand in Phase 3 as jsgraph-core adapters consume them.
//
// Surface inventoried from app usage: JsgVect3 (103x), JsgMat3 (33x), JsgVect2,
// JsgPlane, NewGraphX3D, NewModelAnimation, JsgColor.

export {};

declare global {
  type JsgVec2 = [number, number];
  type JsgVec3 = [number, number, number];
  /** RGBA, each channel 0..1. */
  type JsgColorRGBA = [number, number, number, number];

  interface JsgVect2Lib {
    New(x: number, y: number): JsgVec2;
    Copy(v: JsgVec2): JsgVec2;
    Add(a: JsgVec2, b: JsgVec2): JsgVec2;
    Sub(a: JsgVec2, b: JsgVec2): JsgVec2;
    Scale(v: JsgVec2, s: number): JsgVec2;
    Norm(v: JsgVec2): JsgVec2;
    Length(v: JsgVec2): number;
    ScalarProd(a: JsgVec2, b: JsgVec2): number;
    [member: string]: unknown;
  }

  interface JsgVect3Lib {
    New(x: number, y: number, z: number): JsgVec3;
    Null(): JsgVec3;
    Copy(v: JsgVec3): JsgVec3;
    Add(a: JsgVec3, b: JsgVec3): JsgVec3;
    Sub(a: JsgVec3, b: JsgVec3): JsgVec3;
    Scale(v: JsgVec3, s: number): JsgVec3;
    Norm(v: JsgVec3): JsgVec3;
    Length(v: JsgVec3): number;
    ScalarProd(a: JsgVec3, b: JsgVec3): number;
    /** Cross product. */
    Mult(a: JsgVec3, b: JsgVec3): JsgVec3;
    [member: string]: unknown;
  }

  /** Loose surface for libs whose full API isn't typed yet. */
  type JsgLooseLib = { readonly [member: string]: (...args: never[]) => unknown };

  const JsgVect2: JsgVect2Lib;
  const JsgVect3: JsgVect3Lib;
  const JsgMat2: JsgLooseLib;
  const JsgMat3: JsgLooseLib;
  const JsgColor: JsgLooseLib;

  function JsgPlane(pos: JsgVec3, xdir: JsgVec3, ydir: JsgVec3, normalize?: boolean): unknown;

  function NewGraph2D(params: Record<string, unknown>): unknown;
  function NewGraphX3D(params: Record<string, unknown>): unknown;
  function NewModelAnimation(params: Record<string, unknown>): unknown;
}
