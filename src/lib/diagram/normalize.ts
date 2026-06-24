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
  BraceOrientation,
  SwimlaneLane,
  TimelineMilestone,
  defaultBlockStyle,
  defaultEdgeStyle,
  defaultCanvas,
} from "@/types/diagram";

const VALID_SHAPES: BlockShape[] = [
  "rectangle", "rounded", "circle", "ellipse", "diamond",
  "parallelogram", "hexagon", "triangle", "cylinder", "document", "terminator",
];

const VALID_EDGE_TYPES: EdgeStyle[] = ["default", "straight", "step", "smoothstep", "bezier", "orthogonal"];
const VALID_STROKE_STYLES: EdgeStrokeStyle[] = ["solid", "dashed", "dotted"];
const VALID_ARROWS: ArrowType[] = ["none", "arrow", "arrowclosed"];

const VALID_SHAPES_SET = new Set(VALID_SHAPES);
const VALID_EDGE_TYPES_SET = new Set(VALID_EDGE_TYPES);
const VALID_STROKE_STYLES_SET = new Set(VALID_STROKE_STYLES);
const VALID_ARROWS_SET = new Set(VALID_ARROWS);

const VALID_NODE_TYPES = new Set(["diagramBlock", "group", "annotation", "brace", "swimlane", "timeline"]);

function isString(v: unknown): v is string { return typeof v === "string"; }
function isNumber(v: unknown): v is number { return typeof v === "number" && Number.isFinite(v); }
function isBoolean(v: unknown): v is boolean { return typeof v === "boolean"; }
function asString(v: unknown, fallback: string): string { return isString(v) ? v : fallback; }
function asNumber(v: unknown, fallback: number): number { return isNumber(v) ? v : fallback; }
function asBool(v: unknown, fallback: boolean): boolean { return isBoolean(v) ? v : fallback; }
function asColor(v: unknown, fallback: string): string {
  if (isString(v) && /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-z]+)$/i.test(v)) return v;
  return fallback;
}
function asArray(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }
function asObject(v: unknown): Record<string, unknown> { return (v && typeof v === "object") ? v as Record<string, unknown> : {}; }

export function looksLikeProject(input: unknown): input is DiagramProject {
  if (!input || typeof input !== "object") return false;
  const p = input as Record<string, unknown>;
  return Array.isArray(p.nodes) && Array.isArray(p.edges);
}

export function validateProject(input: unknown): string[] {
  const issues: string[] = [];
  if (!input || typeof input !== "object") return ["Root must be a JSON object."];
  const p = input as Record<string, unknown>;
  if (!Array.isArray(p.nodes)) return ["`nodes` must be an array (missing or wrong type)."];
  if (!Array.isArray(p.edges)) return ["`edges` must be an array (missing or wrong type)."];

  p.nodes.forEach((n, i) => {
    if (!n || typeof n !== "object") issues.push(`Node at index ${i} is not an object.`);
  });
  p.edges.forEach((e, i) => {
    if (!e || typeof e !== "object") issues.push(`Edge at index ${i} is not an object.`);
  });
  return issues;
}

// Master normalizer — handles every node type.
export function normalizeProject(input: unknown): DiagramProject {
  const p = (input ?? {}) as Record<string, unknown>;
  const canvas = normalizeCanvas(p.canvas);
  const rawNodes = asArray(p.nodes);
  const rawEdges = asArray(p.edges);

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
  const c = asObject(input);
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
  const rawPosition = asObject(input.position);
  const position = {
    x: asNumber(rawPosition.x, 100 + index * 20),
    y: asNumber(rawPosition.y, 100 + index * 20),
  };
  const type = isString(input.type) && VALID_NODE_TYPES.has(input.type as any) ? input.type : "diagramBlock";

  switch (type) {
    case "group":
      return {
        id, type: "group", position,
        data: normalizeGroupData(input.data),
      };
    case "annotation":
      return {
        id, type: "annotation", position,
        data: normalizeAnnotationData(input.data),
      };
    case "brace":
      return {
        id, type: "brace", position,
        data: normalizeBraceData(input.data),
      };
    case "swimlane":
      return {
        id, type: "swimlane", position,
        data: normalizeSwimlaneData(input.data),
      };
    case "timeline":
      return {
        id, type: "timeline", position,
        data: normalizeTimelineData(input.data),
      };
    case "diagramBlock":
    default:
      return {
        id, type: "diagramBlock", position,
        data: normalizeBlockData(input.data, index),
      };
  }
}

function normalizeBlockData(input: unknown, index: number): BlockData {
  const d = asObject(input);
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
    badge: d.badge ? normalizeBadge(d.badge) : undefined,
    ownership: d.ownership ? normalizeOwnership(d.ownership) : undefined,
    criteria: Array.isArray(d.criteria) ? d.criteria.filter(isString) : undefined,
    metadata: d.metadata && typeof d.metadata === "object" ? d.metadata as Record<string, string> : undefined,
  };
}

function normalizeBlockStyle(input: unknown): BlockStyle {
  const s = asObject(input);
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

function normalizeBadge(input: unknown) {
  const b = asObject(input);
  return {
    text: asString(b.text, ""),
    fill: asColor(b.fill, "#dc2626"),
    textColor: asColor(b.textColor, "#ffffff"),
    position: (["top-right", "top-left", "bottom-right", "bottom-left"].includes(b.position as string) ? b.position : "top-right") as "top-right" | "top-left" | "bottom-right" | "bottom-left",
  };
}

function normalizeOwnership(input: unknown) {
  const o = asObject(input);
  return {
    owner: isString(o.owner) ? o.owner : undefined,
    approver: isString(o.approver) ? o.approver : undefined,
    reviewer: isString(o.reviewer) ? o.reviewer : undefined,
    department: isString(o.department) ? o.department : undefined,
  };
}

function normalizeGroupData(input: unknown) {
  const d = asObject(input);
  return {
    title: asString(d.title, "Group"),
    subtitle: isString(d.subtitle) ? d.subtitle : undefined,
    children: Array.isArray(d.children) ? d.children.filter(isString) : [],
    width: Math.max(120, asNumber(d.width, 360)),
    height: Math.max(80, asNumber(d.height, 220)),
    fill: asColor(d.fill, "#fefce8"),
    stroke: asColor(d.stroke, "#ca8a04"),
    strokeStyle: (VALID_STROKE_STYLES_SET.has(d.strokeStyle as EdgeStrokeStyle) ? d.strokeStyle : "dashed") as EdgeStrokeStyle,
    textColor: asColor(d.textColor, "#713f12"),
    collapsible: asBool(d.collapsible, true),
    collapsed: asBool(d.collapsed, false),
  };
}

function normalizeAnnotationData(input: unknown) {
  const d = asObject(input);
  return {
    text: asString(d.text, "Annotation"),
    fontSize: Math.max(6, asNumber(d.fontSize, 13)),
    fontWeight: Math.max(100, Math.min(900, asNumber(d.fontWeight, 600))),
    color: asColor(d.color, "#475569"),
    align: (["left", "center", "right"].includes(d.align as string) ? d.align : "left") as "left" | "center" | "right",
    italic: asBool(d.italic, false),
    width: Math.max(60, asNumber(d.width, 240)),
  };
}

function normalizeBraceData(input: unknown) {
  const d = asObject(input);
  return {
    orientation: (d.orientation === "horizontal" ? "horizontal" : "vertical") as BraceOrientation,
    length: Math.max(20, asNumber(d.length, 200)),
    label: isString(d.label) ? d.label : undefined,
    stroke: asColor(d.stroke, "#475569"),
    strokeWidth: Math.max(0.5, asNumber(d.strokeWidth, 2)),
    labelColor: asColor(d.labelColor, "#0f172a"),
    fontSize: Math.max(6, asNumber(d.fontSize, 12)),
  };
}

function normalizeSwimlaneData(input: unknown) {
  const d = asObject(input);
  const lanes = Array.isArray(d.lanes)
    ? d.lanes.filter((l) => l && typeof l === "object").map((l, i) => normalizeLane(l, i))
    : [];
  return {
    title: isString(d.title) ? d.title : undefined,
    lanes: lanes.length > 0 ? lanes : [{ id: "lane1", label: "Lane 1", fill: "#f1f5f9", textColor: "#0f172a" }],
    width: Math.max(200, asNumber(d.width, 600)),
    laneHeight: Math.max(60, asNumber(d.laneHeight, 160)),
    fill: asColor(d.fill, "#ffffff"),
    stroke: asColor(d.stroke, "#cbd5e1"),
    textColor: asColor(d.textColor, "#0f172a"),
    assignments: d.assignments && typeof d.assignments === "object" ? d.assignments as Record<string, string> : {},
  };
}

function normalizeLane(input: unknown, index: number): SwimlaneLane {
  const l = asObject(input);
  return {
    id: isString(l.id) ? l.id : `lane_${index}`,
    label: isString(l.label) ? l.label : `Lane ${index + 1}`,
    fill: asColor(l.fill, "#f1f5f9"),
    textColor: asColor(l.textColor, "#0f172a"),
  };
}

function normalizeTimelineData(input: unknown) {
  const d = asObject(input);
  const milestones = Array.isArray(d.milestones)
    ? d.milestones.filter((m) => m && typeof m === "object").map((m, i) => normalizeMilestone(m, i))
    : [];
  return {
    title: isString(d.title) ? d.title : undefined,
    milestones: milestones.length > 0 ? milestones : [{ id: "m1", label: "Start", fill: "#16a34a", textColor: "#ffffff" }],
    orientation: (d.orientation === "horizontal" ? "horizontal" : "vertical") as "vertical" | "horizontal",
    width: Math.max(120, asNumber(d.width, 160)),
    stroke: asColor(d.stroke, "#cbd5e1"),
    milestoneFill: asColor(d.milestoneFill, "#ffffff"),
    textColor: asColor(d.textColor, "#0f172a"),
  };
}

function normalizeMilestone(input: unknown, index: number): TimelineMilestone {
  const m = asObject(input);
  return {
    id: isString(m.id) ? m.id : `m_${index}`,
    label: asString(m.label, `Milestone ${index + 1}`),
    subtitle: isString(m.subtitle) ? m.subtitle : undefined,
    fill: asColor(m.fill, "#475569"),
    textColor: asColor(m.textColor, "#ffffff"),
  };
}

function normalizeEdge(input: Record<string, unknown>, index: number, nodeIds: Set<string>): DiagramEdge {
  const id = isString(input.id) && input.id ? input.id : `edge_${index}`;
  const source = isString(input.source) ? input.source : "";
  const target = isString(input.target) ? input.target : "";
  const rawData = asObject(input.data);
  const rawStyle = asObject(rawData.style ?? input);

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
  const s = asObject(input);
  const rawType = isString(s.type) ? s.type : "orthogonal"; // default to orthogonal for enterprise
  const rawStroke = isString(s.strokeStyle) ? s.strokeStyle : defaultEdgeStyle.strokeStyle;
  const rawSourceArrow = isString(s.sourceArrow) ? s.sourceArrow : defaultEdgeStyle.sourceArrow;
  const rawTargetArrow = isString(s.targetArrow) ? s.targetArrow : defaultEdgeStyle.targetArrow;

  return {
    stroke: asColor(s.stroke, defaultEdgeStyle.stroke),
    strokeWidth: Math.max(0.5, asNumber(s.strokeWidth, defaultEdgeStyle.strokeWidth)),
    strokeStyle: (VALID_STROKE_STYLES_SET.has(rawStroke as EdgeStrokeStyle) ? rawStroke : "solid") as EdgeStrokeStyle,
    type: (VALID_EDGE_TYPES_SET.has(rawType as EdgeStyle) ? rawType : "orthogonal") as EdgeStyle,
    animated: asBool(s.animated, defaultEdgeStyle.animated),
    sourceArrow: (VALID_ARROWS_SET.has(rawSourceArrow as ArrowType) ? rawSourceArrow : "none") as ArrowType,
    targetArrow: (VALID_ARROWS_SET.has(rawTargetArrow as ArrowType) ? rawTargetArrow : "arrowclosed") as ArrowType,
    label: isString(s.label) ? s.label : "",
    labelBgColor: asColor(s.labelBgColor, "#ffffff"),
    labelTextColor: asColor(s.labelTextColor, "#0f172a"),
    labelFontSize: Math.max(6, asNumber(s.labelFontSize, 12)),
  };
}
