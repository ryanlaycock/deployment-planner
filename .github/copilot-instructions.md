# Copilot Instructions

Frontend-only Next.js (App Router, TypeScript, Tailwind) planner for Warhammer Age of Sigmar deployment zones. `AGENTS.md` warns this Next.js version has breaking changes: check `node_modules/next/dist/docs/` before using Next APIs.

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- `npm test` (Vitest); single file: `npx vitest run lib/board.test.ts`; single test: `npx vitest run -t "name"`

## Architecture
- `lib/board.ts`: all board geometry and placement rules (pure, unit-tested). New deployment rules belong here, not in components.
- `components/Board.tsx`: SVG map. `components/Planner.tsx`: page layout (map ~80%, unit form ~20%), unit creation, selection, and drag logic.

## Conventions
- All geometry is in **inches**; convert mm with `mmToInches`. The SVG `viewBox` is `0 0 60 44`, so drawn sizes are to scale at any screen size.
- Board is 60" wide x 44" deep, y grows downwards. Attacker is the bottom half; a base must be wholly inside it and >9" from the centre line. `clampToAttackerZone` clamps a base centre (rather than rejecting the move).
- Objectives: one centred in each half, a 40mm marker with a 3" control distance measured from the marker edge (ring radius = marker radius + 3").
- The left unit form creates named instances with movement (inches), base size, and quantity. Batches form two horizontal ranks with 0.5" between adjacent base edges. Clicking a model selects its whole batch; dragging any model translates the whole batch while keeping all bases in the attacker zone. Clicking a batch toggles dotted movement boundaries whose radius is each base radius plus its movement characteristic. Dragging uses window-level pointer listeners and `getScreenCTM().inverse()` for board coordinates.
- Designed desktop-first; layout stacks below `lg`.
