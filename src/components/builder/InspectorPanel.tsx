"use client";

import { useDiagramStore } from "@/store/diagram-store";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  blockShapeOptions,
  edgeTypeOptions,
  strokeStyleOptions,
  arrowOptions,
  BlockShape,
  EdgeStyle,
  EdgeStrokeStyle,
  ArrowType,
} from "@/types/diagram";
import { Trash2, Copy, MousePointer2, Spline, Settings2, Plus, X, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function InspectorPanel() {
  const project = useDiagramStore((s) => s.project);
  const selectedNodeId = useDiagramStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDiagramStore((s) => s.selectedEdgeId);
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData);
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const duplicateNode = useDiagramStore((s) => s.duplicateNode);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);
  const updateCanvas = useDiagramStore((s) => s.updateCanvas);
  const setProjectName = useDiagramStore((s) => s.setProjectName);

  const selectedNode = project.nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = project.edges.find((e) => e.id === selectedEdgeId);
  const nodeType = selectedNode?.type ?? "diagramBlock";

  // Determine which inspector tab to show
  const activeTab = selectedNode ? "node" : selectedEdge ? "edge" : "project";

  return (
    <Card className="h-full flex flex-col p-0 overflow-hidden border-l rounded-none">
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Inspector</h3>
          {selectedNode && (
            <span className="ml-auto text-[10px] uppercase tracking-wide bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {nodeType}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          <Tabs defaultValue={activeTab} key={activeTab}>
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
              <TabsTrigger value="node" className="text-xs" disabled={!selectedNode}>
                Node
              </TabsTrigger>
              <TabsTrigger value="edge" className="text-xs" disabled={!selectedEdge}>
                Line
              </TabsTrigger>
            </TabsList>

            {/* Project / canvas settings */}
            <TabsContent value="project" className="space-y-4">
              <div>
                <Label className="text-xs">Project name</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={project.name}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Background color</Label>
                <ColorInput
                  value={project.canvas.background}
                  onChange={(v) => updateCanvas({ background: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show grid</Label>
                <Switch checked={project.canvas.showGrid} onCheckedChange={(v) => updateCanvas({ showGrid: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Snap to grid</Label>
                <Switch checked={project.canvas.snapToGrid} onCheckedChange={(v) => updateCanvas({ snapToGrid: v })} />
              </div>
              <div>
                <Label className="text-xs">Grid size: {project.canvas.gridSize}px</Label>
                <Slider
                  min={10}
                  max={50}
                  step={2}
                  value={[project.canvas.gridSize]}
                  onValueChange={([v]) => updateCanvas({ gridSize: v })}
                  className="mt-2"
                />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                {project.nodes.length} nodes · {project.edges.length} edges
              </p>
            </TabsContent>

            {/* Node inspector — switches on node type */}
            <TabsContent value="node" className="space-y-4">
              {!selectedNode ? (
                <EmptyState icon={<MousePointer2 className="h-6 w-6" />} text="Select a node to edit" />
              ) : nodeType === "diagramBlock" ? (
                <BlockInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : nodeType === "group" ? (
                <GroupInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : nodeType === "annotation" ? (
                <AnnotationInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : nodeType === "brace" ? (
                <BraceInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : nodeType === "swimlane" ? (
                <SwimlaneInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : nodeType === "timeline" ? (
                <TimelineInspector selectedNode={selectedNode as any} updateNodeData={updateNodeData} deleteNode={deleteNode} duplicateNode={duplicateNode} />
              ) : null}
            </TabsContent>

            {/* Edge inspector */}
            <TabsContent value="edge" className="space-y-4">
              {!selectedEdge ? (
                <EmptyState icon={<Spline className="h-6 w-6" />} text="Select a flow line to edit" />
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Label (optional)</Label>
                    <Textarea
                      className="mt-1 text-xs min-h-[40px]"
                      value={selectedEdge.data.style.label ?? ""}
                      onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Line type</Label>
                    <Select
                      value={selectedEdge.data.style.type}
                      onValueChange={(v) => updateEdgeData(selectedEdge.id, { type: v as EdgeStyle })}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {edgeTypeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Stroke style</Label>
                    <Select
                      value={selectedEdge.data.style.strokeStyle}
                      onValueChange={(v) => updateEdgeData(selectedEdge.id, { strokeStyle: v as EdgeStrokeStyle })}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {strokeStyleOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <ColorRow label="Line color" value={selectedEdge.data.style.stroke} onChange={(v) => updateEdgeData(selectedEdge.id, { stroke: v })} />
                  <div>
                    <Label className="text-xs">Stroke width: {selectedEdge.data.style.strokeWidth}</Label>
                    <Slider
                      min={0.5}
                      max={8}
                      step={0.5}
                      value={[selectedEdge.data.style.strokeWidth]}
                      onValueChange={([v]) => updateEdgeData(selectedEdge.id, { strokeWidth: v })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Source arrow</Label>
                    <Select
                      value={selectedEdge.data.style.sourceArrow}
                      onValueChange={(v) => updateEdgeData(selectedEdge.id, { sourceArrow: v as ArrowType })}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {arrowOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Target arrow</Label>
                    <Select
                      value={selectedEdge.data.style.targetArrow}
                      onValueChange={(v) => updateEdgeData(selectedEdge.id, { targetArrow: v as ArrowType })}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {arrowOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Animated flow</Label>
                    <Switch checked={!!selectedEdge.data.style.animated} onCheckedChange={(v) => updateEdgeData(selectedEdge.id, { animated: v })} />
                  </div>
                  <Separator />
                  <ColorRow label="Label background" value={selectedEdge.data.style.labelBgColor ?? "#ffffff"} onChange={(v) => updateEdgeData(selectedEdge.id, { labelBgColor: v })} />
                  <ColorRow label="Label text" value={selectedEdge.data.style.labelTextColor ?? "#0f172a"} onChange={(v) => updateEdgeData(selectedEdge.id, { labelTextColor: v })} />
                  <div>
                    <Label className="text-xs">Label font size: {selectedEdge.data.style.labelFontSize ?? 12}</Label>
                    <Slider
                      min={8}
                      max={24}
                      step={1}
                      value={[selectedEdge.data.style.labelFontSize ?? 12]}
                      onValueChange={([v]) => updateEdgeData(selectedEdge.id, { labelFontSize: v })}
                      className="mt-2"
                    />
                  </div>
                  <Separator />
                  <Button size="sm" variant="destructive" className="h-8 text-xs w-full" onClick={() => deleteEdge(selectedEdge.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete line
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}

// ============ Per-type inspectors ============

function BlockActions({ onDelete, onDuplicate }: { onDelete: () => void; onDuplicate: () => void }) {
  return (
    <>
      <Separator />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 text-xs flex-1" onClick={onDuplicate}>
          <Copy className="h-3 w-3 mr-1" /> Duplicate
        </Button>
        <Button size="sm" variant="destructive" className="h-8 text-xs flex-1" onClick={onDelete}>
          <Trash2 className="h-3 w-3 mr-1" /> Delete
        </Button>
      </div>
    </>
  );
}

function BlockInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  const update = (partial: any) => updateNodeData(id, partial);
  const updateStyle = (s: any) => updateNodeData(id, { style: { ...d.style, ...s } });

  return (
    <>
      <div>
        <Label className="text-xs">Label</Label>
        <Input className="mt-1 h-8 text-xs" value={d.label} onChange={(e) => update({ label: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Subtitle</Label>
        <Input className="mt-1 h-8 text-xs" value={d.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Icon (emoji)</Label>
        <Input className="mt-1 h-8 text-xs" value={d.icon ?? ""} onChange={(e) => update({ icon: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Shape</Label>
        <Select value={d.shape} onValueChange={(v) => update({ shape: v as BlockShape })}>
          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {blockShapeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.icon} {o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Width</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.width} onChange={(e) => update({ width: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Height</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.height} onChange={(e) => update({ height: Number(e.target.value) })} />
        </div>
      </div>
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Style</p>
      <ColorRow label="Fill" value={d.style.fill} onChange={(v) => updateStyle({ fill: v })} />
      <ColorRow label="Stroke" value={d.style.stroke} onChange={(v) => updateStyle({ stroke: v })} />
      <ColorRow label="Text" value={d.style.textColor} onChange={(v) => updateStyle({ textColor: v })} />
      <SliderRow label="Stroke width" value={d.style.strokeWidth} min={0} max={8} step={0.5} onChange={(v) => updateStyle({ strokeWidth: v })} />
      <SliderRow label="Font size" value={d.style.fontSize} min={8} max={32} step={1} onChange={(v) => updateStyle({ fontSize: v })} />
      <SliderRow label="Font weight" value={d.style.fontWeight} min={300} max={800} step={100} onChange={(v) => updateStyle({ fontWeight: v })} />
      <div>
        <Label className="text-xs">Font family</Label>
        <Input className="mt-1 h-8 text-xs" value={d.style.fontFamily} onChange={(e) => updateStyle({ fontFamily: e.target.value })} />
      </div>
      <SliderRow label="Opacity" value={d.style.opacity} min={0} max={1} step={0.05} onChange={(v) => updateStyle({ opacity: v })} />
      <div className="flex items-center justify-between">
        <Label className="text-xs">Drop shadow</Label>
        <Switch checked={!!d.style.shadow} onCheckedChange={(v) => updateStyle({ shadow: v })} />
      </div>

      {/* SLA Badge */}
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">SLA / KPI Badge</p>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show badge</Label>
        <Switch checked={!!d.badge} onCheckedChange={(v) => update({ badge: v ? { text: "15m", fill: "#dc2626", textColor: "#ffffff" } : undefined })} />
      </div>
      {d.badge && (
        <>
          <div>
            <Label className="text-xs">Badge text</Label>
            <Input className="mt-1 h-8 text-xs" value={d.badge.text} onChange={(e) => update({ badge: { ...d.badge, text: e.target.value } })} />
          </div>
          <ColorRow label="Badge fill" value={d.badge.fill ?? "#dc2626"} onChange={(v) => update({ badge: { ...d.badge, fill: v } })} />
          <ColorRow label="Badge text" value={d.badge.textColor ?? "#ffffff"} onChange={(v) => update({ badge: { ...d.badge, textColor: v } })} />
          <div>
            <Label className="text-xs">Position</Label>
            <Select value={d.badge.position ?? "top-right"} onValueChange={(v) => update({ badge: { ...d.badge, position: v as any } })}>
              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right" className="text-xs">Top Right</SelectItem>
                <SelectItem value="top-left" className="text-xs">Top Left</SelectItem>
                <SelectItem value="bottom-right" className="text-xs">Bottom Right</SelectItem>
                <SelectItem value="bottom-left" className="text-xs">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Decision criteria */}
      <Separator />
      <p className="text-xs font-medium text-muted-foreground">Decision Criteria</p>
      <CriteriaEditor criteria={d.criteria ?? []} onChange={(criteria) => update({ criteria })} />

      {/* Ownership */}
      <Separator />
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Ownership</p>
      <div>
        <Label className="text-xs">Owner</Label>
        <Input className="mt-1 h-8 text-xs" value={d.ownership?.owner ?? ""} onChange={(e) => update({ ownership: { ...(d.ownership ?? {}), owner: e.target.value } })} />
      </div>
      <div>
        <Label className="text-xs">Approver</Label>
        <Input className="mt-1 h-8 text-xs" value={d.ownership?.approver ?? ""} onChange={(e) => update({ ownership: { ...(d.ownership ?? {}), approver: e.target.value } })} />
      </div>
      <div>
        <Label className="text-xs">Reviewer</Label>
        <Input className="mt-1 h-8 text-xs" value={d.ownership?.reviewer ?? ""} onChange={(e) => update({ ownership: { ...(d.ownership ?? {}), reviewer: e.target.value } })} />
      </div>
      <div>
        <Label className="text-xs">Department</Label>
        <Input className="mt-1 h-8 text-xs" value={d.ownership?.department ?? ""} onChange={(e) => update({ ownership: { ...(d.ownership ?? {}), department: e.target.value } })} />
      </div>

      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

function GroupInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  return (
    <>
      <div>
        <Label className="text-xs">Title</Label>
        <Input className="mt-1 h-8 text-xs" value={d.title} onChange={(e) => updateNodeData(id, { title: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Subtitle</Label>
        <Input className="mt-1 h-8 text-xs" value={d.subtitle ?? ""} onChange={(e) => updateNodeData(id, { subtitle: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Width</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.width} onChange={(e) => updateNodeData(id, { width: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Height</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.height} onChange={(e) => updateNodeData(id, { height: Number(e.target.value) })} />
        </div>
      </div>
      <Separator />
      <ColorRow label="Fill" value={d.fill} onChange={(v) => updateNodeData(id, { fill: v })} />
      <ColorRow label="Stroke" value={d.stroke} onChange={(v) => updateNodeData(id, { stroke: v })} />
      <ColorRow label="Text color" value={d.textColor} onChange={(v) => updateNodeData(id, { textColor: v })} />
      <div>
        <Label className="text-xs">Stroke style</Label>
        <Select value={d.strokeStyle ?? "dashed"} onValueChange={(v) => updateNodeData(id, { strokeStyle: v as any })}>
          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {strokeStyleOptions.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-xs">Collapsible</Label>
        <Switch checked={!!d.collapsible} onCheckedChange={(v) => updateNodeData(id, { collapsible: v })} />
      </div>
      <Separator />
      <div>
        <Label className="text-xs">Children (node IDs)</Label>
        <p className="text-[10px] text-muted-foreground mt-1">
          Comma-separated list of node IDs that belong to this group.
        </p>
        <Textarea
          className="mt-1 text-xs min-h-[60px] font-mono"
          value={(d.children ?? []).join(", ")}
          onChange={(e) => updateNodeData(id, { children: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
        />
      </div>
      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

function AnnotationInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  return (
    <>
      <div>
        <Label className="text-xs">Text</Label>
        <Textarea className="mt-1 text-xs min-h-[80px]" value={d.text} onChange={(e) => updateNodeData(id, { text: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Width</Label>
        <Input type="number" className="mt-1 h-8 text-xs" value={d.width} onChange={(e) => updateNodeData(id, { width: Number(e.target.value) })} />
      </div>
      <SliderRow label="Font size" value={d.fontSize} min={8} max={32} step={1} onChange={(v) => updateNodeData(id, { fontSize: v })} />
      <SliderRow label="Font weight" value={d.fontWeight} min={300} max={800} step={100} onChange={(v) => updateNodeData(id, { fontWeight: v })} />
      <ColorRow label="Color" value={d.color} onChange={(v) => updateNodeData(id, { color: v })} />
      <div>
        <Label className="text-xs">Alignment</Label>
        <Select value={d.align ?? "left"} onValueChange={(v) => updateNodeData(id, { align: v as any })}>
          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left" className="text-xs">Left</SelectItem>
            <SelectItem value="center" className="text-xs">Center</SelectItem>
            <SelectItem value="right" className="text-xs">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Italic</Label>
        <Switch checked={!!d.italic} onCheckedChange={(v) => updateNodeData(id, { italic: v })} />
      </div>
      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

function BraceInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  return (
    <>
      <div>
        <Label className="text-xs">Label</Label>
        <Input className="mt-1 h-8 text-xs" value={d.label ?? ""} onChange={(e) => updateNodeData(id, { label: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Orientation</Label>
        <Select value={d.orientation} onValueChange={(v) => updateNodeData(id, { orientation: v as any })}>
          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical" className="text-xs">Vertical</SelectItem>
            <SelectItem value="horizontal" className="text-xs">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Length: {d.length}px</Label>
        <Slider min={20} max={600} step={10} value={[d.length]} onValueChange={([v]) => updateNodeData(id, { length: v })} className="mt-2" />
      </div>
      <ColorRow label="Stroke" value={d.stroke} onChange={(v) => updateNodeData(id, { stroke: v })} />
      <ColorRow label="Label color" value={d.labelColor} onChange={(v) => updateNodeData(id, { labelColor: v })} />
      <SliderRow label="Stroke width" value={d.strokeWidth} min={0.5} max={6} step={0.5} onChange={(v) => updateNodeData(id, { strokeWidth: v })} />
      <SliderRow label="Font size" value={d.fontSize} min={8} max={24} step={1} onChange={(v) => updateNodeData(id, { fontSize: v })} />
      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

function SwimlaneInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  return (
    <>
      <div>
        <Label className="text-xs">Title</Label>
        <Input className="mt-1 h-8 text-xs" value={d.title ?? ""} onChange={(e) => updateNodeData(id, { title: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Width</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.width} onChange={(e) => updateNodeData(id, { width: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Lane height</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={d.laneHeight} onChange={(e) => updateNodeData(id, { laneHeight: Number(e.target.value) })} />
        </div>
      </div>
      <ColorRow label="Background" value={d.fill} onChange={(v) => updateNodeData(id, { fill: v })} />
      <ColorRow label="Stroke" value={d.stroke} onChange={(v) => updateNodeData(id, { stroke: v })} />
      <ColorRow label="Text color" value={d.textColor} onChange={(v) => updateNodeData(id, { textColor: v })} />
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Lanes ({d.lanes.length})</Label>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => updateNodeData(id, { lanes: [...d.lanes, { id: `lane_${uuidv4().slice(0, 6)}`, label: "New Lane", fill: "#f1f5f9", textColor: "#0f172a" }] })}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Lane
        </Button>
      </div>
      <div className="space-y-2">
        {d.lanes.map((lane: any, idx: number) => (
          <div key={lane.id} className="rounded-md border p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <Input
                className="h-7 text-xs flex-1"
                value={lane.label}
                onChange={(e) => {
                  const lanes = [...d.lanes];
                  lanes[idx] = { ...lane, label: e.target.value };
                  updateNodeData(id, { lanes });
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive"
                onClick={() => updateNodeData(id, { lanes: d.lanes.filter((_: any, i: number) => i !== idx) })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ColorRow label="Fill" value={lane.fill ?? "#f1f5f9"} onChange={(v) => {
              const lanes = [...d.lanes];
              lanes[idx] = { ...lane, fill: v };
              updateNodeData(id, { lanes });
            }} />
          </div>
        ))}
      </div>
      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

function TimelineInspector({ selectedNode, updateNodeData, deleteNode, duplicateNode }: any) {
  const d = selectedNode.data;
  const id = selectedNode.id;
  return (
    <>
      <div>
        <Label className="text-xs">Title</Label>
        <Input className="mt-1 h-8 text-xs" value={d.title ?? ""} onChange={(e) => updateNodeData(id, { title: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Orientation</Label>
        <Select value={d.orientation ?? "vertical"} onValueChange={(v) => updateNodeData(id, { orientation: v as any })}>
          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical" className="text-xs">Vertical</SelectItem>
            <SelectItem value="horizontal" className="text-xs">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Width: {d.width}px</Label>
        <Slider min={120} max={400} step={10} value={[d.width]} onValueChange={([v]) => updateNodeData(id, { width: v })} className="mt-2" />
      </div>
      <ColorRow label="Stroke" value={d.stroke} onChange={(v) => updateNodeData(id, { stroke: v })} />
      <ColorRow label="Milestone fill" value={d.milestoneFill} onChange={(v) => updateNodeData(id, { milestoneFill: v })} />
      <ColorRow label="Text color" value={d.textColor} onChange={(v) => updateNodeData(id, { textColor: v })} />
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Milestones ({d.milestones.length})</Label>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => updateNodeData(id, { milestones: [...d.milestones, { id: `m_${uuidv4().slice(0, 6)}`, label: "New", fill: "#475569", textColor: "#ffffff" }] })}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Milestone
        </Button>
      </div>
      <div className="space-y-2">
        {d.milestones.map((m: any, idx: number) => (
          <div key={m.id} className="rounded-md border p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <Input
                className="h-7 text-xs flex-1"
                value={m.label}
                onChange={(e) => {
                  const milestones = [...d.milestones];
                  milestones[idx] = { ...m, label: e.target.value };
                  updateNodeData(id, { milestones });
                }}
              />
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => updateNodeData(id, { milestones: d.milestones.filter((_: any, i: number) => i !== idx) })}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              className="h-7 text-xs"
              placeholder="Subtitle (optional)"
              value={m.subtitle ?? ""}
              onChange={(e) => {
                const milestones = [...d.milestones];
                milestones[idx] = { ...m, subtitle: e.target.value };
                updateNodeData(id, { milestones });
              }}
            />
            <ColorRow label="Fill" value={m.fill ?? "#475569"} onChange={(v) => {
              const milestones = [...d.milestones];
              milestones[idx] = { ...m, fill: v };
              updateNodeData(id, { milestones });
            }} />
          </div>
        ))}
      </div>
      <BlockActions onDelete={() => deleteNode(id)} onDuplicate={() => duplicateNode(id)} />
    </>
  );
}

// ============ Shared small components ============

function CriteriaEditor({ criteria, onChange }: { criteria: string[]; onChange: (c: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {criteria.length === 0 && (
        <p className="text-[10px] text-muted-foreground">No criteria — add decision branches like "Fire", "Theft".</p>
      )}
      {criteria.map((c, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <Input
            className="h-7 text-xs flex-1"
            value={c}
            onChange={(e) => {
              const next = [...criteria];
              next[idx] = e.target.value;
              onChange(next);
            }}
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => onChange(criteria.filter((_, i) => i !== idx))}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => onChange([...criteria, "New criteria"])}>
        <Plus className="h-3 w-3 mr-1" /> Add Criteria
      </Button>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs flex-1">{label}</Label>
      <ColorInput value={value} onChange={onChange} />
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 rounded border border-border cursor-pointer"
      />
      <Input className="h-7 w-20 text-xs font-mono" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}: {value}</Label>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="mt-2" />
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      {icon}
      <p className="text-xs mt-2 text-center">{text}</p>
    </div>
  );
}
