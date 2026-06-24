"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { getShapePath, shadowFilter } from "@/lib/diagram/shapes";
import { BlockData } from "@/types/diagram";

export interface DiagramBlockNodeData {
  label: string;
  subtitle?: string;
  icon?: string;
  shape: BlockData["shape"];
  style: BlockData["style"];
  width: number;
  height: number;
  [key: string]: unknown;
}

function DiagramBlockNodeImpl({ data, selected }: NodeProps) {
  const d = data as DiagramBlockNodeData;
  const { width, height, style, shape, label, subtitle, icon } = d;
  const path = getShapePath(shape, width, height);

  const strokeDasharray =
    style.strokeDasharray ||
    (style.strokeWidth && style.strokeWidth > 0
      ? undefined
      : undefined);

  return (
    <div
      className="relative"
      style={{ width, height, filter: shadowFilter(style.shadow) }}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <path
          d={path}
          fill={style.fill}
          stroke={selected ? "#2563eb" : style.stroke}
          strokeWidth={selected ? style.strokeWidth + 1.5 : style.strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={style.opacity}
          strokeLinejoin="round"
        />
      </svg>

      {/* Content */}
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
          <div
            className="opacity-70 mt-0.5"
            style={{ fontSize: Math.max(10, style.fontSize - 3) }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Connection handles - on all four sides for maximum flexibility */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />
    </div>
  );
}

export const DiagramBlockNode = memo(DiagramBlockNodeImpl);
