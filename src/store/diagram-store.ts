"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  DiagramNode,
  DiagramEdge,
  DiagramProject,
  DiagramCanvas,
  BlockShape,
  BlockData,
  EdgeStyle,
  EdgeStyleProps,
  defaultBlockStyle,
  defaultEdgeStyle,
  defaultCanvas,
} from "@/types/diagram";

interface DiagramState {
  project: DiagramProject;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  history: DiagramProject[];
  future: DiagramProject[];

  // Node ops
  addNode: (shape?: BlockShape, position?: { x: number; y: number }, label?: string) => string;
  updateNodeData: (id: string, partial: Partial<BlockData>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Edge ops
  addEdge: (source: string, target: string, style?: Partial<EdgeStyleProps>) => void;
  updateEdgeData: (id: string, partial: Partial<EdgeStyleProps>) => void;
  deleteEdge: (id: string) => void;
  selectEdge: (id: string | null) => void;

  // Canvas ops
  updateCanvas: (partial: Partial<DiagramCanvas>) => void;
  setProjectName: (name: string) => void;

  // Project ops
  loadProject: (project: DiagramProject) => void;
  exportProject: () => DiagramProject;
  exportJSON: () => string;
  clearAll: () => void;

  // Undo/redo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const starterNodes: DiagramNode[] = [
  {
    id: "start",
    type: "diagramBlock",
    position: { x: 80, y: 80 },
    data: {
      label: "Start",
      shape: "terminator",
      width: 160,
      height: 60,
      style: {
        ...defaultBlockStyle,
        fill: "#dcfce7",
        stroke: "#16a34a",
        textColor: "#14532d",
      },
    },
  },
  {
    id: "process",
    type: "diagramBlock",
    position: { x: 80, y: 220 },
    data: {
      label: "Process Data",
      subtitle: "Transform input",
      shape: "rectangle",
      width: 200,
      height: 80,
      style: {
        ...defaultBlockStyle,
        fill: "#dbeafe",
        stroke: "#2563eb",
        textColor: "#1e3a8a",
      },
    },
  },
  {
    id: "decision",
    type: "diagramBlock",
    position: { x: 100, y: 360 },
    data: {
      label: "Valid?",
      shape: "diamond",
      width: 180,
      height: 120,
      style: {
        ...defaultBlockStyle,
        fill: "#fef9c3",
        stroke: "#ca8a04",
        textColor: "#713f12",
      },
    },
  },
  {
    id: "end",
    type: "diagramBlock",
    position: { x: 380, y: 380 },
    data: {
      label: "End",
      shape: "terminator",
      width: 160,
      height: 60,
      style: {
        ...defaultBlockStyle,
        fill: "#fee2e2",
        stroke: "#dc2626",
        textColor: "#7f1d1d",
      },
    },
  },
];

const starterEdges: DiagramEdge[] = [
  {
    id: "e1",
    source: "start",
    target: "process",
    type: "smoothstep",
    data: { style: { ...defaultEdgeStyle } },
  },
  {
    id: "e2",
    source: "process",
    target: "decision",
    type: "smoothstep",
    data: { style: { ...defaultEdgeStyle } },
  },
  {
    id: "e3",
    source: "decision",
    target: "end",
    type: "smoothstep",
    data: { style: { ...defaultEdgeStyle, label: "yes" } },
  },
];

const initialProject: DiagramProject = {
  name: "Untitled Diagram",
  version: "1.0.0",
  canvas: defaultCanvas,
  nodes: starterNodes,
  edges: starterEdges,
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  project: initialProject,
  selectedNodeId: null,
  selectedEdgeId: null,
  history: [],
  future: [],

  pushHistory: () => {
    set((s) => ({
      history: [...s.history.slice(-50), s.project],
      future: [],
    }));
  },

  addNode: (shape = "rectangle", position, label) => {
    get().pushHistory();
    const id = `node_${uuidv4().slice(0, 8)}`;
    const newNode: DiagramNode = {
      id,
      type: "diagramBlock",
      position: position ?? { x: 240 + Math.random() * 80, y: 240 + Math.random() * 80 },
      data: {
        label: label ?? "New Block",
        shape,
        width: 180,
        height: 80,
        style: { ...defaultBlockStyle },
      },
    };
    set((s) => ({
      project: { ...s.project, nodes: [...s.project.nodes, newNode] },
      selectedNodeId: id,
      selectedEdgeId: null,
    }));
    return id;
  },

  updateNodeData: (id, partial) => {
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...partial, style: { ...n.data.style, ...(partial.style ?? {}) } } } : n
        ),
      },
    }));
  },

  updateNodePosition: (id, position) => {
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
      },
    }));
  },

  deleteNode: (id) => {
    get().pushHistory();
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.filter((n) => n.id !== id),
        edges: s.project.edges.filter((e) => e.source !== id && e.target !== id),
      },
      selectedNodeId: null,
    }));
  },

  duplicateNode: (id) => {
    const node = get().project.nodes.find((n) => n.id === id);
    if (!node) return;
    get().pushHistory();
    const newId = `node_${uuidv4().slice(0, 8)}`;
    const newNode: DiagramNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data },
    };
    set((s) => ({
      project: { ...s.project, nodes: [...s.project.nodes, newNode] },
      selectedNodeId: newId,
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),

  addEdge: (source, target, style) => {
    const id = `edge_${uuidv4().slice(0, 8)}`;
    const newEdge: DiagramEdge = {
      id,
      source,
      target,
      type: "smoothstep",
      data: { style: { ...defaultEdgeStyle, ...style } },
    };
    set((s) => ({
      project: { ...s.project, edges: [...s.project.edges, newEdge] },
    }));
  },

  updateEdgeData: (id, partial) => {
    set((s) => ({
      project: {
        ...s.project,
        edges: s.project.edges.map((e) =>
          e.id === id ? { ...e, data: { ...e.data, style: { ...e.data.style, ...partial } } } : e
        ),
      },
    }));
  },

  deleteEdge: (id) => {
    get().pushHistory();
    set((s) => ({
      project: { ...s.project, edges: s.project.edges.filter((e) => e.id !== id) },
      selectedEdgeId: null,
    }));
  },

  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  updateCanvas: (partial) => {
    set((s) => ({
      project: { ...s.project, canvas: { ...s.project.canvas, ...partial } },
    }));
  },

  setProjectName: (name) => set((s) => ({ project: { ...s.project, name } })),

  loadProject: (project) => {
    get().pushHistory();
    set({
      project,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },

  exportProject: () => get().project,
  exportJSON: () => JSON.stringify(get().project, null, 2),

  clearAll: () => {
    get().pushHistory();
    set((s) => ({
      project: { ...s.project, nodes: [], edges: [] },
      selectedNodeId: null,
      selectedEdgeId: null,
    }));
  },

  undo: () => {
    const { history, project } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set((s) => ({
      project: previous,
      history: s.history.slice(0, -1),
      future: [project, ...s.future],
      selectedNodeId: null,
      selectedEdgeId: null,
    }));
  },

  redo: () => {
    const { future, project } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      project: next,
      future: s.future.slice(1),
      history: [...s.history, project],
      selectedNodeId: null,
      selectedEdgeId: null,
    }));
  },
}));
