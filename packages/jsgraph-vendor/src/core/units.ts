// =============================================================================
// units.ts - Length/height/angle unit conversion helpers used by panels.
//   L = length, H = height, A = angle gradient.
//
//   Phase-2 note: reads the tables from the global CurveApp instance (the
//   app's composition root sets it up at boot; tests stub it). Typed here with
//   a minimal contract — only the fields these helpers consume.
// =============================================================================

interface UnitsTable {
  readonly Units: readonly string[];
  readonly Mults: readonly number[];
}

/** Minimal contract of the global CurveApp instance used by the converters. */
interface CurveAppUnitsHost {
  UnitsType: number;
  readonly LengthUnits: UnitsTable;
  readonly HeightUnits: UnitsTable;
  readonly GradientUnits: UnitsTable;
}

function curveApp(): CurveAppUnitsHost {
  const host = (globalThis as { CurveApp?: CurveAppUnitsHost }).CurveApp;
  if (!host) throw new Error("units.js: global CurveApp not initialized");
  return host;
}

/** Mults[UnitsType] with a guard (index is always valid at runtime). */
function mult(table: UnitsTable): number {
  const m = table.Mults[curveApp().UnitsType];
  if (m === undefined) throw new Error("units.js: UnitsType out of range");
  return m;
}

function unitLabel(table: UnitsTable): string {
  const u = table.Units[curveApp().UnitsType];
  if (u === undefined) throw new Error("units.js: UnitsType out of range");
  return u;
}

export function LVal(x: number): number {
  return x / mult(curveApp().LengthUnits);
}

export function LUnit(): string {
  return " " + unitLabel(curveApp().LengthUnits);
}

export function HVal(x: number): number {
  return x / mult(curveApp().HeightUnits);
}

export function HUnit(): string {
  return " " + unitLabel(curveApp().HeightUnits);
}

export function AVal(x: number): number {
  return x / mult(curveApp().GradientUnits);
}

export function AUnit(): string {
  return unitLabel(curveApp().GradientUnits);
}
