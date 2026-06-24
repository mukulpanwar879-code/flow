import {
  DiagramProject,
  DiagramNode,
  DiagramEdge,
  DiagramCanvas,
  BlockData,
  BlockStyle,
  BlockShape,
  EdgeStyleProps,
  EdgeStyle,
  EdgeStrokeStyle,
  ArrowType,
  defaultBlockStyle,
  defaultEdgeStyle,
  defaultCanvas,
} from "@/types/diagram";

const VALID_SHAPES: BlockShape[] = [
  "rectangle", "rounded", "circle", "ellipse", "diamond",
  "parallelogram", "hexagon", "triangle", "cylinder", "document", "terminator",
];

const VALID_EDGE_TYPES: EdgeStyle[] = ["default", "straight", "step", "smoothstep", "bezier"];
const VALID_STROKE_STYLES: EdgeStrokeStyle[] = ["solid", "dashed", "dotted"];
const VALID_ARROWS: ArrowType[] = ["none", "arrow", "arrowclosed"];

const VALID_SHAPES_SET = new Set(VALID_SHAPES);
const VALID_EDGE_TYPES_SET = new Set(VALID_EDGE_TYPES);
const VALID_STROKE_STYLES_SET = new Set(VALID_STROKE_STYLES);
const VALID_ARROWS_SET = new Set(VALID_ARROWS);

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function asString(v: unknown, fallback: string): string {
  return isString(v) ? v : fallback;
}
function asNumber(v: unknown, fallback: number): number {
  return isNumber(v) ? v : fallback;
}
function asBool(v: unknown, fallback: boolean): boolean {
  return isBoolean(v) ? v : fallback;
}
function asColor(v: unknown, fallback: string): string {
  if (isString(v) && /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-z]+)$/i.test(v)) {
    return v;
  }
  return fallback;
}

// Returns true if the given object is structurally a valid diagram project,
// with at least a `nodes` array and an `edges` array. Used for upload validation.
export function looksLikeProject(input: unknown): input is DiagramProject {
  if (!input || typeof input !== "object") return false;
  const p = input as Record<string, unknown>;
  return Array.isArray(p.nodes) && Array.isArray(p.edges);
}

// Validates a parsed object as a DiagramProject, returning a list of
// human-readable issues. Only fatal structural problems are reported —
// missing optional fields are silently filled by normalizeProject().
// An empty array means the project is renderable.
export function validateProject(input: unknown): string[] {
  const issues: string[] = [];
  if (!input || typeof input !== "object") {
    return ["Root must be a JSON object."];
  }
  const p = input as Record<string, unknown>;
  if (!Array.isArray(p.nodes)) {
    issues.push("`nodes` must be an array (missing or wrong type).");
    return issues; // can't continue without nodes
  }
  if (!Array.isArray(p.edges)) {
    issues.push("`edges` must be an array (missing or wrong type).");
    return issues;
  }

  // Only flag fatal issues: nodes that aren't objects (can't extract id)
  p.nodes.forEach((n, i) => {
    if (!n || typeof n !== "object") {
      issues.push(`Node at index ${i} is not an object.`);
    }
  });
  p.edges.forEach((e, i) => {
    if (!e || typeof e !== "object") {
      issues.push(`Edge at index ${i} is not an object.`);
    }
  });

  return issues;
}

// Normalizes a parsed object into a fully-formed DiagramProject, filling in
// any missing fields with sensible defaults. This makes the renderer crash-proof:
// no matter what JSON the user pastes, as long as it has nodes[] and edges[]
// arrays, we can render something useful.
export function normalizeProject(input: unknown): DiagramProject {
  const p = (input ?? {}) as Record<string, unknown>;

  const canvas = normalizeCanvas(p.canvas);
  const rawNodes = Array.isArray(p.nodes) ? p.nodes : [];
  const rawEdges = Array.isArray(p.edges) ? p.edges : [];

  const nodes: DiagramNode[] = rawNodes
    .filter((n) => n && typeof n === "object")
    .map((n, i) => normalizeNode(n as Record<string, unknown>, i));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: DiagramEdge[] = rawEdges
    .filter((e) => e && typeof e === "object")
    .map((e, i) => normalizeEdge(e as Record<string, unknown>, i, nodeIds));

  return {
    name: asString(p.name, "Untitled Diagram"),
    version: asString(p.version, "1.0.0"),
    canvas,
    nodes,
    edges,
  };
}

function normalizeCanvas(input: unknown): DiagramCanvas {
  const c = (input ?? {}) as Record<string, unknown>;
  return {
    width: Math.max(100, asNumber(c.width, defaultCanvas.width)),
    height: Math.max(100, asNumber(c.height, defaultCanvas.height)),
    background: asColor(c.background, defaultCanvas.background),
    showGrid: asBool(c.showGrid, defaultCanvas.showGrid),
    gridColor: asColor(c.gridColor, defaultCanvas.gridColor),
    gridSize: Math.max(5, asNumber(c.gridSize, defaultCanvas.gridSize)),
    snapToGrid: asBool(c.snapToGrid, defaultCanvas.snapToGrid),
  };
}

function normalizeNode(input: Record<string, unknown>, index: number): DiagramNode {
  const id = isString(input.id) && input.id ? input.id : `node_${index}`;
  const rawPosition = (input.position ?? { x: 100, y: 100 }) as Record<string, unknown>;
  const position = {
    x: asNumber(rawPosition?.x, 100 + index * 20),
    y: asNumber(rawPosition?.y, 100 + index * 20),
  };
  const data = normalizeBlockData(input.data ?? {}, index);
  return {
    id,
    type: "diagramBlock",
    position,
    data,
  };
}

function normalizeBlockData(input: unknown, index: number): BlockData {
  const d = (input ?? {}) as Record<string, unknown>;
  const rawShape = isString(d.shape) ? d.shape : "rectangle";
  const shape = (VALID_SHAPES_SET.has(rawShape as BlockShape) ? rawShape : "rectangle") as BlockShape;

  return {
    label: asString(d.label, `Block ${index + 1}`),
    subtitle: isString(d.subtitle) ? d.subtitle : undefined,
    icon: isString(d.icon) ? d.icon : undefined,
    shape,
    width: Math.max(20, asNumber(d.width, 180)),
    height: Math.max(20, asNumber(d.height, 80)),
    style: normalizeBlockStyle(d.style),
  };
}

function normalizeBlockStyle(input: unknown): BlockStyle {
  const s = (input ?? {}) as Record<string, unknown>;
  return {
    fill: asColor(s.fill, defaultBlockStyle.fill),
    stroke: asColor(s.stroke, defaultBlockStyle.stroke),
    strokeWidth: Math.max(0, asNumber(s.strokeWidth, defaultBlockStyle.strokeWidth)),
    textColor: asColor(s.textColor, defaultBlockStyle.textColor),
    fontSize: Math.max(6, asNumber(s.fontSize, defaultBlockStyle.fontSize)),
    fontWeight: Math.max(100, Math.min(900, asNumber(s.fontWeight, defaultBlockStyle.fontWeight))),
    fontFamily: asString(s.fontFamily, defaultBlockStyle.fontFamily),
    opacity: Math.max(0, Math.min(1, asNumber(s.opacity, defaultBlockStyle.opacity))),
    borderRadius: isNumber(s.borderRadius) ? s.borderRadius : defaultBlockStyle.borderRadius,
    shadow: asBool(s.shadow, defaultBlockStyle.shadow),
  };
}

function normalizeEdge(input: Record<string, unknown>, index: number, nodeIds: Set<string>): DiagramEdge {
  const id = isString(input.id) && input.id ? input.id : `edge_${index}`;
  const source = isString(input.source) ? input.source : "";
  const target = isString(input.target) ? input.target : "";
  const rawData = (input.data ?? {}) as Record<string, unknown>;
  const rawStyle = (rawData.style ?? input) as Record<string, unknown>; // some users put style at top level

  // Skip edges with broken refs but keep the edge (rendered as a no-op by the SVG layer)
  const safeSource = nodeIds.has(source) ? source : (nodeIds.size > 0 ? Array.from(nodeIds)[0] : "");
  const safeTarget = nodeIds.has(target) ? target : (nodeIds.size > 0 ? Array.from(nodeIds)[0] : "");

  const style = normalizeEdgeStyle(rawStyle);
  const edgeType: EdgeStyle = VALID_EDGE_TYPES_SET.has(input.type as EdgeStyle)
    ? (input.type as EdgeStyle)
    : style.type;

  return {
    id,
    source: safeSource,
    target: safeTarget,
    sourceHandle: isString(input.sourceHandle) ? input.sourceHandle : null,
    targetHandle: isString(input.targetHandle) ? input.targetHandle : null,
    type: edgeType,
    animated: asBool(input.animated, style.animated),
    data: {
      label: isString(rawData.label) ? rawData.label : isString(rawStyle.label) ? rawStyle.label : undefined,
      style,
    },
  };
}

function normalizeEdgeStyle(input: unknown): EdgeStyleProps {
  const s = (input ?? {}) as Record<string, unknown>;
  const rawType = isString(s.type) ? s.type : defaultEdgeStyle.type;
  const rawStroke = isString(s.strokeStyle) ? s.strokeStyle : defaultEdgeStyle.strokeStyle;
  const rawSourceArrow = isString(s.sourceArrow) ? s.sourceArrow : defaultEdgeStyle.sourceArrow;
  const rawTargetArrow = isString(s.targetArrow) ? s.targetArrow : defaultEdgeStyle.targetArrow;

  return {
    stroke: asColor(s.stroke, defaultEdgeStyle.stroke),
    strokeWidth: Math.max(0.5, asNumber(s.strokeWidth, defaultEdgeStyle.strokeWidth)),
    strokeStyle: (VALID_STROKE_STYLES_SET.has(rawStroke as EdgeStrokeStyle) ? rawStroke : "solid") as EdgeStrokeStyle,
    type: (VALID_EDGE_TYPES_SET.has(rawType as EdgeStyle) ? rawType : "smoothstep") as EdgeStyle,
    animated: asBool(s.animated, defaultEdgeStyle.animated),
    sourceArrow: (VALID_ARROWS_SET.has(rawSourceArrow as ArrowType) ? rawSourceArrow : "none") as ArrowType,
    targetArrow: (VALID_ARROWS_SET.has(rawTargetArrow as ArrowType) ? rawTargetArrow : "arrowclosed") as ArrowType,
    label: isString(s.label) ? s.label : defaultEdgeStyle.label,
    labelBgColor: asColor(s.labelBgColor, defaultEdgeStyle.labelBgColor ?? "#ffffff"),
    labelTextColor: asColor(s.labelTextColor, defaultEdgeStyle.labelTextColor ?? "#0f172a"),
    labelFontSize: Math.max(6, asNumber(s.labelFontSize, defaultEdgeStyle.labelFontSize ?? 12)),
  };
}
