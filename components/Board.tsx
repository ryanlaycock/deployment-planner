"use client";

import { forwardRef } from "react";
import {
  ATTACKER_ZONE,
  BOARD_DEPTH,
  BOARD_WIDTH,
  CENTRE_Y,
  OBJECTIVES,
  OBJECTIVE_RING_RADIUS,
  OBJECTIVE_MARKER_MM,
  mmToInches,
} from "@/lib/board";

// viewBox is in inches, so every drawn size is to scale at any screen size.
export const Board = forwardRef<SVGSVGElement, { children?: React.ReactNode }>(
  function Board({ children }, ref) {
    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_DEPTH}`}
        className="aspect-[15/11] h-full w-auto max-w-full select-none rounded border border-zinc-600 bg-zinc-800"
      >
        <rect x={0} y={0} width={BOARD_WIDTH} height={CENTRE_Y} fill="#7f1d1d" fillOpacity={0.35} />
        <rect x={0} y={CENTRE_Y} width={BOARD_WIDTH} height={CENTRE_Y} fill="#1e3a8a" fillOpacity={0.35} />
        <rect
          x={ATTACKER_ZONE.minX}
          y={CENTRE_Y}
          width={BOARD_WIDTH}
          height={ATTACKER_ZONE.minY - CENTRE_Y}
          fill="#000"
          fillOpacity={0.35}
        />
        <line x1={0} x2={BOARD_WIDTH} y1={CENTRE_Y} y2={CENTRE_Y} stroke="#fff" strokeWidth={0.1} strokeDasharray="0.5 0.4" />
        {OBJECTIVES.map((o, i) => (
          <g key={i}>
            <circle cx={o.x} cy={o.y} r={OBJECTIVE_RING_RADIUS} fill="#facc15" fillOpacity={0.12} stroke="#facc15" strokeWidth={0.1} strokeDasharray="0.4 0.3" />
            <circle cx={o.x} cy={o.y} r={mmToInches(OBJECTIVE_MARKER_MM) / 2} fill="#facc15" stroke="#000" strokeWidth={0.08} />
          </g>
        ))}
        {children}
      </svg>
    );
  },
);
