# FlowForge — Modular Diagram Builder

A fully modular visual flowchart & diagram builder built with Next.js 16, TypeScript, Tailwind CSS 4, and React Flow. Every block, every flow line, every visual property is editable. Export to JSON / SVG / PNG / HTML. Round-trip with the JSON Schema docs.

## Features

### Builder Tab (Visual Editor)
- 11 shape types: rectangle, rounded, circle, ellipse, diamond, parallelogram, hexagon, triangle, cylinder, document, terminator
- Drag-and-drop blocks onto an infinite canvas
- Click-drag from any handle (top/bottom/left/right) to draw flow lines
- Per-block editing: label, subtitle, icon, shape, width, height, fill, stroke, stroke width, text color, font size, font weight, font family, opacity, drop shadow
- Per-line editing: label, line type (bezier/straight/step/smoothstep), stroke color, stroke width, stroke style (solid/dashed/dotted), source arrow, target arrow, animation, label styling
- Canvas settings: background color, grid on/off, grid size, snap-to-grid
- Undo / Redo (up to 50 steps)
- Duplicate, delete blocks
- Live JSON export/import dialog with copy + download

### Docs Tab
- Complete JSON Schema documentation
- Field tables for every object: Canvas, Node, NodeData, BlockStyle, Edge, EdgeStyleProps
- Shape options, edge type options, stroke style options, arrow options reference
- Minimal example (copy-ready) + full reference example
- Tips & gotchas section

### Render Tab (JSON → Image/HTML)
- Paste JSON or upload `.json` file
- Live SVG preview renders instantly
- One-click export: SVG, PNG (2× crisp), standalone HTML, or JSON
- Built-in sample pipeline to get started immediately
- Validates JSON and shows helpful error messages

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (New York style) + Lucide icons
- @xyflow/react (React Flow v12) for the canvas
- Zustand for state management
- Sonner for toast notifications

## Run Locally

```bash
bun install
bun run dev
# open http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js — accept the defaults.
4. Click Deploy. Done.

No environment variables required. No database required. The whole app is client-side.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   └── page.tsx            # Main page with tab navigation
├── components/
│   ├── builder/
│   │   ├── BlockPalette.tsx     # Left sidebar - shape picker + tools
│   │   ├── BuilderCanvas.tsx    # React Flow canvas
│   │   ├── BuilderView.tsx      # 3-column layout wrapper
│   │   ├── DiagramBlockNode.tsx # Custom React Flow node
│   │   ├── InspectorPanel.tsx   # Right sidebar - property editor
│   │   └── JsonDialog.tsx       # Export/Import modal
│   ├── docs/
│   │   └── DocsView.tsx         # JSON Schema documentation
│   ├── render/
│   │   └── RenderView.tsx       # JSON → SVG/PNG/HTML renderer
│   └── ui/                       # shadcn/ui components
├── lib/
│   └── diagram/
│       └── shapes.ts        # SVG path generator for every shape
├── store/
│   └── diagram-store.ts     # Zustand store with undo/redo
└── types/
    └── diagram.ts           # All TypeScript types & defaults
```

## JSON Schema (Quick Reference)

```json
{
  "name": "My Diagram",
  "version": "1.0.0",
  "canvas": {
    "width": 1600, "height": 1000,
    "background": "#fafafa",
    "showGrid": true, "gridColor": "#e2e8f0", "gridSize": 20,
    "snapToGrid": false
  },
  "nodes": [
    {
      "id": "start",
      "type": "diagramBlock",
      "position": { "x": 80, "y": 80 },
      "data": {
        "label": "Start",
        "shape": "terminator",
        "width": 160, "height": 60,
        "style": {
          "fill": "#dcfce7", "stroke": "#16a34a", "strokeWidth": 2,
          "textColor": "#14532d", "fontSize": 14, "fontWeight": 500,
          "fontFamily": "Inter, sans-serif", "opacity": 1, "shadow": true
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1", "source": "start", "target": "end",
      "type": "smoothstep",
      "data": {
        "style": {
          "stroke": "#475569", "strokeWidth": 2, "strokeStyle": "solid",
          "type": "smoothstep", "animated": false,
          "sourceArrow": "none", "targetArrow": "arrowclosed"
        }
      }
    }
  ]
}
```

See the **Docs** tab in the app for the complete schema reference.

## Customizing & Extending

### Add a new shape
1. Add the new value to `BlockShape` in `src/types/diagram.ts`.
2. Add a case to `getShapePath()` in `src/lib/diagram/shapes.ts` returning an SVG path string.
3. Add it to `blockShapeOptions` so it appears in the palette and inspector.

### Add a new edge type
1. Add the value to `EdgeStyle` in `src/types/diagram.ts`.
2. Add a case to `buildPath()` in `src/components/render/RenderView.tsx` for SVG export.
3. Add it to `edgeTypeOptions`.

### Add a new block style property
1. Add the field to `BlockStyle` in `src/types/diagram.ts` and to `defaultBlockStyle`.
2. Render it in `DiagramBlockNode.tsx`.
3. Add an inspector control in `InspectorPanel.tsx`.
4. Apply it in `renderNodeSVG()` in `RenderView.tsx` for exports.

## License
MIT — use it, fork it, ship it.
