/** Per-model pointer state shared between the DOM wrapper (ModelView) and its 3D scene. Mutated, never re-rendered. */
export type ModelControl = {
  /** Accumulated drag rotation (radians). */
  rx: number;
  ry: number;
  /** Spin velocity after release (radians per frame at 60 fps). */
  vy: number;
  dragging: boolean;
  /** Pointer position over the model, -1…1, and whether it is hovering. */
  hx: number;
  hy: number;
  hover: boolean;
};
export const newControl = (): ModelControl => ({ rx: 0, ry: 0, vy: 0, dragging: false, hx: 0, hy: 0, hover: false });
