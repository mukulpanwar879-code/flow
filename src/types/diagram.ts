// Core type definitions for the modular diagram builder.
// Every block, edge, group, annotation, brace, swimlane, etc. is fully described
// by a plain JSON object so the entire canvas can be serialized & re-rendered.

// ============ Basic shapes (existing) ============

export type BlockShape =
  | "rectangle"
  | "rounded"
  | "circle"
  | "ellipse"
  | "diamond"
  | "parallelogram"
  | "hexagon"
  | "triangle"
  | "cylinder"
  | "document"
  | "terminator";

export type EdgeStyle = "default" | "straight" | "step" | "smoothstep" | "bezier" | "orthogonal";
export type EdgeStrokeStyle = "solid" | "dashed" | "dotted";
export type ArrowType = "none" | "arrow" | "arrowclosed";

export interface BlockStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  textColor: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  opacity: number;
  borderRadius?: number;
  shadow?: boolean;
}

export interface BadgeData {
  text: string;
  fill?: string;
  textColor?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export interface OwnershipData {
  owner?: string;
  approver?: string;
  reviewer?: string;
  department?: string;
}

export interface BlockData {
  label: string;
  subtitle?: string;
  icon?: string;
  shape: BlockShape;
  style: BlockStyle;
  width: number;
  height: number;
  badge?: BadgeData;
  ownership?: OwnershipData;
  // Decision-node criteria (for shape: "diamond" or any block acting as a decision)
  criteria?: string[];
  // Free-form metadata for audits / governance
  metadata?: Record<string, string>;
}

// ============ Groups / Containers ============

export interface GroupNode {
  id: string;
  type: "group";
  position: { x: number; y: number };
  data: {
    title: string;
    subtitle?: string;
    children: string[]; // node ids that belong to this group
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeStyle?: EdgeStrokeStyle;
    textColor?: string;
    collapsible?: boolean;
    collapsed?: boolean;
  };
}

// ============ Annotations ============

export interface AnnotationNode {
  id: string;
  type: "annotation";
  position: { x: number; y: number };
  data: {
    text: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    align?: "left" | "center" | "right";
    italic?: boolean;
    width?: number;
  };
}

// ============ Braces ============

export type BraceOrientation = "vertical" | "horizontal";

export interface BraceNode {
  id: string;
  type: "brace";
  position: { x: number; y: number };
  data: {
    orientation: BraceOrientation;
    length: number; // px span of the brace
    label?: string;
    stroke?: string;
    strokeWidth?: number;
    labelColor?: string;
    fontSize?: number;
  };
}

// ============ Swimlanes ============

export interface SwimlaneLane {
  id: string;
  label: string;
  fill?: string;
  textColor?: string;
}

export interface SwimlaneNode {
  id: string;
  type: "swimlane";
  position: { x: number; y: number };
  data: {
    title?: string;
    lanes: SwimlaneLane[];
    width: number;
    laneHeight: number;
    fill?: string;
    stroke?: string;
    textColor?: string;
    // Map of nodeId -> laneId (which lane each node belongs to)
    assignments?: Record<string, string>;
  };
}

// ============ Timeline ============

export interface TimelineMilestone {
  id: string;
  label: string;
  subtitle?: string;
  fill?: string;
  textColor?: string;
}

export interface TimelineNode {
  id: string;
  type: "timeline";
  position: { x: number; y: number };
  data: {
    title?: string;
    milestones: TimelineMilestone[];
    orientation?: "vertical" | "horizontal";
    width?: number;
    stroke?: string;
    fillColor?: string;
    milestoneFill?: string;
    textColor?: string;
  };
}

// ============ Unified node union ============

export type DiagramNode =
  | (BaseNode & { type: "diagramBlock" })
  | GroupNode
  | AnnotationNode
  | BraceNode
  | SwimlaneNode
  | TimelineNode;

interface BaseNode {
  id: string;
  position: { x: number; y: number };
  data: BlockData;
}

// ============ Edges ============

export interface EdgeStyleProps {
  stroke: string;
  strokeWidth: number;
  strokeStyle: EdgeStrokeStyle;
  type: EdgeStyle;
  animated: boolean;
  sourceArrow: ArrowType;
  targetArrow: ArrowType;
  label?: string;
  labelBgColor?: string;
  labelTextColor?: string;
  labelFontSize?: number;
  routing?: "default" | "orthogonal";
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: EdgeStyle;
  animated?: boolean;
  data: {
    label?: string;
    style: EdgeStyleProps;
  };
}

export interface DiagramCanvas {
  width: number;
  height: number;
  background: string;
  showGrid: boolean;
  gridColor: string;
  gridSize: number;
  snapToGrid: boolean;
}

export interface DiagramProject {
  name: string;
  version: string;
  canvas: DiagramCanvas;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// ============ Defaults ============

export const defaultBlockStyle: BlockStyle = {
  fill: "#ffffff",
  stroke: "#0f172a",
  strokeWidth: 2,
  textColor: "#0f172a",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "Inter, system-ui, sans-serif",
  opacity: 1,
  borderRadius: 8,
  shadow: true,
};

export const defaultEdgeStyle: EdgeStyleProps = {
  stroke: "#475569",
  strokeWidth: 2,
  strokeStyle: "solid",
  type: "smoothstep",
  animated: false,
  sourceArrow: "none",
  targetArrow: "arrowclosed",
  label: "",
  labelBgColor: "#ffffff",
  labelTextColor: "#0f172a",
  labelFontSize: 12,
  routing: "default",
};

export const defaultCanvas: DiagramCanvas = {
  width: 1600,
  height: 1000,
  background: "#fafafa",
  showGrid: true,
  gridColor: "#e2e8f0",
  gridSize: 20,
  snapToGrid: false,
};

export const blockShapeOptions: { value: BlockShape; label: string; icon: string }[] = [
  { value: "rectangle", label: "Rectangle", icon: "▭" },
  { value: "rounded", label: "Rounded", icon: "▢" },
  { value: "circle", label: "Circle", icon: "○" },
  { value: "ellipse", label: "Ellipse", icon: "◌" },
  { value: "diamond", label: "Diamond", icon: "◇" },
  { value: "parallelogram", label: "Parallelogram", icon: "▱" },
  { value: "hexagon", label: "Hexagon", icon: "⬡" },
  { value: "triangle", label: "Triangle", icon: "△" },
  { value: "cylinder", label: "Cylinder", icon: "⬭" },
  { value: "document", label: "Document", icon: "▤" },
  { value: "terminator", label: "Terminator", icon: "⬮" },
];

export const edgeTypeOptions: { value: EdgeStyle; label: string }[] = [
  { value: "default", label: "Default (Bezier)" },
  { value: "straight", label: "Straight" },
  { value: "step", label: "Step" },
  { value: "smoothstep", label: "Smooth Step" },
  { value: "bezier", label: "Bezier" },
  { value: "orthogonal", label: "Orthogonal (no overlap)" },
];

export const strokeStyleOptions: { value: EdgeStrokeStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export const arrowOptions: { value: ArrowType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Open Arrow" },
  { value: "arrowclosed", label: "Closed Arrow" },
];

// Used by the BlockPalette to offer all enterprise node types
export type NodeType =
  | "diagramBlock"
  | "group"
  | "annotation"
  | "brace"
  | "swimlane"
  | "timeline";

export const nodeTypeOptions: { value: NodeType; label: string; icon: string; description: string }[] = [
  { value: "diagramBlock", label: "Block", icon: "▭", description: "Standard shape (rect, diamond, etc.)" },
  { value: "group", label: "Group", icon: "⬚", description: "Container around related nodes" },
  { value: "annotation", label: "Annotation", icon: "📝", description: "Free-floating label" },
  { value: "brace", label: "Brace", icon: "{", description: "Vertical or horizontal bracket" },
  { value: "swimlane", label: "Swimlane", icon: "▦", description: "Department / RACI lanes" },
  { value: "timeline", label: "Timeline", icon: "↔", description: "Process milestones" },
];
