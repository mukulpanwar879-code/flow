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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Trash2, Copy, MousePointer2, Spline, Settings2 } from "lucide-react";

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

  return (
    <Card className="h-full flex flex-col p-0 overflow-hidden border-l">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Inspector</h3>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue={selectedNode ? "node" : selectedEdge ? "edge" : "project"}>
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="project" className="text-xs">Project</TabsTrigger>
              <TabsTrigger value="node" className="text-xs" disabled={!selectedNode}>
                Block
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
                <Switch
                  checked={project.canvas.showGrid}
                  onCheckedChange={(v) => updateCanvas({ showGrid: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Snap to grid</Label>
                <Switch
                  checked={project.canvas.snapToGrid}
                  onCheckedChange={(v) => updateCanvas({ snapToGrid: v })}
                />
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
                {project.nodes.length} blocks · {project.edges.length} lines
              </p>
            </TabsContent>

            {/* Node inspector */}
            <TabsContent value="node" className="space-y-4">
              {!selectedNode ? (
                <EmptyState icon={<MousePointer2 className="h-6 w-6" />} text="Select a block to edit" />
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Label</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtitle (optional)</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={selectedNode.data.subtitle ?? ""}
                      onChange={(e) => updateNodeData(selectedNode.id, { subtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Icon (emoji or symbol)</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={selectedNode.data.icon ?? ""}
                      onChange={(e) => updateNodeData(selectedNode.id, { icon: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Shape</Label>
                    <Select
                      value={selectedNode.data.shape}
                      onValueChange={(v) => updateNodeData(selectedNode.id, { shape: v as BlockShape })}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {blockShapeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.icon} {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        className="mt-1 h-8 text-xs"
                        value={selectedNode.data.width}
                        onChange={(e) => updateNodeData(selectedNode.id, { width: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        className="mt-1 h-8 text-xs"
                        value={selectedNode.data.height}
                        onChange={(e) => updateNodeData(selectedNode.id, { height: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">Style</p>
                  <ColorRow label="Fill" value={selectedNode.data.style.fill} onChange={(v) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, fill: v } })} />
                  <ColorRow label="Stroke" value={selectedNode.data.style.stroke} onChange={(v) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, stroke: v } })} />
                  <ColorRow label="Text" value={selectedNode.data.style.textColor} onChange={(v) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, textColor: v } })} />
                  <div>
                    <Label className="text-xs">Stroke width: {selectedNode.data.style.strokeWidth}</Label>
                    <Slider
                      min={0}
                      max={8}
                      step={0.5}
                      value={[selectedNode.data.style.strokeWidth]}
                      onValueChange={([v]) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, strokeWidth: v } })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font size: {selectedNode.data.style.fontSize}</Label>
                    <Slider
                      min={8}
                      max={32}
                      step={1}
                      value={[selectedNode.data.style.fontSize]}
                      onValueChange={([v]) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, fontSize: v } })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font weight: {selectedNode.data.style.fontWeight}</Label>
                    <Slider
                      min={300}
                      max={800}
                      step={100}
                      value={[selectedNode.data.style.fontWeight]}
                      onValueChange={([v]) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, fontWeight: v } })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font family</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={selectedNode.data.style.fontFamily}
                      onChange={(e) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, fontFamily: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Opacity: {Math.round(selectedNode.data.style.opacity * 100)}%</Label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={[selectedNode.data.style.opacity]}
                      onValueChange={([v]) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, opacity: v } })}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Drop shadow</Label>
                    <Switch
                      checked={!!selectedNode.data.style.shadow}
                      onCheckedChange={(v) => updateNodeData(selectedNode.id, { style: { ...selectedNode.data.style, shadow: v } })}
                    />
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex-1"
                      onClick={() => duplicateNode(selectedNode.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs flex-1"
                      onClick={() => deleteNode(selectedNode.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </>
              )}
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
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {edgeTypeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.label}
                          </SelectItem>
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
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {strokeStyleOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.label}
                          </SelectItem>
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
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {arrowOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.label}
                          </SelectItem>
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
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {arrowOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Animated flow</Label>
                    <Switch
                      checked={!!selectedEdge.data.style.animated}
                      onCheckedChange={(v) => updateEdgeData(selectedEdge.id, { animated: v })}
                    />
                  </div>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground">Label style</p>
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
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs w-full"
                    onClick={() => deleteEdge(selectedEdge.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete line
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </Card>
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
      <Input
        className="h-7 w-20 text-xs font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
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
