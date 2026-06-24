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
  NodeType,
  SwimlaneLane,
  TimelineMilestone,
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
  addNode: (type?: NodeType, position?: { x: number; y: number }, label?: string) => string;
  updateNodeData: (id: string, partial: Record<string, unknown>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Edge ops
  addEdge: (
    source: string,
    target: string,
    options?: {
      style?: Partial<EdgeStyleProps>;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }
  ) => void;
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

  // Enterprise helpers
  toggleGroupCollapse: (id: string) => void;
  assignNodeToLane: (nodeId: string, laneId: string) => void;
}

// ============ Starter enterprise example ============
// A real-world Critical Safety Incident Escalation Framework with groups,
// swimlanes, decisions, badges, ownership, and a timeline.

const starterNodes: DiagramNode[] = [
  // Swimlane (background)
  {
    id: "swimlane",
    type: "swimlane",
    position: { x: 40, y: 80 },
    data: {
      title: "Critical Safety Incident Escalation",
      lanes: [
        { id: "ops", label: "Operations", fill: "#eff6ff", textColor: "#1e3a8a" },
        { id: "safety", label: "Safety", fill: "#fef9c3", textColor: "#713f12" },
        { id: "leadership", label: "Leadership", fill: "#fee2e2", textColor: "#7f1d1d" },
      ],
      width: 1200,
      laneHeight: 220,
      fill: "#ffffff",
      stroke: "#cbd5e1",
      textColor: "#0f172a",
      assignments: {
        "report": "ops",
        "site_team": "ops",
        "severity": "safety",
        "safety_team": "safety",
        "hod": "leadership",
        "pl_head": "leadership",
      },
    },
  },
  // Timeline
  {
    id: "timeline",
    type: "timeline",
    position: { x: 1280, y: 80 },
    data: {
      title: "Escalation Timeline",
      milestones: [
        { id: "t0", label: "Incident", subtitle: "T+0", fill: "#dc2626", textColor: "#ffffff" },
        { id: "t1", label: "15 min", subtitle: "Site response", fill: "#f59e0b", textColor: "#ffffff" },
        { id: "t2", label: "30 min", subtitle: "Safety review", fill: "#ca8a04", textColor: "#ffffff" },
        { id: "t3", label: "72 hrs", subtitle: "RCA submitted", fill: "#2563eb", textColor: "#ffffff" },
        { id: "t4", label: "30 days", subtitle: "CAPA closed", fill: "#16a34a", textColor: "#ffffff" },
      ],
      orientation: "vertical",
      width: 180,
      stroke: "#cbd5e1",
      milestoneFill: "#ffffff",
      textColor: "#0f172a",
    },
  },
  // Group 1: Safety Impact Assessment
  {
    id: "group_safety",
    type: "group",
    position: { x: 100, y: 120 },
    data: {
      title: "Safety Impact Assessment",
      children: ["severity", "safety_team"],
      width: 480,
      height: 200,
      fill: "#fefce8",
      stroke: "#ca8a04",
      strokeStyle: "dashed",
      textColor: "#713f12",
      collapsible: true,
      collapsed: false,
    },
  },
  // Operations node
  {
    id: "report",
    type: "diagramBlock",
    position: { x: 140, y: 320 },
    data: {
      label: "Incident Reporting",
      subtitle: "Site Team",
      icon: "📢",
      shape: "terminator",
      width: 180,
      height: 60,
      style: { ...defaultBlockStyle, fill: "#dcfce7", stroke: "#16a34a", textColor: "#14532d" },
      badge: { text: "Immediate", fill: "#16a34a", textColor: "#ffffff" },
      ownership: { owner: "Site Team", department: "Operations" },
    },
  },
  {
    id: "site_team",
    type: "diagramBlock",
    position: { x: 360, y: 320 },
    data: {
      label: "Site Team",
      subtitle: "First responder",
      icon: "👷",
      shape: "rectangle",
      width: 160,
      height: 70,
      style: { ...defaultBlockStyle, fill: "#dbeafe", stroke: "#2563eb", textColor: "#1e3a8a" },
      badge: { text: "15 Min", fill: "#dc2626", textColor: "#ffffff" },
      ownership: { owner: "Site Lead", department: "Operations" },
    },
  },
  // Decision node with criteria
  {
    id: "severity",
    type: "diagramBlock",
    position: { x: 170, y: 150 },
    data: {
      label: "Severity Assessment",
      shape: "diamond",
      width: 220,
      height: 140,
      style: { ...defaultBlockStyle, fill: "#fef9c3", stroke: "#ca8a04", textColor: "#713f12" },
      criteria: ["Fire", "Signage Collapse", "Theft", "Water Ingress", "Pest Infestation"],
      ownership: { owner: "Safety Team", approver: "Safety Head" },
    },
  },
  {
    id: "safety_team",
    type: "diagramBlock",
    position: { x: 410, y: 170 },
    data: {
      label: "Safety Team",
      subtitle: "Functional escalation",
      icon: "🛡️",
      shape: "rectangle",
      width: 150,
      height: 80,
      style: { ...defaultBlockStyle, fill: "#fee2e2", stroke: "#dc2626", textColor: "#7f1d1d" },
      badge: { text: "30 Min", fill: "#dc2626", textColor: "#ffffff" },
      ownership: { owner: "Safety Officer", approver: "HOD Safety" },
    },
  },
  // Leadership
  {
    id: "hod",
    type: "diagramBlock",
    position: { x: 720, y: 150 },
    data: {
      label: "HOD",
      subtitle: "Department Head",
      icon: "👔",
      shape: "rectangle",
      width: 150,
      height: 70,
      style: { ...defaultBlockStyle, fill: "#f3e8ff", stroke: "#9333ea", textColor: "#581c87" },
      badge: { text: "2 Hrs", fill: "#9333ea", textColor: "#ffffff" },
      ownership: { owner: "HOD", approver: "P&L Head", reviewer: "Safety Committee" },
    },
  },
  {
    id: "pl_head",
    type: "diagramBlock",
    position: { x: 920, y: 150 },
    data: {
      label: "P&L Head",
      subtitle: "Functional Head",
      icon: "📊",
      shape: "rectangle",
      width: 150,
      height: 70,
      style: { ...defaultBlockStyle, fill: "#fce7f3", stroke: "#db2777", textColor: "#831843" },
      badge: { text: "4 Hrs", fill: "#db2777", textColor: "#ffffff" },
      ownership: { owner: "P&L Head", approver: "CEO", reviewer: "Board" },
    },
  },
  // Annotation
  {
    id: "annotation1",
    type: "annotation",
    position: { x: 700, y: 60 },
    data: {
      text: "Emergency Response & Functional Escalation",
      fontSize: 14,
      fontWeight: 700,
      color: "#7c2d12",
      align: "center",
      italic: false,
      width: 360,
    },
  },
  // Brace
  {
    id: "brace1",
    type: "brace",
    position: { x: 1100, y: 140 },
    data: {
      orientation: "vertical",
      length: 240,
      label: "Leadership Escalation",
      stroke: "#9333ea",
      strokeWidth: 2,
      labelColor: "#581c87",
      fontSize: 12,
    },
  },
];

const starterEdges: DiagramEdge[] = [
  {
    id: "e1",
    source: "report",
    target: "site_team",
    type: "orthogonal",
    data: { style: { ...defaultEdgeStyle, type: "orthogonal" } },
  },
  {
    id: "e2",
    source: "site_team",
    target: "severity",
    type: "orthogonal",
    data: { style: { ...defaultEdgeStyle, type: "orthogonal" } },
  },
  {
    id: "e3",
    source: "severity",
    target: "safety_team",
    type: "orthogonal",
    data: { style: { ...defaultEdgeStyle, type: "orthogonal", label: "Critical" } },
  },
  {
    id: "e4",
    source: "safety_team",
    target: "hod",
    type: "orthogonal",
    data: { style: { ...defaultEdgeStyle, type: "orthogonal" } },
  },
  {
    id: "e5",
    source: "hod",
    target: "pl_head",
    type: "orthogonal",
    data: { style: { ...defaultEdgeStyle, type: "orthogonal" } },
  },
];

const initialProject: DiagramProject = {
  name: "Critical Safety Incident Escalation",
  version: "2.0.0",
  canvas: defaultCanvas,
  nodes: starterNodes,
  edges: starterEdges,
};

// ============ Factory: create new node of any type ============

function createNode(
  type: NodeType,
  position: { x: number; y: number },
  label?: string
): DiagramNode {
  const id = `node_${uuidv4().slice(0, 8)}`;
  const pos = position ?? { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 };

  switch (type) {
    case "group":
      return {
        id,
        type: "group",
        position: pos,
        data: {
          title: label ?? "New Group",
          children: [],
          width: 360,
          height: 220,
          fill: "#fefce8",
          stroke: "#ca8a04",
          strokeStyle: "dashed",
          textColor: "#713f12",
          collapsible: true,
          collapsed: false,
        },
      };
    case "annotation":
      return {
        id,
        type: "annotation",
        position: pos,
        data: {
          text: label ?? "New annotation",
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
          align: "left",
          italic: false,
          width: 240,
        },
      };
    case "brace":
      return {
        id,
        type: "brace",
        position: pos,
        data: {
          orientation: "vertical",
          length: 200,
          label: label ?? "Phase",
          stroke: "#475569",
          strokeWidth: 2,
          labelColor: "#0f172a",
          fontSize: 12,
        },
      };
    case "swimlane":
      return {
        id,
        type: "swimlane",
        position: pos,
        data: {
          title: label ?? "Swimlane",
          lanes: [
            { id: "lane1", label: "Lane 1", fill: "#eff6ff", textColor: "#1e3a8a" },
            { id: "lane2", label: "Lane 2", fill: "#fef9c3", textColor: "#713f12" },
            { id: "lane3", label: "Lane 3", fill: "#fee2e2", textColor: "#7f1d1d" },
          ],
          width: 600,
          laneHeight: 160,
          fill: "#ffffff",
          stroke: "#cbd5e1",
          textColor: "#0f172a",
          assignments: {},
        },
      };
    case "timeline":
      return {
        id,
        type: "timeline",
        position: pos,
        data: {
          title: label ?? "Timeline",
          milestones: [
            { id: "m1", label: "Start", fill: "#16a34a", textColor: "#ffffff" },
            { id: "m2", label: "Mid", fill: "#ca8a04", textColor: "#ffffff" },
            { id: "m3", label: "End", fill: "#dc2626", textColor: "#ffffff" },
          ],
          orientation: "vertical",
          width: 160,
          stroke: "#cbd5e1",
          milestoneFill: "#ffffff",
          textColor: "#0f172a",
        },
      };
    case "diagramBlock":
    default: {
      const data: BlockData = {
        label: label ?? "New Block",
        shape: "rectangle",
        width: 180,
        height: 80,
        style: { ...defaultBlockStyle },
      };
      return { id, type: "diagramBlock", position: pos, data };
    }
  }
}

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

  addNode: (type = "diagramBlock", position, label) => {
    get().pushHistory();
    const newNode = createNode(type, position ?? { x: 240 + Math.random() * 80, y: 240 + Math.random() * 80 }, label);
    set((s) => ({
      project: { ...s.project, nodes: [...s.project.nodes, newNode] },
      selectedNodeId: newNode.id,
      selectedEdgeId: null,
    }));
    return newNode.id;
  },

  updateNodeData: (id, partial) => {
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => {
          if (n.id !== id) return n;
          if (n.type === "diagramBlock") {
            const newData = { ...n.data, ...partial } as any;
            if (partial.style) newData.style = { ...n.data.style, ...partial.style };
            return { ...n, data: newData };
          }
          return { ...n, data: { ...n.data, ...partial } as any };
        }),
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
      data: { ...node.data } as any,
    } as DiagramNode;
    set((s) => ({
      project: { ...s.project, nodes: [...s.project.nodes, newNode] },
      selectedNodeId: newId,
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),

  addEdge: (source, target, options) => {
    const id = `edge_${uuidv4().slice(0, 8)}`;
    const newEdge: DiagramEdge = {
      id,
      source,
      target,
      sourceHandle: options?.sourceHandle ?? null,
      targetHandle: options?.targetHandle ?? null,
      type: "orthogonal",
      data: { style: { ...defaultEdgeStyle, type: "orthogonal", ...options?.style } },
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

  toggleGroupCollapse: (id) => {
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => {
          if (n.id !== id || n.type !== "group") return n;
          return { ...n, data: { ...n.data, collapsed: !n.data.collapsed } };
        }),
      },
    }));
  },

  assignNodeToLane: (nodeId, laneId) => {
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => {
          if (n.type !== "swimlane") return n;
          const assignments = { ...(n.data.assignments ?? {}), [nodeId]: laneId };
          return { ...n, data: { ...n.data, assignments } };
        }),
      },
    }));
  },
}));
