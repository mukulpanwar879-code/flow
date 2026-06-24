"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { getShapePath, getBracePath, shadowFilter } from "@/lib/diagram/shapes";
import { BlockData } from "@/types/diagram";
import { useDiagramStore } from "@/store/diagram-store";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ============ Standard block (with badges, criteria, ownership) ============

export interface DiagramBlockNodeData {
  label: string;
  subtitle?: string;
  icon?: string;
  shape: BlockData["shape"];
  style: BlockData["style"];
  width: number;
  height: number;
  badge?: { text: string; fill?: string; textColor?: string; position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" };
  ownership?: { owner?: string; approver?: string; reviewer?: string; department?: string };
  criteria?: string[];
  [key: string]: unknown;
}

function DiagramBlockNodeImpl({ data, selected }: NodeProps) {
  const d = data as DiagramBlockNodeData;
  const { width, height, style, shape, label, subtitle, icon, badge, ownership, criteria } = d;
  const path = getShapePath(shape, width, height);

  const badgePos = badge?.position ?? "top-right";
  const badgeStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: "absolute",
      background: badge?.fill ?? "#dc2626",
      color: badge?.textColor ?? "#ffffff",
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 999,
      zIndex: 5,
      whiteSpace: "nowrap",
    };
    if (badgePos.includes("top")) base.top = -8;
    if (badgePos.includes("bottom")) base.bottom = -8;
    if (badgePos.includes("right")) base.right = -8;
    if (badgePos.includes("left")) base.left = -8;
    return base;
  })();

  return (
    <div className="relative" style={{ width, height, filter: shadowFilter(style.shadow) }}>
      <svg width={width} height={height} className="absolute inset-0" style={{ overflow: "visible" }}>
        <path
          d={path}
          fill={style.fill}
          stroke={selected ? "#2563eb" : style.stroke}
          strokeWidth={selected ? style.strokeWidth + 1.5 : style.strokeWidth}
          strokeDasharray={style.strokeDasharray}
          opacity={style.opacity}
          strokeLinejoin="round"
        />
      </svg>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-3"
        style={{
          color: style.textColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontFamily: style.fontFamily,
        }}
      >
        {icon && <span className="text-lg leading-none mb-1">{icon}</span>}
        <div className="leading-tight break-words" style={{ maxWidth: width - 16 }}>
          {label}
        </div>
        {subtitle && (
          <div className="opacity-70 mt-0.5" style={{ fontSize: Math.max(10, style.fontSize - 3) }}>
            {subtitle}
          </div>
        )}
      </div>

      {badge && <span style={badgeStyle}>{badge.text}</span>}

      {/* Ownership metadata footer */}
      {ownership && (ownership.owner || ownership.approver) && (
        <div
          className="absolute left-0 right-0 px-2 py-1 text-[9px] leading-tight text-muted-foreground"
          style={{ bottom: -22 }}
        >
          {ownership.owner && <span className="mr-2">👤 {ownership.owner}</span>}
          {ownership.approver && <span className="mr-2">✓ {ownership.approver}</span>}
          {ownership.reviewer && <span>👁 {ownership.reviewer}</span>}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
    </div>
  );
}

export const DiagramBlockNode = memo(DiagramBlockNodeImpl);

// ============ Group / Container ============

export interface GroupNodeData {
  title: string;
  subtitle?: string;
  children: string[];
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeStyle?: "solid" | "dashed" | "dotted";
  textColor: string;
  collapsible?: boolean;
  collapsed?: boolean;
  [key: string]: unknown;
}

function GroupNodeImpl({ data, selected, id }: NodeProps) {
  const d = data as GroupNodeData;
  const toggleCollapse = useDiagramStore((s) => s.toggleGroupCollapse);
  const dashArray = d.strokeStyle === "dashed" ? "8 4" : d.strokeStyle === "dotted" ? "2 4" : undefined;

  return (
    <div
      className="relative"
      style={{
        width: d.width,
        height: d.collapsed ? 36 : d.height,
        background: d.fill,
        border: `2px ${d.strokeStyle ?? "solid"} ${selected ? "#2563eb" : d.stroke}`,
        strokeDasharray: dashArray,
        borderRadius: 8,
        transition: "height 0.2s ease",
        opacity: 0.9,
      }}
    >
      <NodeResizer
        minWidth={120}
        minHeight={d.collapsed ? 36 : 80}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-blue-500 !border !border-white"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-current/10" style={{ color: d.textColor }}>
        {d.collapsible && (
          <button
            className="hover:bg-black/10 rounded p-0.5 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(id);
            }}
          >
            {d.collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
        <span className="text-xs font-bold tracking-wide uppercase">{d.title}</span>
        {d.subtitle && <span className="text-[10px] opacity-70">· {d.subtitle}</span>}
        <span className="ml-auto text-[10px] opacity-50">{d.children.length} items</span>
      </div>
    </div>
  );
}

export const GroupNodeView = memo(GroupNodeImpl);

// ============ Annotation ============

export interface AnnotationNodeData {
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  italic?: boolean;
  width: number;
  [key: string]: unknown;
}

function AnnotationNodeImpl({ data, selected }: NodeProps) {
  const d = data as AnnotationNodeData;
  return (
    <div
      className="px-2 py-1"
      style={{
        width: d.width,
        fontSize: d.fontSize,
        fontWeight: d.fontWeight,
        color: d.color,
        textAlign: d.align,
        fontStyle: d.italic ? "italic" : "normal",
        border: selected ? "1px dashed #2563eb" : "1px dashed transparent",
        cursor: "move",
        lineHeight: 1.3,
      }}
    >
      {d.text}
    </div>
  );
}

export const AnnotationNodeView = memo(AnnotationNodeImpl);

// ============ Brace ============

export interface BraceNodeData {
  orientation: "vertical" | "horizontal";
  length: number;
  label?: string;
  stroke: string;
  strokeWidth: number;
  labelColor: string;
  fontSize: number;
  [key: string]: unknown;
}

function BraceNodeImpl({ data, selected }: NodeProps) {
  const d = data as BraceNodeData;
  const path = getBracePath(d.orientation, d.length);
  const isVertical = d.orientation === "vertical";
  const w = isVertical ? 30 : d.length;
  const h = isVertical ? d.length : 30;

  return (
    <div className="relative" style={{ width: w, height: h, cursor: "move" }}>
      <svg width={w} height={h} className="absolute inset-0" style={{ overflow: "visible" }}>
        <path
          d={path}
          fill="none"
          stroke={selected ? "#2563eb" : d.stroke}
          strokeWidth={d.strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {d.label && (
        <div
          className="absolute whitespace-nowrap font-medium"
          style={{
            fontSize: d.fontSize,
            color: d.labelColor,
            ...(isVertical
              ? { left: 16, top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center" }
              : { left: "50%", top: 16, transform: "translateX(-50%)" }),
          }}
        >
          {d.label}
        </div>
      )}
    </div>
  );
}

export const BraceNodeView = memo(BraceNodeImpl);

// ============ Swimlane ============

export interface SwimlaneNodeData {
  title?: string;
  lanes: { id: string; label: string; fill?: string; textColor?: string }[];
  width: number;
  laneHeight: number;
  fill: string;
  stroke: string;
  textColor: string;
  assignments?: Record<string, string>;
  [key: string]: unknown;
}

function SwimlaneNodeImpl({ data, selected }: NodeProps) {
  const d = data as SwimlaneNodeData;
  const labelWidth = 120;
  const totalHeight = d.lanes.length * d.laneHeight + 36;

  return (
    <div
      className="relative"
      style={{
        width: d.width + labelWidth,
        height: totalHeight,
        background: d.fill,
        border: `2px solid ${selected ? "#2563eb" : d.stroke}`,
        borderRadius: 6,
      }}
    >
      {/* Title bar */}
      <div
        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b"
        style={{ color: d.textColor, borderColor: d.stroke }}
      >
        {d.title ?? "Swimlane"}
      </div>
      {/* Lanes */}
      <div className="flex flex-col" style={{ height: totalHeight - 28 }}>
        {d.lanes.map((lane) => (
          <div key={lane.id} className="flex" style={{ height: d.laneHeight }}>
            <div
              className="flex items-center justify-center px-2 text-xs font-semibold text-center border-r"
              style={{
                width: labelWidth,
                background: lane.fill ?? "#f1f5f9",
                color: lane.textColor ?? "#0f172a",
                borderColor: d.stroke,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {lane.label}
            </div>
            <div
              className="flex-1 border-b"
              style={{ borderColor: d.stroke, background: "transparent" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const SwimlaneNodeView = memo(SwimlaneNodeImpl);

// ============ Timeline ============

export interface TimelineNodeData {
  title?: string;
  milestones: { id: string; label: string; subtitle?: string; fill?: string; textColor?: string }[];
  orientation: "vertical" | "horizontal";
  width: number;
  stroke: string;
  milestoneFill: string;
  textColor: string;
  [key: string]: unknown;
}

function TimelineNodeImpl({ data, selected }: NodeProps) {
  const d = data as TimelineNodeData;
  const isVertical = d.orientation === "vertical";
  const milestoneSize = 36;
  const gap = isVertical ? 56 : 80;

  return (
    <div
      className="relative"
      style={{
        width: isVertical ? d.width : d.milestones.length * (milestoneSize + gap) + 20,
        height: isVertical ? d.milestones.length * (milestoneSize + gap) + 36 : 80,
        border: selected ? "1px dashed #2563eb" : "1px dashed transparent",
      }}
    >
      {d.title && (
        <div className="text-xs font-bold uppercase tracking-wide mb-2 px-2" style={{ color: d.textColor }}>
          {d.title}
        </div>
      )}
      <div
        className="relative flex"
        style={{
          flexDirection: isVertical ? "column" : "row",
          alignItems: isVertical ? "flex-start" : "center",
          gap: gap,
          paddingLeft: 8,
        }}
      >
        {d.milestones.map((m, i) => (
          <div
            key={m.id}
            className="relative flex items-center"
            style={{ flexDirection: isVertical ? "row" : "column", gap: 6 }}
          >
            <div
              className="rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                width: milestoneSize,
                height: milestoneSize,
                background: m.fill ?? d.milestoneFill,
                color: m.textColor ?? "#ffffff",
                border: `2px solid ${d.stroke}`,
                zIndex: 2,
              }}
            >
              {i + 1}
            </div>
            <div className="text-center" style={{ minWidth: 80 }}>
              <div className="text-xs font-semibold" style={{ color: d.textColor }}>{m.label}</div>
              {m.subtitle && <div className="text-[10px] opacity-70">{m.subtitle}</div>}
            </div>
            {/* Connector line to next milestone */}
            {i < d.milestones.length - 1 && (
              <div
                className="absolute"
                style={
                  isVertical
                    ? { left: milestoneSize / 2 - 1, top: milestoneSize, width: 2, height: gap, background: d.stroke }
                    : { top: milestoneSize / 2 - 1, left: milestoneSize, height: 2, width: gap, background: d.stroke }
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TimelineNodeView = memo(TimelineNodeImpl);

// ============ Node type registry ============

export const nodeTypes = {
  diagramBlock: DiagramBlockNode,
  group: GroupNodeView,
  annotation: AnnotationNodeView,
  brace: BraceNodeView,
  swimlane: SwimlaneNodeView,
  timeline: TimelineNodeView,
};
