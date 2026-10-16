export type RoomieFacing = "front" | "left" | "right";
type Position = { x: number; y: number };

// Screen y grows toward the viewer. Horizontal travel keeps the side cycles;
// upward travel retains its previous direction until a back pose is supplied.
export function movementFacing(from: Position, to: Position, previous: RoomieFacing): RoomieFacing {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (dy > .1 && dy >= Math.abs(dx)) return "front";
  if (Math.abs(dx) > .1) return dx < 0 ? "left" : "right";
  return previous;
}

// Reuse the exact original head and its existing editable specs layer. Only
// the new body frames change; generated facial details are clipped away.
export const frontWalkRegistration = {
  headTransform: "translate(23 12) scale(.435)",
  headBottom: 323,
  frameWidth: 456,
  frameHeight: 750,
} as const;
