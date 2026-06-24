// Core type definitions for the modular diagram builder.
// Every block & edge is fully described by a plain JSON object so the entire
// canvas can be serialized, shared, and re-rendered from JSON input.

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

export type EdgeStyle = "default" | "straight" | "step" | "smoothstep" | "bezier";
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

export interface BlockData {
  label: string;
  subtitle?: string;
  icon?: string;
  shape: BlockShape;
  style: BlockStyle;
  width: number;
  height: number;
}

export interface DiagramNode {
  id: string;
  type: "diagramBlock";
  position: { x: number; y: number };
  data: BlockData;
}

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
  type: "default",
  animated: false,
  sourceArrow: "none",
  targetArrow: "arrowclosed",
  label: "",
  labelBgColor: "#ffffff",
  labelTextColor: "#0f172a",
  labelFontSize: 12,
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
