// Port (contract) for 3D rendering. Apps depend on THIS, not on the wabis globals.
// Kept intentionally minimal (Interface Segregation): only what apps actually need.
// Expanded in Phase 3 as the earth-drop-calc pilot is migrated.

export type Vec3 = readonly [number, number, number];

export interface CameraParams {
  /** World-space size mapped to the viewport. */
  readonly sceneSize: number;
  readonly pos: Vec3;
  readonly up: Vec3;
  readonly viewCenter: Vec3;
}

export interface Renderer3D {
  setCamera(camera: CameraParams): void;
  line3D(from: Vec3, to: Vec3): void;
  text3D(text: string, at: Vec3): void;
  clear(): void;
}
