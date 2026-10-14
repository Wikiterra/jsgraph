// =============================================================================
// geo.ts — Geographic ↔ local coordinate conversion (pure, DOM-free).
//
//   PLAN.md principle #1: geographic coordinates (lat/lon/alt/CRS) are kept
//   as such; conversion to LOCAL physical coordinates happens only at the
//   calculation edge. This module owns that boundary.
//
//   Model: sphere of given radius (the simulator works with an effective
//   earth radius, refracted or not — callers pass it explicitly). WGS84
//   geographic coordinates in, ENU (East-North-Up, meters) local frame out.
//
//   NOTE: proj4 (Phase 4) handles CRS-to-CRS transforms; this module handles
//   the geographic↔local step that must stay testable without proj4.
// =============================================================================

/** Coordinate reference system identifier, e.g. "EPSG:4326" (WGS84 lat/lon). */
export type CrsId = string;

export const WGS84: CrsId = "EPSG:4326";

/** Mean earth radius (m). Apps may pass a refracted/effective radius. */
export const EARTH_RADIUS_MEAN = 6371000;

/** Geographic point: degrees + altitude above the sphere surface (m). */
export interface GeoPoint {
  readonly lat: number;
  readonly lon: number;
  readonly alt: number;
  readonly crs: CrsId;
}

/** Local point in an ENU frame: x = east, y = north, z = up (meters). */
export interface LocalPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** A local tangent frame anchored at `origin` on a sphere of `radius`. */
export interface LocalFrame {
  readonly origin: GeoPoint;
  readonly radius: number;
}

const DEG = Math.PI / 180;

/** Validate lat/lon ranges; throws on out-of-range input. */
export function assertValidGeoPoint(p: GeoPoint): void {
  if (!Number.isFinite(p.lat) || p.lat < -90 || p.lat > 90) {
    throw new Error(`geo: latitude out of range [-90, 90]: ${p.lat}`);
  }
  if (!Number.isFinite(p.lon) || p.lon < -180 || p.lon > 180) {
    throw new Error(`geo: longitude out of range [-180, 180]: ${p.lon}`);
  }
  if (!Number.isFinite(p.alt)) {
    throw new Error(`geo: altitude not finite: ${p.alt}`);
  }
}

/** Build a local ENU frame at `origin` (validated). */
export function createLocalFrame(origin: GeoPoint, radius: number = EARTH_RADIUS_MEAN): LocalFrame {
  assertValidGeoPoint(origin);
  if (!(radius > 0)) throw new Error(`geo: radius must be positive: ${radius}`);
  return { origin, radius };
}

/**
 * Convert a geographic point to local ENU coordinates in `frame`.
 * The point's `alt` is measured above the sphere; lat/lon must be WGS84
 * degrees (CRS transforms happen upstream, see Phase 4 / proj4).
 */
export function toLocal(frame: LocalFrame, p: GeoPoint): LocalPoint {
  assertValidGeoPoint(p);
  const { origin, radius } = frame;

  const lat1 = origin.lat * DEG;
  const lon1 = origin.lon * DEG;
  const lat2 = p.lat * DEG;
  const lon2 = p.lon * DEG;

  // Geocentric (ECEF) positions on the sphere, at the given altitudes.
  const r1 = radius + origin.alt;
  const r2 = radius + p.alt;
  const x1 = r1 * Math.cos(lat1) * Math.cos(lon1);
  const y1 = r1 * Math.cos(lat1) * Math.sin(lon1);
  const z1 = r1 * Math.sin(lat1);
  const x2 = r2 * Math.cos(lat2) * Math.cos(lon2);
  const y2 = r2 * Math.cos(lat2) * Math.sin(lon2);
  const z2 = r2 * Math.sin(lat2);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;

  // Rotate the delta into the origin's East-North-Up basis.
  const sinLat = Math.sin(lat1);
  const cosLat = Math.cos(lat1);
  const sinLon = Math.sin(lon1);
  const cosLon = Math.cos(lon1);

  return {
    x: -sinLon * dx + cosLon * dy,                                   // east
    y: -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz,   // north
    z: cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz,    // up
  };
}

/** Inverse of toLocal: local ENU coordinates → geographic point. */
export function fromLocal(frame: LocalFrame, p: LocalPoint): GeoPoint {
  const { origin, radius } = frame;

  const lat1 = origin.lat * DEG;
  const lon1 = origin.lon * DEG;
  const sinLat = Math.sin(lat1);
  const cosLat = Math.cos(lat1);
  const sinLon = Math.sin(lon1);
  const cosLon = Math.cos(lon1);

  // Rotate the ENU delta back into the geocentric axis basis.
  const r1 = radius + origin.alt;
  const x1 = r1 * Math.cos(lat1) * Math.cos(lon1);
  const y1 = r1 * Math.cos(lat1) * Math.sin(lon1);
  const z1 = r1 * Math.sin(lat1);

  const dx = -sinLon * p.x - sinLat * cosLon * p.y + cosLat * cosLon * p.z;
  const dy = cosLon * p.x - sinLat * sinLon * p.y + cosLat * sinLon * p.z;
  const dz = cosLat * p.y + sinLat * p.z;

  const x = x1 + dx;
  const y = y1 + dy;
  const z = z1 + dz;

  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = Math.asin(z / r) / DEG;
  const lon = Math.atan2(y, x) / DEG;

  return { lat, lon, alt: r - radius, crs: WGS84 };
}

// ---------------------------------------------------------------------------
// Geodesy on the frame's sphere (surface arc + initial bearing)
// ---------------------------------------------------------------------------

/**
 * Initial bearing (deg, 0° = north, positive = east) from `a` to `b` along
 * the great circle — the direction a walker at `a` must face to walk straight
 * to `b`. Note: along a parallel (non-great-circle) the shortest path bows
 * toward the nearest pole, so e.g. due east at 50°N starts slightly north.
 */
export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const p1 = a.lat * DEG;
  const p2 = b.lat * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const y = Math.sin(dLon) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLon);
  return Math.atan2(y, x) / DEG;
}

/**
 * Surface arc (m) from the frame's origin to `b`, measured along the sphere
 * of `frame.radius` (haversine; stable at antipodes and small separations).
 */
export function surfaceArc(frame: LocalFrame, b: GeoPoint): number {
  const p1 = frame.origin.lat * DEG;
  const p2 = b.lat * DEG;
  const dLat = p2 - p1;
  const dLon = (b.lon - frame.origin.lon) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  const dSigma = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return frame.radius * dSigma;
}

/**
 * Spherical direct geodesy: the point reached by walking `distM` meters from
 * `start` along the initial bearing `bearingDeg` on the frame's sphere
 * (great-circle). The walker's "surface" position — independent of the
 * world's render shape (see worldGeometry.ts); altitude is carried over.
 */
export function destinationPoint(
  frame: LocalFrame,
  start: GeoPoint,
  bearingDegStart: number,
  distM: number,
): GeoPoint {
  const phi1 = start.lat * DEG;
  const lam1 = start.lon * DEG;
  const theta = bearingDegStart * DEG;
  const delta = distM / frame.radius; // angular distance

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(Math.max(-1, Math.min(1, sinPhi2)));
  const lam2 =
    lam1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * sinPhi2,
    );

  return {
    lat: phi2 / DEG,
    lon: wrapLonDeg(lam2 / DEG),
    alt: start.alt,
    crs: start.crs,
  };
}

/** Wrap longitude degrees into (−180, 180]. */
export function wrapLonDeg(lonDeg: number): number {
  const l = ((((lonDeg + 180) % 360) + 360) % 360) - 180;
  return l === -180 ? 180 : l;
}
