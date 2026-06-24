"use client";

import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, FileJson, ImageIcon, Code2, Eye, Download, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DiagramProject, DiagramNode, DiagramEdge } from "@/types/diagram";
import { getShapePath, getBracePath, shadowFilter } from "@/lib/diagram/shapes";
import { normalizeProject, validateProject, looksLikeProject } from "@/lib/diagram/normalize";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Enterprise sample: Critical Safety Incident Escalation
const SAMPLE: DiagramProject = {
  name: "Critical Safety Incident Escalation",
  version: "2.0.0",
  canvas: {
    width: 1400,
    height: 700,
    background: "#fafafa",
    showGrid: false,
    gridColor: "#e2e8f0",
    gridSize: 20,
    snapToGrid: false,
  },
  nodes: [
    // Swimlane background
    {
      id: "swimlane",
      type: "swimlane",
      position: { x: 40, y: 80 },
      data: {
        title: "Critical Safety Incident Escalation",
        lanes: [
          { id: "ops", label: "Operations", fill: "#dcfce7", textColor: "#14532d" },
          { id: "safety", label: "Safety", fill: "#fef9c3", textColor: "#713f12" },
          { id: "leadership", label: "Leadership", fill: "#fee2e2", textColor: "#7f1d1d" },
        ],
        width: 1100,
        laneHeight: 180,
        fill: "#ffffff",
        stroke: "#cbd5e1",
        textColor: "#0f172a",
        assignments: { "report": "ops", "site_team": "ops", "severity": "safety", "safety_team": "safety", "hod": "leadership", "pl_head": "leadership" },
      },
    },
    // Group container
    {
      id: "group_safety",
      type: "group",
      position: { x: 100, y: 280 },
      data: {
        title: "Safety Impact Assessment",
        children: ["severity", "safety_team"],
        width: 480,
        height: 170,
        fill: "#fefce8",
        stroke: "#ca8a04",
        strokeStyle: "dashed",
        textColor: "#713f12",
        collapsible: true,
        collapsed: false,
      },
    },
    // Annotation
    {
      id: "annotation1",
      type: "annotation",
      position: { x: 600, y: 30 },
      data: {
        text: "Emergency Response & Functional Escalation",
        fontSize: 16,
        fontWeight: 700,
        color: "#7c2d12",
        align: "center",
        italic: false,
        width: 400,
      },
    },
    // Brace
    {
      id: "brace1",
      type: "brace",
      position: { x: 1180, y: 120 },
      data: {
        orientation: "vertical",
        length: 380,
        label: "Leadership Escalation",
        stroke: "#9333ea",
        strokeWidth: 2,
        labelColor: "#581c87",
        fontSize: 12,
      },
    },
    // Timeline
    {
      id: "timeline",
      type: "timeline",
      position: { x: 1240, y: 120 },
      data: {
        title: "Timeline",
        milestones: [
          { id: "t0", label: "Incident", subtitle: "T+0", fill: "#dc2626", textColor: "#ffffff" },
          { id: "t1", label: "15 min", subtitle: "Site response", fill: "#f59e0b", textColor: "#ffffff" },
          { id: "t2", label: "30 min", subtitle: "Safety review", fill: "#ca8a04", textColor: "#ffffff" },
          { id: "t3", label: "72 hrs", subtitle: "RCA submitted", fill: "#2563eb", textColor: "#ffffff" },
          { id: "t4", label: "30 days", subtitle: "CAPA closed", fill: "#16a34a", textColor: "#ffffff" },
        ],
        orientation: "vertical",
        width: 140,
        stroke: "#cbd5e1",
        milestoneFill: "#ffffff",
        textColor: "#0f172a",
      },
    },
    // Block: Incident Reporting
    {
      id: "report",
      type: "diagramBlock",
      position: { x: 120, y: 110 },
      data: {
        label: "Incident Reporting",
        subtitle: "Site Team",
        icon: "📢",
        shape: "terminator",
        width: 180,
        height: 60,
        style: { fill: "#dcfce7", stroke: "#16a34a", strokeWidth: 2, textColor: "#14532d", fontSize: 14, fontWeight: 600, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        badge: { text: "Immediate", fill: "#16a34a", textColor: "#ffffff" },
        ownership: { owner: "Site Team", department: "Operations" },
      },
    },
    // Block: Site Team
    {
      id: "site_team",
      type: "diagramBlock",
      position: { x: 360, y: 110 },
      data: {
        label: "Site Team",
        subtitle: "First responder",
        icon: "👷",
        shape: "rectangle",
        width: 160,
        height: 70,
        style: { fill: "#dbeafe", stroke: "#2563eb", strokeWidth: 2, textColor: "#1e3a8a", fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        badge: { text: "15 Min", fill: "#dc2626", textColor: "#ffffff" },
        ownership: { owner: "Site Lead", department: "Operations" },
      },
    },
    // Decision node with criteria
    {
      id: "severity",
      type: "diagramBlock",
      position: { x: 150, y: 310 },
      data: {
        label: "Severity Assessment",
        shape: "diamond",
        width: 220,
        height: 130,
        style: { fill: "#fef9c3", stroke: "#ca8a04", strokeWidth: 2, textColor: "#713f12", fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        criteria: ["Fire", "Signage Collapse", "Theft", "Water Ingress", "Pest Infestation"],
        ownership: { owner: "Safety Team", approver: "Safety Head" },
      },
    },
    // Block: Safety Team
    {
      id: "safety_team",
      type: "diagramBlock",
      position: { x: 400, y: 320 },
      data: {
        label: "Safety Team",
        subtitle: "Functional escalation",
        icon: "🛡️",
        shape: "rectangle",
        width: 150,
        height: 80,
        style: { fill: "#fee2e2", stroke: "#dc2626", strokeWidth: 2, textColor: "#7f1d1d", fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        badge: { text: "30 Min", fill: "#dc2626", textColor: "#ffffff" },
        ownership: { owner: "Safety Officer", approver: "HOD Safety" },
      },
    },
    // Block: HOD
    {
      id: "hod",
      type: "diagramBlock",
      position: { x: 700, y: 320 },
      data: {
        label: "HOD",
        subtitle: "Department Head",
        icon: "👔",
        shape: "rectangle",
        width: 150,
        height: 70,
        style: { fill: "#f3e8ff", stroke: "#9333ea", strokeWidth: 2, textColor: "#581c87", fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        badge: { text: "2 Hrs", fill: "#9333ea", textColor: "#ffffff" },
        ownership: { owner: "HOD", approver: "P&L Head", reviewer: "Safety Committee" },
      },
    },
    // Block: P&L Head
    {
      id: "pl_head",
      type: "diagramBlock",
      position: { x: 900, y: 320 },
      data: {
        label: "P&L Head",
        subtitle: "Functional Head",
        icon: "📊",
        shape: "rectangle",
        width: 150,
        height: 70,
        style: { fill: "#fce7f3", stroke: "#db2777", strokeWidth: 2, textColor: "#831843", fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", opacity: 1, shadow: true },
        badge: { text: "4 Hrs", fill: "#db2777", textColor: "#ffffff" },
        ownership: { owner: "P&L Head", approver: "CEO", reviewer: "Board" },
      },
    },
  ],
  edges: [
    { id: "e1", source: "report", target: "site_team", type: "orthogonal", data: { style: { stroke: "#475569", strokeWidth: 2, strokeStyle: "solid", type: "orthogonal", animated: false, sourceArrow: "none", targetArrow: "arrowclosed" } } },
    { id: "e2", source: "site_team", target: "severity", type: "orthogonal", data: { style: { stroke: "#475569", strokeWidth: 2, strokeStyle: "solid", type: "orthogonal", animated: false, sourceArrow: "none", targetArrow: "arrowclosed" } } },
    { id: "e3", source: "severity", target: "safety_team", type: "orthogonal", data: { style: { stroke: "#475569", strokeWidth: 2, strokeStyle: "solid", type: "orthogonal", animated: false, sourceArrow: "none", targetArrow: "arrowclosed", label: "Critical" } } },
    { id: "e4", source: "safety_team", target: "hod", type: "orthogonal", data: { style: { stroke: "#475569", strokeWidth: 2, strokeStyle: "solid", type: "orthogonal", animated: true, sourceArrow: "none", targetArrow: "arrowclosed" } } },
    { id: "e5", source: "hod", target: "pl_head", type: "orthogonal", data: { style: { stroke: "#475569", strokeWidth: 2, strokeStyle: "solid", type: "orthogonal", animated: true, sourceArrow: "none", targetArrow: "arrowclosed" } } },
  ],
};

export function RenderView() {
  const [text, setText] = useState<string>(JSON.stringify(SAMPLE, null, 2));
  const [project, setProject] = useState<DiagramProject | null>(SAMPLE);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRender = () => {
    try {
      const trimmed = text.trim();
      if (!trimmed) {
        setError("No JSON to render. Paste or upload a diagram first.");
        toast.error("No JSON to render.");
        return;
      }
      const parsed = JSON.parse(trimmed);

      // Validate first — show helpful errors if the structure is wrong
      const issues = validateProject(parsed);
      if (issues.length > 0) {
        const msg = issues[0];
        setError(msg);
        toast.error(`Invalid JSON: ${msg}`);
        return;
      }
      if (!looksLikeProject(parsed)) {
        setError("JSON must be an object with `nodes` and `edges` arrays.");
        toast.error("Invalid JSON structure.");
        return;
      }

      // Normalize so missing fields are filled with defaults — never crashes
      const project = normalizeProject(parsed);
      setProject(project);
      setError(null);
      toast.success(`Rendered ${project.nodes.length} blocks and ${project.edges.length} lines`);
    } catch (e) {
      const msg = (e as Error).message || "Invalid JSON syntax.";
      setError(msg);
      toast.error(`Invalid JSON: ${msg}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const t = reader.result as string;
      setText(t);
      try {
        const parsed = JSON.parse(t);
        const issues = validateProject(parsed);
        if (issues.length > 0) {
          setError(issues[0]);
          toast.error(`Invalid file: ${issues[0]}`);
          return;
        }
        const project = normalizeProject(parsed);
        setProject(project);
        setError(null);
        toast.success(`Loaded ${file.name}`);
      } catch (err) {
        setError((err as Error).message || "Could not parse file as JSON.");
        toast.error(`Invalid JSON file: ${(err as Error).message}`);
      }
    };
    reader.onerror = () => {
      setError("Could not read the file.");
      toast.error("Could not read the file.");
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-uploaded
    e.target.value = "";
  };

  const loadSample = () => {
    setText(JSON.stringify(SAMPLE, null, 2));
    setProject(SAMPLE);
    setError(null);
  };

  const clearAll = () => {
    setText("");
    setProject(null);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left - JSON input */}
      <div className="lg:w-1/2 border-r flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            <h3 className="text-sm font-semibold">JSON Input</h3>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={loadSample}>
              <Sparkles className="h-3 w-3 mr-1" /> Sample
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={clearAll}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 font-mono text-xs rounded-none border-0 resize-none min-h-[300px] lg:min-h-0"
          placeholder="Paste your diagram JSON here..."
        />
        <div className="px-4 py-3 border-t flex items-center justify-between">
          {error ? (
            <Badge variant="destructive" className="text-xs">Error: {error}</Badge>
          ) : project ? (
            <Badge variant="secondary" className="text-xs">
              {project.nodes.length} blocks · {project.edges.length} lines
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">No diagram loaded</span>
          )}
          <Button size="sm" onClick={handleRender} disabled={!text.trim()}>
            <Eye className="h-3 w-3 mr-1" /> Render
          </Button>
        </div>
      </div>

      {/* Right - render output */}
      <div className="lg:w-1/2 flex-1 flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Rendered Output</h3>
          </div>
          {project && (
            <ExportButtons project={project} />
          )}
        </div>
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {!project ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Upload or paste JSON to render</p>
              </div>
            </div>
          ) : (
            <ErrorBoundary
              fallback={(err, reset) => (
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-md text-center space-y-3">
                    <ImageIcon className="h-10 w-10 text-destructive mx-auto opacity-60" />
                    <h3 className="text-sm font-semibold">Couldn&apos;t render this diagram</h3>
                    <p className="text-xs text-muted-foreground break-words">
                      {err.message}
                    </p>
                    <Button size="sm" variant="outline" onClick={reset}>
                      Try again
                    </Button>
                  </div>
                </div>
              )}
            >
              <RenderedDiagram project={project} />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportButtons({ project }: { project: DiagramProject }) {
  const downloadSVG = () => {
    try {
      const svg = generateSVG(project);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.name || "diagram").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("SVG downloaded");
    } catch (e) {
      toast.error(`SVG export failed: ${(e as Error).message}`);
    }
  };

  const downloadHTML = () => {
    try {
      const html = generateHTML(project);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.name || "diagram").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("HTML downloaded");
    } catch (e) {
      toast.error(`HTML export failed: ${(e as Error).message}`);
    }
  };

  const downloadPNG = async () => {
    try {
      const svg = generateSVG(project);
      const img = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const scale = 2; // 2x for crispness
          canvas.width = project.canvas.width * scale;
          canvas.height = project.canvas.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            toast.error("Could not get canvas context.");
            return;
          }
          ctx.scale(scale, scale);
          ctx.fillStyle = project.canvas.background;
          ctx.fillRect(0, 0, project.canvas.width, project.canvas.height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => {
            if (!blob) {
              toast.error("PNG export produced no data.");
              return;
            }
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `${(project.name || "diagram").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
            toast.success("PNG downloaded");
          });
        } catch (e) {
          URL.revokeObjectURL(url);
          toast.error(`PNG export failed: ${(e as Error).message}`);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("PNG export failed - try SVG instead");
      };
      img.src = url;
    } catch (e) {
      toast.error(`PNG export failed: ${(e as Error).message}`);
    }
  };

  const downloadJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.name || "diagram").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("JSON downloaded");
    } catch (e) {
      toast.error(`JSON export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={downloadSVG}>
        <Download className="h-3 w-3 mr-1" /> SVG
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={downloadPNG}>
        <Download className="h-3 w-3 mr-1" /> PNG
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={downloadHTML}>
        <Download className="h-3 w-3 mr-1" /> HTML
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={downloadJSON}>
        <Download className="h-3 w-3 mr-1" /> JSON
      </Button>
    </div>
  );
}

function RenderedDiagram({ project }: { project: DiagramProject }) {
  const svg = useMemo(() => generateSVG(project), [project]);
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
        style={{ maxWidth: "100%" }}
      >
        <div
          className="text-xs text-muted-foreground px-3 py-1.5 border-b bg-muted/50 flex items-center justify-between"
        >
          <span className="font-medium text-foreground">{project.name}</span>
          <span>{project.canvas.width} × {project.canvas.height}</span>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{ maxWidth: "100%", overflow: "auto" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Live SVG preview — use the export buttons above to download as SVG / PNG / HTML / JSON
      </p>
    </div>
  );
}

// ============ SVG generation ============

function generateSVG(project: DiagramProject): string {
  const { canvas, nodes, edges } = project;
  const nodeMap = new Map<string, DiagramNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Order nodes by type so containers (swimlane, group) render behind blocks.
  const renderOrder = ["swimlane", "group", "brace", "timeline", "annotation", "diagramBlock"];
  const orderedNodes = [...nodes].sort((a, b) => renderOrder.indexOf(a.type) - renderOrder.indexOf(b.type));

  // Defensive: each node renders in its own try/catch so one bad entry
  // can never crash the entire SVG output.
  const edgePaths = edges
    .map((e) => {
      try {
        return renderEdgeSVG(e, nodeMap);
      } catch (err) {
        console.warn("[renderEdgeSVG] skipping edge", e?.id, err);
        return "";
      }
    })
    .join("\n      ");

  const nodeShapes = orderedNodes
    .map((n) => {
      try {
        return renderNodeSVG(n);
      } catch (err) {
        console.warn("[renderNodeSVG] skipping node", n?.id, err);
        return "";
      }
    })
    .join("\n      ");

  const width = canvas?.width ?? 800;
  const height = canvas?.height ?? 600;
  const bg = canvas?.background ?? "#ffffff";

  return `<svg xmlns="http://www.w3.org/2000/svg"
       width="${width}"
       height="${height}"
       viewBox="0 0 ${width} ${height}"
       font-family="Inter, system-ui, sans-serif">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>
    <marker id="arrowclosed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="${bg}" />
  <g>
      ${nodeShapes}
  </g>
  <g>
      ${edgePaths}
  </g>
</svg>`;
}

function renderNodeSVG(n: DiagramNode): string {
  // Dispatch by node type — each renderer is independent so one bad node can't
  // take down the whole SVG.
  try {
    switch (n.type) {
      case "group": return renderGroupSVG(n);
      case "annotation": return renderAnnotationSVG(n);
      case "brace": return renderBraceSVG(n);
      case "swimlane": return renderSwimlaneSVG(n);
      case "timeline": return renderTimelineSVG(n);
      case "diagramBlock":
      default: return renderBlockSVG(n);
    }
  } catch (err) {
    console.warn("[renderNodeSVG] skipping node", n?.id, err);
    return "";
  }
}

function renderBlockSVG(n: DiagramNode): string {
  if (n.type !== "diagramBlock") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { width, height, style, shape, label, subtitle, icon, badge, ownership, criteria } = data;
  const path = getShapePath(shape, width, height);
  const shadow = style.shadow ? `filter="drop-shadow(0 4px 6px rgba(15,23,42,0.08))"` : "";
  const dash = style.strokeDasharray ? `stroke-dasharray="${style.strokeDasharray}"` : "";

  const lines = (label || "").split("\n");
  const labelText = lines
    .map((line, i) => {
      const dy = (i - (lines.length - 1) / 2) * (style.fontSize * 1.2);
      return `<text x="${x + width / 2}" y="${y + height / 2 + dy}"
        text-anchor="middle" dominant-baseline="middle"
        fill="${style.textColor}" font-size="${style.fontSize}" font-weight="${style.fontWeight}"
        font-family="${escapeXml(style.fontFamily)}">${escapeXml(line || " ")}</text>`;
    })
    .join("\n        ");

  const subtitleText = subtitle
    ? `<text x="${x + width / 2}" y="${y + height / 2 + style.fontSize * 0.85}"
        text-anchor="middle" fill="${style.textColor}" opacity="0.7"
        font-size="${Math.max(10, style.fontSize - 3)}">${escapeXml(subtitle)}</text>`
    : "";

  // Badge (SLA/KPI pill)
  const badgeEl = badge && badge.text
    ? (() => {
        const bw = Math.max(30, badge.text.length * 7 + 12);
        const bh = 18;
        const bx = badge.position?.includes("left") ? x : x + width - bw;
        const by = badge.position?.includes("bottom") ? y + height - bh / 2 : y - bh / 2;
        return `<g>
          <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bh / 2}"
            fill="${badge.fill ?? "#dc2626"}" stroke="#ffffff" stroke-width="1.5" />
          <text x="${bx + bw / 2}" y="${by + bh / 2 + 1}" text-anchor="middle" dominant-baseline="middle"
            fill="${badge.textColor ?? "#ffffff"}" font-size="10" font-weight="700"
            font-family="Inter, sans-serif">${escapeXml(badge.text)}</text>
        </g>`;
      })()
    : "";

  // Ownership footer (small text below the block)
  const ownershipEl = ownership && (ownership.owner || ownership.approver || ownership.reviewer)
    ? `<g>
        ${ownership.owner ? `<text x="${x + 4}" y="${y + height + 12}" fill="#64748b" font-size="9" font-family="Inter, sans-serif">👤 ${escapeXml(ownership.owner)}</text>` : ""}
        ${ownership.approver ? `<text x="${x + 4}" y="${y + height + 24}" fill="#64748b" font-size="9" font-family="Inter, sans-serif">✓ ${escapeXml(ownership.approver)}</text>` : ""}
        ${ownership.reviewer ? `<text x="${x + width - 4}" y="${y + height + 12}" text-anchor="end" fill="#64748b" font-size="9" font-family="Inter, sans-serif">👁 ${escapeXml(ownership.reviewer)}</text>` : ""}
      </g>`
    : "";

  return `<g ${shadow}>
      <path d="${path}" transform="translate(${x}, ${y})"
        fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"
        opacity="${style.opacity}" ${dash} stroke-linejoin="round" />
      ${labelText}
      ${subtitleText}
      ${badgeEl}
      ${ownershipEl}
    </g>`;
}

function renderGroupSVG(n: DiagramNode): string {
  if (n.type !== "group") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { width, height, title, subtitle, fill, stroke, strokeStyle, textColor, collapsed } = data;
  const h = collapsed ? 36 : height;
  const dash = strokeStyle === "dashed" ? `stroke-dasharray="8 4"` : strokeStyle === "dotted" ? `stroke-dasharray="2 4"` : "";
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${h}" rx="8"
      fill="${fill ?? "#fefce8"}" fill-opacity="0.6"
      stroke="${stroke ?? "#ca8a04"}" stroke-width="2" ${dash} />
    <text x="${x + 12}" y="${y + 18}" fill="${textColor ?? "#713f12"}" font-size="11" font-weight="700"
      font-family="Inter, sans-serif">${collapsed ? "►" : "▼"} ${escapeXml(title || "Group").toUpperCase()}</text>
    ${subtitle ? `<text x="${x + 12}" y="${y + 30}" fill="${textColor ?? "#713f12"}" opacity="0.7" font-size="9" font-family="Inter, sans-serif">${escapeXml(subtitle)}</text>` : ""}
  </g>`;
}

function renderAnnotationSVG(n: DiagramNode): string {
  if (n.type !== "annotation") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { text, fontSize, fontWeight, color, align, italic, width } = data;
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const tx = align === "center" ? x + width / 2 : align === "right" ? x + width : x;
  const style = italic ? `font-style="italic"` : "";
  const lines = (text || "").split("\n");
  return `<g>${lines.map((line, i) =>
    `<text x="${tx}" y="${y + fontSize + i * fontSize * 1.3}" text-anchor="${anchor}"
       fill="${color ?? "#475569"}" font-size="${fontSize ?? 13}" font-weight="${fontWeight ?? 600}"
       font-family="Inter, sans-serif" ${style}>${escapeXml(line || " ")}</text>`
  ).join("")}</g>`;
}

function renderBraceSVG(n: DiagramNode): string {
  if (n.type !== "brace") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { orientation, length, label, stroke, strokeWidth, labelColor, fontSize } = data;
  const path = getBracePath(orientation, length);
  const labelEl = label
    ? orientation === "vertical"
      ? `<text x="${x + 22}" y="${y + length / 2}" fill="${labelColor ?? "#0f172a"}" font-size="${fontSize ?? 12}" font-weight="500"
          font-family="Inter, sans-serif" transform="rotate(-90 ${x + 22} ${y + length / 2})" text-anchor="middle">${escapeXml(label)}</text>`
      : `<text x="${x + length / 2}" y="${y + 26}" fill="${labelColor ?? "#0f172a"}" font-size="${fontSize ?? 12}" font-weight="500"
          font-family="Inter, sans-serif" text-anchor="middle">${escapeXml(label)}</text>`
    : "";
  return `<g>
    <path d="${path}" transform="translate(${x}, ${y})" fill="none"
      stroke="${stroke ?? "#475569"}" stroke-width="${strokeWidth ?? 2}" stroke-linecap="round" />
    ${labelEl}
  </g>`;
}

function renderSwimlaneSVG(n: DiagramNode): string {
  if (n.type !== "swimlane") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { title, lanes, width, laneHeight, fill, stroke, textColor, assignments } = data;
  const labelWidth = 100;
  const headerHeight = 28;
  const totalHeight = lanes.length * laneHeight + headerHeight;

  const laneEls = lanes.map((lane, i) => {
    const ly = y + headerHeight + i * laneHeight;
    return `<g>
      <rect x="${x}" y="${ly}" width="${labelWidth}" height="${laneHeight}"
        fill="${lane.fill ?? "#f1f5f9"}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="1" />
      <text x="${x + labelWidth / 2}" y="${ly + laneHeight / 2}" text-anchor="middle" dominant-baseline="middle"
        fill="${lane.textColor ?? "#0f172a"}" font-size="11" font-weight="600" font-family="Inter, sans-serif"
        transform="rotate(-90 ${x + labelWidth / 2} ${ly + laneHeight / 2})">${escapeXml(lane.label)}</text>
      <rect x="${x + labelWidth}" y="${ly}" width="${width}" height="${laneHeight}"
        fill="transparent" stroke="${stroke ?? "#cbd5e1"}" stroke-width="1" />
    </g>`;
  }).join("");

  return `<g>
    <rect x="${x}" y="${y}" width="${width + labelWidth}" height="${totalHeight}" rx="6"
      fill="${fill ?? "#ffffff"}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="2" />
    <rect x="${x}" y="${y}" width="${width + labelWidth}" height="${headerHeight}" rx="6"
      fill="${fill ?? "#ffffff"}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="2" />
    <text x="${x + 12}" y="${y + 18}" fill="${textColor ?? "#0f172a"}" font-size="11" font-weight="700"
      font-family="Inter, sans-serif">${escapeXml((title ?? "Swimlane").toUpperCase())}</text>
    ${laneEls}
  </g>`;
}

function renderTimelineSVG(n: DiagramNode): string {
  if (n.type !== "timeline") return "";
  const { data, position } = n;
  const { x, y } = position;
  const { title, milestones, orientation, width, stroke, milestoneFill, textColor } = data;
  const isVertical = orientation === "vertical";
  const mSize = 36;
  const gap = 56;
  const headerOffset = title ? 24 : 0;

  const mEls = milestones.map((m, i) => {
    const mx = isVertical ? x + width / 2 : x + mSize / 2 + i * (mSize + gap);
    const my = isVertical ? y + headerOffset + mSize / 2 + i * (mSize + gap) : y + headerOffset + mSize / 2;
    const labelX = isVertical ? x + mSize + 8 : mx;
    const labelY = isVertical ? my : y + headerOffset + mSize + 16;
    const lineEl = i < milestones.length - 1
      ? isVertical
        ? `<line x1="${mx}" y1="${my + mSize / 2}" x2="${mx}" y2="${my + mSize / 2 + gap}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="2" />`
        : `<line x1="${mx + mSize / 2}" y1="${my}" x2="${mx + mSize / 2 + gap}" y2="${my}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="2" />`
      : "";
    return `<g>
      <circle cx="${mx}" cy="${my}" r="${mSize / 2}" fill="${m.fill ?? milestoneFill ?? "#ffffff"}" stroke="${stroke ?? "#cbd5e1"}" stroke-width="2" />
      <text x="${mx}" y="${my + 1}" text-anchor="middle" dominant-baseline="middle"
        fill="${m.textColor ?? "#ffffff"}" font-size="12" font-weight="700" font-family="Inter, sans-serif">${i + 1}</text>
      <text x="${isVertical ? x + mSize + 14 : mx}" y="${isVertical ? my + 4 : y + headerOffset + mSize + 16}"
        fill="${textColor ?? "#0f172a"}" font-size="11" font-weight="600" font-family="Inter, sans-serif">${escapeXml(m.label)}</text>
      ${m.subtitle ? `<text x="${isVertical ? x + mSize + 14 : mx}" y="${isVertical ? my + 18 : y + headerOffset + mSize + 30}"
        fill="#64748b" font-size="9" font-family="Inter, sans-serif">${escapeXml(m.subtitle)}</text>` : ""}
      ${lineEl}
    </g>`;
  }).join("");

  const titleEl = title
    ? `<text x="${x}" y="${y + 14}" fill="${textColor ?? "#0f172a"}" font-size="11" font-weight="700"
        font-family="Inter, sans-serif">${escapeXml(title.toUpperCase())}</text>`
    : "";

  return `<g>${titleEl}${mEls}</g>`;
}

function renderEdgeSVG(e: DiagramEdge, nodes: Map<string, DiagramNode>): string {
  const s = e.data.style;
  const src = nodes.get(e.source);
  const tgt = nodes.get(e.target);
  if (!src || !tgt) return "";

  const { x: sx, y: sy } = src.position;
  const { x: tx, y: ty } = tgt.position;
  // Different node types store dimensions differently — extract safely.
  const sw = (src as any).data?.width ?? 120;
  const sh = (src as any).data?.height ?? 60;
  const tw = (tgt as any).data?.width ?? 120;
  const th = (tgt as any).data?.height ?? 60;

  // Pick best connection points
  const { x: x1, y: y1 } = pickAnchor(sx, sy, sw, sh, tx + tw / 2, ty + th / 2);
  const { x: x2, y: y2 } = pickAnchor(tx, ty, tw, th, sx + sw / 2, sy + sh / 2);

  const path = buildPath(s.type === "orthogonal" ? "step" : s.type, x1, y1, x2, y2);
  const dash = s.strokeStyle === "dashed" ? `stroke-dasharray="8 4"` : s.strokeStyle === "dotted" ? `stroke-dasharray="2 4"` : "";
  const anim = s.animated ? `<animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1s" repeatCount="indefinite" />` : "";

  // Arrows
  const markerStart = s.sourceArrow !== "none" ? `marker-start="url(#${s.sourceArrow === "arrowclosed" ? "arrowclosed" : "arrow"})"` : "";
  const markerEnd = s.targetArrow !== "none" ? `marker-end="url(#${s.targetArrow === "arrowclosed" ? "arrowclosed" : "arrow"})"` : "";

  const label = s.label && s.label.trim()
    ? `<g>
        <rect x="${(x1 + x2) / 2 - s.label!.length * 3}" y="${(y1 + y2) / 2 - (s.labelFontSize ?? 12) / 2 - 2}"
              width="${s.label!.length * 6}" height="${(s.labelFontSize ?? 12) + 4}"
              fill="${s.labelBgColor ?? "#ffffff"}" rx="2" />
        <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2}"
              text-anchor="middle" dominant-baseline="middle"
              fill="${s.labelTextColor ?? "#0f172a"}"
              font-size="${s.labelFontSize ?? 12}"
              font-weight="500">${escapeXml(s.label!)}</text>
      </g>`
    : "";

  return `<path d="${path}"
        fill="none"
        stroke="${s.stroke}"
        stroke-width="${s.strokeWidth}"
        ${dash}
        ${markerStart}
        ${markerEnd}>
      ${anim}
    </path>
    ${label}`;
}

function pickAnchor(x: number, y: number, w: number, h: number, towardX: number, towardY: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? { x: x + w, y: cy } : { x, y: cy };
  } else {
    return dy > 0 ? { x: cx, y: y + h } : { x: cx, y };
  }
}

function buildPath(type: string, x1: number, y1: number, x2: number, y2: number): string {
  switch (type) {
    case "straight":
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    case "step": {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }
    case "smoothstep": {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }
    case "bezier":
    case "default":
    default: {
      const dx = Math.abs(x2 - x1) * 0.5;
      return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    }
  }
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

// ============ HTML generation ============

function generateHTML(project: DiagramProject): string {
  const svg = generateSVG(project);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeXml(project.name)}</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-family: Inter, system-ui, sans-serif;
  }
  .diagram {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
    padding: 24px;
    max-width: 100%;
    overflow: auto;
  }
  .diagram h1 {
    font-size: 14px;
    color: #475569;
    margin: 0 0 16px 0;
    font-weight: 600;
  }
  svg { max-width: 100%; height: auto; display: block; }
</style>
</head>
<body>
  <div class="diagram">
    <h1>${escapeXml(project.name)}</h1>
    ${svg}
  </div>
</body>
</html>`;
}
