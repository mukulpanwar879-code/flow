"use client";

import { jsPDF } from "jspdf";
import {
  blockShapeOptions,
  edgeTypeOptions,
  strokeStyleOptions,
  arrowOptions,
} from "@/types/diagram";

// Generates a text-based PDF (selectable & AI-extractable) containing the full
// JSON schema documentation for the FlowForge diagram builder.
//
// We intentionally avoid html2canvas / raster approaches — every line of text
// is added via doc.text() so the resulting PDF has a real text layer that AI
// readers (ChatGPT, Claude, Gemini, etc.) can extract directly.

const PAGE_MARGIN = 50; // px
const PAGE_WIDTH = 595.28; // A4 width in px (72dpi)
const PAGE_HEIGHT = 841.89; // A4 height in px
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export function generateDocsPDF(): Blob {
  const doc = new jsPDF({
    unit: "px",
    format: "a4",
    compress: true,
  });

  let y = PAGE_MARGIN;

  // ============ Helpers ============

  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > PAGE_HEIGHT - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  };

  const writeHeading = (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: 22, 2: 16, 3: 13 };
    const size = sizes[level];
    const gapBefore = { 1: 18, 2: 14, 3: 10 };
    const gapAfter = { 1: 8, 2: 6, 3: 4 };

    ensureSpace(size + gapBefore[level] + gapAfter[level]);
    y += gapBefore[level];

    if (level === 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(text, PAGE_MARGIN, y);
      // underline accent
      y += 4;
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(2);
      doc.line(PAGE_MARGIN, y, PAGE_MARGIN + 40, y);
      y += gapAfter[level] + 4;
    } else if (level === 2) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(text, PAGE_MARGIN, y);
      y += gapAfter[level];
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(text, PAGE_MARGIN, y);
      y += gapAfter[level];
    }
  };

  const writeParagraph = (text: string, options?: { italic?: boolean; color?: [number, number, number]; indent?: number }) => {
    const size = 11;
    doc.setFont("helvetica", options?.italic ? "italic" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(options?.color ?? [71, 85, 105])); // slate-600

    const indent = options?.indent ?? 0;
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    const lineHeight = size * 1.45;

    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, PAGE_MARGIN + indent, y);
      y += lineHeight;
    });
    y += 4;
  };

  const writeBullet = (text: string) => {
    const size = 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(71, 85, 105);

    const bulletIndent = 16;
    const lineHeight = size * 1.45;
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - bulletIndent);

    // bullet
    ensureSpace(lineHeight);
    doc.setFontSize(11);
    doc.text("•", PAGE_MARGIN + 4, y);
    lines.forEach((line: string, i: number) => {
      if (i > 0) ensureSpace(lineHeight);
      doc.text(line, PAGE_MARGIN + bulletIndent, y);
      y += lineHeight;
    });
    y += 2;
  };

  const writeCode = (code: string) => {
    const size = 9;
    doc.setFont("courier", "normal");
    doc.setFontSize(size);

    const lines = code.split("\n");
    const lineHeight = size * 1.4;
    const padding = 8;
    const blockHeight = lines.length * lineHeight + padding * 2;

    ensureSpace(blockHeight + 8);

    // background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, blockHeight, 4, 4, "FD");

    y += padding;
    doc.setTextColor(15, 23, 42);

    lines.forEach((line: string) => {
      const wrapped = doc.splitTextToSize(line || " ", CONTENT_WIDTH - padding * 2);
      wrapped.forEach((w: string) => {
        doc.text(w, PAGE_MARGIN + padding, y);
        y += lineHeight;
      });
    });
    y += padding + 6;
  };

  const writeFieldTable = (rows: [string, string, string][], title?: string) => {
    if (title) writeHeading(title, 3);

    const size = 9;
    const headerHeight = 18;
    const rowHeight = 14;
    const colWidths = [CONTENT_WIDTH * 0.22, CONTENT_WIDTH * 0.22, CONTENT_WIDTH * 0.56];

    ensureSpace(headerHeight + rowHeight * Math.min(rows.length, 3));

    // header row
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, headerHeight, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(15, 23, 42);
    doc.text("Field", PAGE_MARGIN + 6, y + 12);
    doc.text("Type", PAGE_MARGIN + colWidths[0] + 6, y + 12);
    doc.text("Description", PAGE_MARGIN + colWidths[0] + colWidths[1] + 6, y + 12);
    y += headerHeight;

    // data rows
    doc.setFont("helvetica", "normal");
    rows.forEach(([field, type, desc], idx) => {
      const descLines = doc.splitTextToSize(desc, colWidths[2] - 12) as string[];
      const rowH = Math.max(rowHeight, descLines.length * 11);

      ensureSpace(rowH);

      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 251);
        doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowH, "F");
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(PAGE_MARGIN, y + rowH, PAGE_MARGIN + CONTENT_WIDTH, y + rowH);

      doc.setFont("courier", "normal");
      doc.setFontSize(size);
      doc.setTextColor(15, 23, 42);
      doc.text(field, PAGE_MARGIN + 6, y + 10);

      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(type, PAGE_MARGIN + colWidths[0] + 6, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      descLines.forEach((line: string, i: number) => {
        doc.text(line, PAGE_MARGIN + colWidths[0] + colWidths[1] + 6, y + 10 + i * 11);
      });

      y += rowH;
    });
    y += 8;
  };

  const writeEnumList = (title: string, items: { value: string; label: string }[]) => {
    writeHeading(title, 3);
    items.forEach((item) => {
      const size = 10;
      doc.setFont("courier", "normal");
      doc.setFontSize(size);
      doc.setTextColor(37, 99, 235);
      ensureSpace(14);
      doc.text(item.value, PAGE_MARGIN + 16, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`— ${item.label}`, PAGE_MARGIN + 16 + doc.getTextWidth(item.value) + 8, y);
      y += 14;
    });
    y += 6;
  };

  // ============ Cover ============

  // Accent bar at top
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, PAGE_WIDTH, 6, "F");

  y = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42);
  doc.text("FlowForge", PAGE_MARGIN, y);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  doc.text("JSON Schema Documentation", PAGE_MARGIN, y);

  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("Reference for building diagram JSON files compatible with FlowForge.", PAGE_MARGIN, y);
  y += 16;
  doc.text("Build, share, and render flowcharts from JSON. Round-trip with the visual Builder.", PAGE_MARGIN, y);

  y += 30;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);

  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Version: 1.0.0  ·  Generated: ${new Date().toISOString().split("T")[0]}`, PAGE_MARGIN, y);
  doc.text("Format: Text-based PDF (AI-extractable)", PAGE_MARGIN, y + 14);

  doc.addPage();
  y = PAGE_MARGIN;

  // ============ Table of Contents ============

  writeHeading("Table of Contents", 1);
  const toc = [
    "1. Quick Start",
    "2. Top-Level Schema",
    "3. Canvas Object",
    "4. Node Object",
    "5. NodeData Object",
    "6. Available Block Shapes",
    "7. BlockStyle Object",
    "8. Edge Object",
    "9. EdgeStyle Options (Enums)",
    "10. EdgeStyleProps Object",
    "11. Enterprise Node Types",
    "12. Group / Container",
    "13. Annotation",
    "14. Brace / Bracket",
    "15. Swimlane",
    "16. Timeline",
    "17. SLA Badges, Criteria & Ownership",
    "18. Orthogonal Edge Routing",
    "19. Full Reference Example",
    "20. Minimal Example",
    "21. Tips & Validation Rules",
  ];
  toc.forEach((line) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    ensureSpace(18);
    doc.text(line, PAGE_MARGIN + 8, y);
    y += 18;
  });

  doc.addPage();
  y = PAGE_MARGIN;

  // ============ 1. Quick Start ============

  writeHeading("1. Quick Start", 1);
  writeParagraph(
    "A FlowForge diagram is fully described by a single JSON object. The same JSON powers the visual Builder and the Render view — round-trip compatible. Use the schema below to author diagrams by hand, then upload the JSON in the Render tab to produce SVG, PNG, or HTML output."
  );

  writeHeading("Three steps to a diagram", 3);
  writeBullet("Create a JSON object with name, version, canvas, nodes, and edges.");
  writeBullet("Each block lives in nodes[] — give it a unique id, a position, and a data object describing the shape and style.");
  writeBullet("Each connector lives in edges[] — reference source and target block IDs and choose a line style.");

  // ============ 2. Top-Level Schema ============

  writeHeading("2. Top-Level Schema", 2);
  writeCode(`{
  "name":     string,    // project name (shown in header & exports)
  "version":  string,    // schema version, e.g. "1.0.0"
  "canvas":   Canvas,    // background & grid settings
  "nodes":    Node[],    // array of blocks
  "edges":    Edge[]     // array of connections
}`);

  // ============ 3. Canvas ============

  writeHeading("3. Canvas Object", 2);
  writeParagraph("The canvas object configures the background, grid, and snapping behavior of the drawing surface.");
  writeFieldTable([
    ["width", "number", "Logical canvas width in pixels"],
    ["height", "number", "Logical canvas height in pixels"],
    ["background", "string (hex)", "Canvas background color, e.g. #fafafa"],
    ["showGrid", "boolean", "Show dotted grid in Builder"],
    ["gridColor", "string (hex)", "Grid dot color"],
    ["gridSize", "number", "Grid spacing in px (10-50)"],
    ["snapToGrid", "boolean", "Snap blocks to grid while dragging"],
  ]);

  // ============ 4. Node ============

  writeHeading("4. Node Object", 2);
  writeParagraph("Each block on the canvas is described by a Node object. The id is used by edges to reference source and target.");
  writeFieldTable([
    ["id", "string", "Unique block identifier (referenced by edges)"],
    ["type", '"diagramBlock"', "Must be exactly 'diagramBlock'"],
    ["position", "{ x, y }", "Top-left position in canvas coordinates"],
    ["data", "NodeData", "Label, shape & style (see next section)"],
  ]);

  // ============ 5. NodeData ============

  writeHeading("5. NodeData Object", 2);
  writeParagraph("NodeData holds the visible content and shape of a block. Subtitle and icon are optional.");
  writeFieldTable([
    ["label", "string", "Main text shown inside the block"],
    ["subtitle?", "string", "Optional secondary text below the label"],
    ["icon?", "string", "Optional emoji or glyph prefix"],
    ["shape", "BlockShape", "One of the shapes listed in section 6"],
    ["width", "number", "Block width in px (minimum 20)"],
    ["height", "number", "Block height in px (minimum 20)"],
    ["style", "BlockStyle", "Colors, fonts, stroke (see section 7)"],
  ]);

  // ============ 6. Shapes ============

  writeHeading("6. Available Block Shapes", 2);
  writeParagraph("The shape property accepts one of the following 11 string values. Each renders as an SVG path in both the Builder canvas and exported outputs.");
  writeEnumList(
    "Shape values",
    blockShapeOptions.map((s) => ({ value: s.value, label: s.label }))
  );

  // ============ 7. BlockStyle ============

  writeHeading("7. BlockStyle Object", 2);
  writeParagraph("BlockStyle controls the visual appearance of a block. All color values are hex strings.");
  writeFieldTable([
    ["fill", "string (hex)", "Block background color"],
    ["stroke", "string (hex)", "Border color"],
    ["strokeWidth", "number", "Border thickness, 0 to 8"],
    ["textColor", "string (hex)", "Label text color"],
    ["fontSize", "number", "Label font size in px (8-32)"],
    ["fontWeight", "number", "Font weight 300 to 800"],
    ["fontFamily", "string", "Any CSS font stack, e.g. 'Inter, sans-serif'"],
    ["opacity", "number", "0 to 1"],
    ["borderRadius?", "number", "Corner radius for rectangles"],
    ["shadow?", "boolean", "Drop shadow on or off"],
  ]);

  // ============ 8. Edge ============

  writeHeading("8. Edge Object", 2);
  writeParagraph("An edge connects two nodes. Source and target must reference existing node ids. Edges support labels, custom geometry, and animation.");
  writeFieldTable([
    ["id", "string", "Unique edge identifier"],
    ["source", "string", "Source node id"],
    ["target", "string", "Target node id"],
    ["sourceHandle?", "string|null", "Optional: 'left' or 'right' handle"],
    ["targetHandle?", "string|null", "Optional handle on target"],
    ["type?", "EdgeStyle", "Line geometry type (see section 9)"],
    ["animated?", "boolean", "Animated flow dots along the line"],
    ["data", "EdgeData", "Label & style (see section 10)"],
  ]);

  // ============ 9. EdgeStyle Enums ============

  writeHeading("9. EdgeStyle Options (Enums)", 2);
  writeParagraph("Three enum types control edge appearance: line geometry, dash pattern, and arrowheads.");
  writeEnumList("type — line geometry", edgeTypeOptions);
  writeEnumList("strokeStyle — dash pattern", strokeStyleOptions);
  writeEnumList("sourceArrow / targetArrow — arrowheads", arrowOptions);

  // ============ 10. EdgeStyleProps ============

  writeHeading("10. EdgeStyleProps Object", 2);
  writeParagraph("EdgeStyleProps lives at edge.data.style. It fully describes the visual appearance of a flow line.");
  writeFieldTable([
    ["stroke", "string (hex)", "Line color"],
    ["strokeWidth", "number", "Line thickness, 0.5 to 8"],
    ["strokeStyle", "EdgeStrokeStyle", "solid | dashed | dotted"],
    ["type", "EdgeStyle", "Geometry type (see section 9)"],
    ["animated", "boolean", "Animated flow dots"],
    ["sourceArrow", "ArrowType", "Arrow at source end"],
    ["targetArrow", "ArrowType", "Arrow at target end"],
    ["label?", "string", "Text label shown on the line"],
    ["labelBgColor?", "string (hex)", "Label background color"],
    ["labelTextColor?", "string (hex)", "Label text color"],
    ["labelFontSize?", "number", "Label font size in px"],
  ]);

  // ============ 11. Enterprise Node Types ============

  writeHeading("11. Enterprise Node Types", 2);
  writeParagraph("FlowForge supports six node types beyond the standard diagramBlock. Each is designed for governance, escalation, RCA/CAPA, and leadership-review diagrams. All node types share a common shape: id, type, position, and data — but the data object differs per type.");

  writeHeading("12. Group / Container", 2);
  writeParagraph("Groups visually contain related nodes. Set children to an array of node IDs. Groups support collapse, dashed borders, and a title/subtitle header. Use cases: safety phases, governance sections, business process grouping, department ownership.");
  writeFieldTable([
    ["title", "string", "Group heading (shown in header)"],
    ["subtitle?", "string", "Optional secondary description"],
    ["children", "string[]", "Array of node IDs that belong to the group"],
    ["width", "number", "Group width in px"],
    ["height", "number", "Group height in px (when expanded)"],
    ["fill", "string (hex)", "Background color"],
    ["stroke", "string (hex)", "Border color"],
    ["strokeStyle", "EdgeStrokeStyle", "solid | dashed | dotted"],
    ["textColor", "string (hex)", "Title text color"],
    ["collapsible", "boolean", "Show collapse toggle"],
    ["collapsed", "boolean", "Initial collapsed state"],
  ]);

  writeHeading("13. Annotation", 2);
  writeParagraph("Free-floating labels not connected to nodes. Use cases: section labels, explanatory notes, governance descriptions, escalation instructions. Supports multi-line text, alignment, and italic style.");
  writeFieldTable([
    ["text", "string", "Annotation text (supports \\n for line breaks)"],
    ["fontSize", "number", "Font size in px"],
    ["fontWeight", "number", "Font weight 300-800"],
    ["color", "string (hex)", "Text color"],
    ["align", "string", "left | center | right"],
    ["italic", "boolean", "Render text in italic"],
    ["width", "number", "Annotation width in px"],
  ]);

  writeHeading("14. Brace / Bracket", 2);
  writeParagraph("Vertical or horizontal curly braces for visually grouping escalation phases, governance layers, responsibility mapping, or workflow segments. Renders as an SVG path with optional rotated label.");
  writeFieldTable([
    ["orientation", "string", "vertical | horizontal"],
    ["length", "number", "Span of the brace in px"],
    ["label?", "string", "Optional label shown alongside the brace"],
    ["stroke", "string (hex)", "Brace color"],
    ["strokeWidth", "number", "Brace thickness"],
    ["labelColor", "string (hex)", "Label text color"],
    ["fontSize", "number", "Label font size in px"],
  ]);

  writeHeading("15. Swimlane", 2);
  writeParagraph("Department-based lanes for RACI matrices, escalation matrices, and governance frameworks. Use assignments to map node IDs to lane IDs. Lanes are rendered as labeled rows with configurable fill colors.");
  writeFieldTable([
    ["title?", "string", "Optional swimlane title shown in header"],
    ["lanes", "SwimlaneLane[]", "Array of lane definitions (id, label, fill, textColor)"],
    ["width", "number", "Total swimlane width in px"],
    ["laneHeight", "number", "Height of each lane in px"],
    ["fill", "string (hex)", "Background color"],
    ["stroke", "string (hex)", "Border color"],
    ["textColor", "string (hex)", "Title text color"],
    ["assignments?", "object", "Map of nodeId -> laneId"],
  ]);

  writeHeading("16. Timeline", 2);
  writeParagraph("Process timelines for escalation, RCA, and CAPA milestones. Supports vertical or horizontal orientation with numbered, colored milestones. Use cases: escalation timelines, RCA timelines, CAPA timelines, audit timelines.");
  writeFieldTable([
    ["title?", "string", "Optional timeline title"],
    ["milestones", "TimelineMilestone[]", "Array of milestones (id, label, subtitle, fill, textColor)"],
    ["orientation", "string", "vertical | horizontal"],
    ["width", "number", "Timeline width in px"],
    ["stroke", "string (hex)", "Connector line color"],
    ["milestoneFill", "string (hex)", "Default milestone fill (overridden per-milestone)"],
    ["textColor", "string (hex)", "Default label text color"],
  ]);

  writeHeading("17. SLA Badges, Criteria & Ownership (on blocks)", 2);
  writeParagraph("Three optional fields can be added to any diagramBlock to enrich it for governance use. Badges show response-time SLAs. Criteria document decision branches. Ownership records who owns, approves, and reviews the step.");
  writeFieldTable([
    ["badge?", "object", "SLA/KPI pill: { text, fill, textColor, position }"],
    ["badge.text", "string", "Badge label, e.g. '15 Min'"],
    ["badge.fill", "string (hex)", "Badge background color"],
    ["badge.position", "string", "top-right | top-left | bottom-right | bottom-left"],
    ["criteria?", "string[]", "List of decision branches (e.g. Fire, Theft)"],
    ["ownership?", "object", "{ owner, approver, reviewer, department }"],
  ]);

  writeHeading("18. Orthogonal Edge Routing", 2);
  writeParagraph("Set type: 'orthogonal' on any edge for clean step-style connectors suitable for executive presentations. This produces right-angle paths that avoid overlap and look professional in leadership decks. Combined with animated: true, edges show flow direction visually.");
  writeCode(`{
  "id": "e1",
  "source": "report",
  "target": "site_team",
  "type": "orthogonal",
  "data": {
    "style": {
      "stroke": "#475569",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "type": "orthogonal",
      "animated": true,
      "sourceArrow": "none",
      "targetArrow": "arrowclosed",
      "label": "Critical"
    }
  }
}`);

  // ============ 19. Full Example ============

  writeHeading("19. Full Reference Example", 2);
  writeParagraph("A complete diagram with one node and one edge, showing every property in context.");
  writeCode(FULL_EXAMPLE);

  // ============ 20. Minimal Example ============

  writeHeading("20. Minimal Example", 2);
  writeParagraph("The smallest valid diagram — two blocks and one connector.");
  writeCode(MINIMAL_EXAMPLE);

  // ============ 21. Tips ============

  writeHeading("21. Tips & Validation Rules", 2);
  writeBullet("Node id must be unique within a project. Duplicate ids will cause edges to attach unpredictably.");
  writeBullet("Edge source and target must reference existing node ids. The Render view rejects JSON with broken references.");
  writeBullet("All color values are hex strings, e.g. #dcfce7. RGB and named colors are not supported.");
  writeBullet("Use animated: true on edges to show flow direction visually in the Builder and SVG exports.");
  writeBullet("Set showGrid: false on the canvas for cleaner image exports (PNG/SVG).");
  writeBullet("Position is the top-left corner of a block in canvas coordinates. The canvas origin (0,0) is top-left.");
  writeBullet("Minimum block size is 20x20px. Width and height are clamped internally if smaller.");
  writeBullet("Font family accepts any CSS font stack. Web fonts available in the browser will render in SVG exports.");

  // ============ Footer page numbers ============

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FlowForge · JSON Schema Docs · Page ${i} of ${pageCount}`,
      PAGE_MARGIN,
      PAGE_HEIGHT - 24
    );
  }

  return doc.output("blob");
}

const FULL_EXAMPLE = `{
  "name": "My Flowchart",
  "version": "1.0.0",
  "canvas": {
    "width": 1600,
    "height": 1000,
    "background": "#fafafa",
    "showGrid": true,
    "gridColor": "#e2e8f0",
    "gridSize": 20,
    "snapToGrid": false
  },
  "nodes": [
    {
      "id": "start",
      "type": "diagramBlock",
      "position": { "x": 80, "y": 80 },
      "data": {
        "label": "Start",
        "subtitle": "Optional helper text",
        "icon": "rocket",
        "shape": "terminator",
        "width": 160,
        "height": 60,
        "style": {
          "fill": "#dcfce7",
          "stroke": "#16a34a",
          "strokeWidth": 2,
          "textColor": "#14532d",
          "fontSize": 14,
          "fontWeight": 500,
          "fontFamily": "Inter, system-ui, sans-serif",
          "opacity": 1,
          "borderRadius": 8,
          "shadow": true
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start",
      "target": "end",
      "type": "smoothstep",
      "animated": false,
      "data": {
        "label": "yes",
        "style": {
          "stroke": "#475569",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "type": "smoothstep",
          "animated": false,
          "sourceArrow": "none",
          "targetArrow": "arrowclosed",
          "labelBgColor": "#ffffff",
          "labelTextColor": "#0f172a",
          "labelFontSize": 12
        }
      }
    }
  ]
}`;

const MINIMAL_EXAMPLE = `{
  "name": "Hello Flow",
  "version": "1.0.0",
  "canvas": {
    "width": 800,
    "height": 600,
    "background": "#ffffff",
    "showGrid": false,
    "gridColor": "#e2e8f0",
    "gridSize": 20,
    "snapToGrid": false
  },
  "nodes": [
    {
      "id": "a",
      "type": "diagramBlock",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Hello",
        "shape": "circle",
        "width": 100,
        "height": 100,
        "style": {
          "fill": "#fde68a",
          "stroke": "#d97706",
          "strokeWidth": 2,
          "textColor": "#78350f",
          "fontSize": 14,
          "fontWeight": 600,
          "fontFamily": "sans-serif",
          "opacity": 1
        }
      }
    },
    {
      "id": "b",
      "type": "diagramBlock",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "World",
        "shape": "rectangle",
        "width": 140,
        "height": 80,
        "style": {
          "fill": "#bfdbfe",
          "stroke": "#2563eb",
          "strokeWidth": 2,
          "textColor": "#1e3a8a",
          "fontSize": 14,
          "fontWeight": 500,
          "fontFamily": "sans-serif",
          "opacity": 1
        }
      }
    }
  ],
  "edges": [
    {
      "id": "ab",
      "source": "a",
      "target": "b",
      "type": "smoothstep",
      "data": {
        "style": {
          "stroke": "#475569",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "type": "smoothstep",
          "animated": true,
          "sourceArrow": "none",
          "targetArrow": "arrowclosed"
        }
      }
    }
  ]
}`;
