"use client";

import { useRef, useState } from "react";
import { Board } from "./Board";
import {
  ATTACKER_ZONE,
  BOARD_DEPTH,
  BOARD_WIDTH,
  Point,
  clampGroupTranslation,
  mmToInches,
  unitFormation,
  unitMovementRadius,
} from "@/lib/board";

type UnitInstance = {
  id: number;
  groupId: number;
  name: string;
  movement: number;
  baseMm: number;
  position: Point;
};

export function Planner() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [units, setUnits] = useState<UnitInstance[]>([]);
  const [name, setName] = useState("");
  const [movement, setMovement] = useState("5");
  const [baseMm, setBaseMm] = useState("100");
  const [quantity, setQuantity] = useState("1");
  const [formError, setFormError] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const nextId = useRef(1);
  const dragged = useRef(false);

  const toBoard = (e: PointerEvent): Point | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const addUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedQuantity = Number(quantity);
    const parsedBaseMm = Number(baseMm);
    const parsedMovement = Number(movement);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setFormError("Quantity must be a positive whole number.");
      return;
    }
    const formation = unitFormation(parsedQuantity, parsedBaseMm, BOARD_DEPTH);
    if (formation.width > BOARD_WIDTH) {
      setFormError("This quantity does not fit in the formation.");
      return;
    }
    const topOfExistingUnits = units.length
      ? Math.min(
          ...units.map(
            (unit) =>
              unit.position.y - mmToInches(unit.baseMm) / 2,
          ),
        )
      : BOARD_DEPTH;
    const rowBottom =
      units.length > 0 ? topOfExistingUnits - 0.5 : BOARD_DEPTH - 0.5;
    const placedFormation = unitFormation(parsedQuantity, parsedBaseMm, rowBottom);
    if (rowBottom - placedFormation.height < ATTACKER_ZONE.minY) {
      setFormError("There is not enough room for this unit group in the attacker zone.");
      return;
    }
    const idStart = nextId.current;
    nextId.current += parsedQuantity;
    setUnits((current) => [
      ...current,
      ...placedFormation.positions.map((position, index) => ({
        id: idStart + index,
        groupId: idStart,
        name: name.trim(),
        movement: parsedMovement,
        baseMm: parsedBaseMm,
        position,
      })),
    ]);
    setFormError("");
    setName("");
  };

  const startDrag = (unit: UnitInstance, e: React.PointerEvent) => {
    e.preventDefault();
    dragged.current = false;
    const startPointer = toBoard(e.nativeEvent);
    if (!startPointer) return;
    const group = units.filter((member) => member.groupId === unit.groupId);
    const initialGroup = group.map((member) => ({
      ...member,
      radius: mmToInches(member.baseMm) / 2,
    }));
    const move = (ev: PointerEvent) => {
      const p = toBoard(ev);
      if (p) {
        const delta = clampGroupTranslation(
          initialGroup.map(({ position, radius }) => ({ position, radius })),
          { x: p.x - startPointer.x, y: p.y - startPointer.y },
        );
        if (Math.abs(delta.x) > 0.001 || Math.abs(delta.y) > 0.001) {
          dragged.current = true;
          setSelectedGroupId(unit.groupId);
        }
        setUnits((current) => current.map((member) => {
          const original = initialGroup.find((initial) => initial.id === member.id);
          return original
            ? {
                ...member,
                position: {
                  x: original.position.x + delta.x,
                  y: original.position.y + delta.y,
                },
              }
            : member;
        }));
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div className="flex h-dvh w-full flex-col gap-4 overflow-hidden bg-zinc-900 p-4 text-zinc-100 lg:flex-row">
      <aside className="shrink-0 overflow-y-auto lg:flex-[1] lg:w-auto">
        <h2 className="mb-2 text-lg font-semibold">Add a unit</h2>
        <form onSubmit={addUnit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2"
              placeholder="Unit name"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Movement (inches)
            <input
              required
              type="number"
              min="0"
              step="0.5"
              value={movement}
              onChange={(e) => setMovement(e.target.value)}
              className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Base size (mm)
            <input
              required
              type="number"
              min="1"
              step="any"
              value={baseMm}
              onChange={(e) => setBaseMm(e.target.value)}
              className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Quantity
            <input
              required
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-sky-700 px-3 py-2 font-medium hover:bg-sky-600"
          >
            Add to map
          </button>
          {formError && (
            <p role="alert" className="text-sm text-red-300">
              {formError}
            </p>
          )}
        </form>
        <p className="mt-4 text-xs text-zinc-400">
          Click a unit on the map to show its movement range.
        </p>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center lg:w-auto lg:flex-[4]">
        <Board ref={svgRef}>
          {units.map((unit) => (
            <g key={unit.id}>
              {selectedGroupId === unit.groupId && (
                <circle
                  cx={unit.position.x}
                  cy={unit.position.y}
                  r={unitMovementRadius(unit.baseMm, unit.movement)}
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth={0.035}
                  strokeDasharray="0.12 0.18"
                  pointerEvents="none"
                />
              )}
              <circle
                cx={unit.position.x}
                cy={unit.position.y}
                r={mmToInches(unit.baseMm) / 2}
                fill={unit.groupId % 2 === 1 ? "#38bdf8" : "#f97316"}
                stroke="#fff"
                strokeWidth={0.1}
                className="cursor-grab"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => startDrag(unit, e)}
                onClick={() => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  setSelectedGroupId((current) =>
                    current === unit.groupId ? null : unit.groupId,
                  );
                }}
              />
              <text
                x={unit.position.x}
                y={unit.position.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={0.4}
                textLength={mmToInches(unit.baseMm) * 0.82}
                lengthAdjust="spacingAndGlyphs"
                fill="#fff"
                pointerEvents="none"
              >
                {unit.name}
              </text>
            </g>
          ))}
        </Board>
      </div>
    </div>
  );
}
