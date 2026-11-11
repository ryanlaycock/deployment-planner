export const BOARD_WIDTH = 60;
export const BOARD_DEPTH = 44;
export const CENTRE_Y = BOARD_DEPTH / 2;
export const CENTRE_GAP = 9;
export const mmToInches = (mm: number) => mm / 25.4;
export const OBJECTIVE_MARKER_MM = 40;
export const OBJECTIVE_CONTROL_DISTANCE = 3;
export const OBJECTIVE_RING_RADIUS =
  mmToInches(OBJECTIVE_MARKER_MM) / 2 + OBJECTIVE_CONTROL_DISTANCE;

export const unitMovementRadius = (baseMm: number, movementInches: number) =>
  mmToInches(baseMm) / 2 + movementInches;

export type Point = { x: number; y: number };

export function unitFormation(
  quantity: number,
  baseMm: number,
  bottomEdge: number,
  gap = 0.5,
): { positions: Point[]; width: number; height: number } {
  const radius = mmToInches(baseMm) / 2;
  const diameter = radius * 2;
  const columns = Math.ceil(quantity / 2);
  const rows = Math.ceil(quantity / columns);
  const width = columns * diameter + (columns - 1) * gap;
  const height = rows * diameter + (rows - 1) * gap;
  const positions = Array.from({ length: quantity }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowCount = Math.min(columns, quantity - row * columns);
    const rowWidth = rowCount * diameter + (rowCount - 1) * gap;
    const firstX = (BOARD_WIDTH - rowWidth) / 2 + radius;
    return {
      x: firstX + column * (diameter + gap),
      y: bottomEdge - radius - row * (diameter + gap),
    };
  });
  return { positions, width, height };
}

export function clampGroupTranslation(
  placements: { position: Point; radius: number }[],
  delta: Point,
): Point {
  const minX = Math.max(
    ...placements.map(({ position, radius }) => ATTACKER_ZONE.minX + radius - position.x),
  );
  const maxX = Math.min(
    ...placements.map(({ position, radius }) => ATTACKER_ZONE.maxX - radius - position.x),
  );
  const minY = Math.max(
    ...placements.map(({ position, radius }) => ATTACKER_ZONE.minY + radius - position.y),
  );
  const maxY = Math.min(
    ...placements.map(({ position, radius }) => BOARD_DEPTH - radius - position.y),
  );
  return {
    x: Math.min(Math.max(delta.x, minX), maxX),
    y: Math.min(Math.max(delta.y, minY), maxY),
  };
}

// y grows downwards; the attacker owns the bottom half of the board.
export const ATTACKER_ZONE = {
  minX: 0,
  maxX: BOARD_WIDTH,
  minY: CENTRE_Y + CENTRE_GAP,
  maxY: BOARD_DEPTH,
};

export const OBJECTIVES: Point[] = [
  { x: BOARD_WIDTH / 2, y: CENTRE_Y / 2 },
  { x: BOARD_WIDTH / 2, y: CENTRE_Y + CENTRE_Y / 2 },
];

/** Clamp a base centre so the whole base lies inside the attacker deployment zone. */
export function clampToAttackerZone(p: Point, radius: number): Point {
  const z = ATTACKER_ZONE;
  return {
    x: Math.min(Math.max(p.x, z.minX + radius), z.maxX - radius),
    y: Math.min(Math.max(p.y, z.minY + radius), z.maxY - radius),
  };
}
