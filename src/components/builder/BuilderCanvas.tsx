"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  ConnectionMode,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "@/store/diagram-store";
import { nodeTypes } from "./DiagramBlockNode";
import { defaultEdgeStyle } from "@/types/diagram";
import { v4 as uuidv4 } from "uuid";

const markerLookup = {
  none: undefined,
  arrow: MarkerType.Arrow,
  arrowclosed: MarkerType.ArrowClosed,
} as const;

// React Flow's built-in edge types: "default" (bezier), "straight", "step",
// "smoothstep", "simplebezier". We map our "orthogonal" to "step" (with rounded
// corners via style) since React Flow doesn't ship a true orthogonal router,
// but step + smoothstep gives clean professional connectors.
function rfEdgeType(type: string): string {
  switch (type) {
    case "orthogonal":
    case "step":
      return "step";
    case "smoothstep":
      return "smoothstep";
    case "straight":
      return "straight";
    case "bezier":
      return "simplebezier";
    case "default":
    default:
      return "default";
  }
}

function CanvasInner() {
  const project = useDiagramStore((s) => s.project);
  const selectNode = useDiagramStore((s) => s.selectNode);
  const selectEdge = useDiagramStore((s) => s.selectEdge);
  const updateNodePosition = useDiagramStore((s) => s.updateNodePosition);
  const addEdgeToStore = useDiagramStore((s) => s.addEdge);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);

  // Map store nodes -> React Flow nodes
  // Order matters: non-interactive containers (swimlane, group) first so they render behind blocks.
  const rfNodes: Node[] = useMemo(() => {
    const ordered = [...project.nodes].sort((a, b) => {
      const order = (t: string) => (t === "swimlane" ? 0 : t === "group" ? 1 : t === "timeline" ? 2 : 3);
      return order(a.type) - order(b.type);
    });
    return ordered.map((n) => {
      const base: Node = {
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data as any,
        selected: n.id === selectedNodeId,
      };
      // Set explicit width/height so NodeResizer has known starting dimensions
      // and so React Flow doesn't auto-measure (which would fight the store).
      const data: any = n.data;
      if (data?.width != null) (base as any).width = data.width;
      if (data?.height != null) (base as any).height = data.height;
      return base;
    });
  }, [project.nodes, selectedNodeId]);

  const rfEdges: Edge[] = useMemo(
    () =>
      project.edges.map((e) => {
        const s = e.data.style;
        const dashArray =
          s.strokeStyle === "dashed" ? "8 4" : s.strokeStyle === "dotted" ? "2 4" : undefined;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
          type: rfEdgeType(s.type),
          animated: s.animated,
          selected: e.id === selectedEdgeId,
          label: s.label && s.label.trim() ? s.label : undefined,
          labelBgStyle: { fill: s.labelBgColor ?? "#ffffff" },
          labelStyle: {
            fill: s.labelTextColor ?? "#0f172a",
            fontSize: s.labelFontSize ?? 12,
            fontWeight: 500,
          },
          labelShowBg: true,
          labelBgPadding: [6, 2] as [number, number],
          labelBgBorderRadius: 4,
          style: {
            stroke: s.stroke,
            strokeWidth: s.strokeWidth,
            strokeDasharray: dashArray,
            borderRadius: 8,
          },
          markerStart: markerLookup[s.sourceArrow],
          markerEnd: markerLookup[s.targetArrow],
        } as Edge;
      }),
    [project.edges, selectedEdgeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync RF local state when the store changes
  const storeSig = useMemo(
    () => JSON.stringify(project.nodes) + "|" + JSON.stringify(project.edges),
    [project.nodes, project.edges]
  );
  const lastSigRef = useRef<string>("");
  useEffect(() => {
    if (lastSigRef.current !== storeSig) {
      lastSigRef.current = storeSig;
      setNodes(rfNodes);
      setEdges(rfEdges);
    }
  }, [storeSig, rfNodes, rfEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (conn: Connection) => {
      addEdgeToStore(conn.source!, conn.target!);
      setEdges((eds) =>
        addEdge(
          {
            ...conn,
            id: `edge_${uuidv4().slice(0, 8)}`,
            type: "step",
            style: { stroke: defaultEdgeStyle.stroke, strokeWidth: defaultEdgeStyle.strokeWidth },
            markerEnd: MarkerType.ArrowClosed,
          },
          eds
        )
      );
    },
    [addEdgeToStore, setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => selectNode(node.id), [selectNode]);
  const onEdgeClick: EdgeMouseHandler = useCallback((_, edge) => selectEdge(edge.id), [selectEdge]);
  const onNodeDragStop: NodeMouseHandler = useCallback((_, node) => updateNodePosition(node.id, node.position), [updateNodePosition]);
  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div className="relative w-full h-full" style={{ background: project.canvas.background }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Shift"]}
        proOptions={{ hideAttribution: true }}
        snapToGrid={project.canvas.snapToGrid}
        snapGrid={[project.canvas.gridSize, project.canvas.gridSize]}
        defaultEdgeOptions={{ type: "step", markerEnd: MarkerType.ArrowClosed }}
        minZoom={0.1}
        maxZoom={2}
      >
        {project.canvas.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={project.canvas.gridSize}
            color={project.canvas.gridColor}
            size={1.5}
          />
        )}
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          className="!bg-background !border"
          maskColor="rgba(15, 23, 42, 0.05)"
          nodeColor={(n) => {
            const d = n.data as any;
            return d?.style?.fill ?? d?.fill ?? "#cbd5e1";
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
