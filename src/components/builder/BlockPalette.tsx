"use client";

import { useDiagramStore } from "@/store/diagram-store";
import { blockShapeOptions, BlockShape } from "@/types/diagram";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getShapePath } from "@/lib/diagram/shapes";
import { Plus, Trash2, Copy, Undo2, Redo2, FileJson, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BlockPaletteProps {
  onImportClick?: () => void;
  onExportClick?: () => void;
}

export function BlockPalette({ onImportClick, onExportClick }: BlockPaletteProps) {
  const addNode = useDiagramStore((s) => s.addNode);
  const clearAll = useDiagramStore((s) => s.clearAll);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const history = useDiagramStore((s) => s.history);
  const future = useDiagramStore((s) => s.future);

  const handleAdd = (shape: BlockShape) => {
    // Place in a slightly random position so multiple blocks don't overlap.
    addNode(shape, { x: 200 + Math.random() * 200, y: 160 + Math.random() * 200 });
  };

  return (
    <Card className="h-full flex flex-col p-0 overflow-hidden border-r">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Blocks</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click to add to canvas</p>
      </div>

      <div className="px-2 py-2 border-b flex flex-wrap gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={history.length === 0}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={future.length === 0}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onImportClick}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import JSON</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportClick}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export JSON</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear all</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 grid grid-cols-2 gap-2">
          {blockShapeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAdd(opt.value)}
              className="group flex flex-col items-center justify-center gap-1 rounded-md border border-border bg-background p-3 hover:bg-accent hover:border-primary/40 transition-all"
            >
              <svg width="44" height="32" className="overflow-visible">
                <path
                  d={getShapePath(opt.value, 44, 32)}
                  fill="#f8fafc"
                  stroke="#475569"
                  strokeWidth={1.5}
                  className="group-hover:stroke-primary transition-colors"
                />
              </svg>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick add</p>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => addNode("rectangle", undefined, "New Step")}
            >
              <Plus className="h-3 w-3 mr-1" /> Step
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => addNode("terminator", undefined, "Start")}
            >
              <Plus className="h-3 w-3 mr-1" /> Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => addNode("diamond", undefined, "Decision")}
            >
              <Plus className="h-3 w-3 mr-1" /> Decision
            </Button>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
