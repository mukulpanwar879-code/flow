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
import { DiagramBlockNode } from "./DiagramBlockNode";
import { defaultEdgeStyle } from "@/types/diagram";
import { v4 as uuidv4 } from "uuid";

const nodeTypes = { diagramBlock: DiagramBlockNode };

const markerLookup = {
  none: undefined,
  arrow: MarkerType.Arrow,
  arrowclosed: MarkerType.ArrowClosed,
} as const;

function CanvasInner() {
  const project = useDiagramStore((s) => s.project);
  const selectNode = useDiagramStore((s) => s.selectNode);
  const selectEdge = useDiagramStore((s) => s.selectEdge);
  const updateNodePosition = useDiagramStore((s) => s.updateNodePosition);
  const addEdgeToStore = useDiagramStore((s) => s.addEdge);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);

  // Map store -> React Flow nodes/edges
  const rfNodes: Node[] = useMemo(
    () =>
      project.nodes.map((n) => ({
        id: n.id,
        type: "diagramBlock",
        position: n.position,
        data: n.data,
        selected: n.id === selectedNodeId,
        width: n.data.width,
        height: n.data.height,
      })),
    [project.nodes, selectedNodeId]
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      project.edges.map((e) => {
        const s = e.data.style;
        const dashArray =
          s.strokeStyle === "dashed"
            ? "8 4"
            : s.strokeStyle === "dotted"
              ? "2 4"
              : undefined;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
          type: s.type,
          animated: s.animated,
          selected: e.id === selectedEdgeId,
          label: s.label && s.label.trim() ? s.label : undefined,
          labelBgStyle: { fill: s.labelBgColor ?? "#ffffff" },
          labelStyle: {
            fill: s.labelTextColor ?? "#0f172a",
            fontSize: s.labelFontSize ?? 12,
            fontWeight: 500,
          },
          style: {
            stroke: s.stroke,
            strokeWidth: s.strokeWidth,
            strokeDasharray: dashArray,
          },
          markerStart: markerLookup[s.sourceArrow],
          markerEnd: markerLookup[s.targetArrow],
        } as Edge;
      }),
    [project.edges, selectedEdgeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync RF local state when the store changes (style edits, undo/redo, import)
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
      // RF local edges will be repopulated via the store -> effect sync above
      setEdges((eds) =>
        addEdge(
          {
            ...conn,
            id: `edge_${uuidv4().slice(0, 8)}`,
            type: "smoothstep",
            style: { stroke: defaultEdgeStyle.stroke, strokeWidth: defaultEdgeStyle.strokeWidth },
            markerEnd: MarkerType.ArrowClosed,
          },
          eds
        )
      );
    },
    [addEdgeToStore, setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => selectNode(node.id),
    [selectNode]
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => selectEdge(edge.id),
    [selectEdge]
  );

  const onNodeDragStop: NodeMouseHandler = useCallback(
    (_, node) => updateNodePosition(node.id, node.position),
    [updateNodePosition]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div
      className="relative w-full h-full"
      style={{ background: project.canvas.background }}
    >
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
        defaultEdgeOptions={{ type: "smoothstep", markerEnd: MarkerType.ArrowClosed }}
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
          nodeColor={(n) => (n.data as { style?: { fill?: string } })?.style?.fill ?? "#cbd5e1"}
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
