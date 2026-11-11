import { describe, expect, it } from "vitest";
import {
  clampToAttackerZone,
  mmToInches,
  OBJECTIVE_CONTROL_DISTANCE,
  OBJECTIVE_MARKER_MM,
  OBJECTIVE_RING_RADIUS,
  unitMovementRadius,
  unitFormation,
  clampGroupTranslation,
} from "./board";

const r = mmToInches(100) / 2;

describe("objective sizing", () => {
  it("measures the 3in control distance from the marker edge", () => {
    expect(OBJECTIVE_RING_RADIUS - mmToInches(OBJECTIVE_MARKER_MM) / 2).toBeCloseTo(
      OBJECTIVE_CONTROL_DISTANCE,
    );
  });
});

describe("unitMovementRadius", () => {
  it("measures movement from the edge of the base", () => {
    expect(unitMovementRadius(100, 5) - mmToInches(100) / 2).toBeCloseTo(5);
  });
});

describe("unitFormation", () => {
  it("arranges 20 models in two horizontal ranks with 0.5in edge gaps", () => {
    const { positions, width, height } = unitFormation(20, 28.5, 43.5);
    const diameter = mmToInches(28.5);

    expect(positions).toHaveLength(20);
    expect(positions[1].x - positions[0].x - diameter).toBeCloseTo(0.5);
    expect(positions[0].y - positions[10].y - diameter).toBeCloseTo(0.5);
    expect(positions[0].x - diameter / 2).toBeCloseTo((60 - width) / 2);
    expect(height).toBeCloseTo(diameter * 2 + 0.5);
    for (const [index, unit] of positions.entries()) {
      const neighbors = positions.filter((other, otherIndex) => {
        if (index === otherIndex) return false;
        const dx = Math.abs(unit.x - other.x);
        const dy = Math.abs(unit.y - other.y);
        return (
          (Math.abs(dx - diameter - 0.5) < 0.001 && dy < 0.001) ||
          (Math.abs(dy - diameter - 0.5) < 0.001 && dx < 0.001)
        );
      });
      expect(neighbors.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("clampGroupTranslation", () => {
  it("keeps every base in the attacker zone without changing relative positions", () => {
    const group = [
      { position: { x: 10, y: 38 }, radius: 1 },
      { position: { x: 12.5, y: 38 }, radius: 1 },
    ];
    const delta = clampGroupTranslation(group, { x: -20, y: 20 });

    expect(delta.x).toBeCloseTo(-9);
    expect(delta.y).toBeCloseTo(5);
    expect(group[1].position.x + delta.x - (group[0].position.x + delta.x)).toBeCloseTo(2.5);
  });
});

describe("clampToAttackerZone", () => {
  it("keeps valid positions unchanged", () => {
    expect(clampToAttackerZone({ x: 30, y: 38 }, r)).toEqual({ x: 30, y: 38 });
  });
  it("keeps the base more than 9in from the centre line", () => {
    expect(clampToAttackerZone({ x: 30, y: 10 }, r).y).toBeCloseTo(31 + r);
  });
  it("keeps the base inside the board edges", () => {
    expect(clampToAttackerZone({ x: -5, y: 99 }, r)).toEqual({ x: r, y: 44 - r });
    expect(clampToAttackerZone({ x: 99, y: 40 }, r).x).toBeCloseTo(60 - r);
  });
});
