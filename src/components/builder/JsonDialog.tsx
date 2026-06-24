"use client";

import { useState, useEffect } from "react";
import { useDiagramStore } from "@/store/diagram-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Download, Upload, FileJson } from "lucide-react";
import { toast } from "sonner";
import { DiagramProject } from "@/types/diagram";

interface JsonDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "export" | "import";
}

export function JsonDialog({ open, onOpenChange, mode }: JsonDialogProps) {
  const project = useDiagramStore((s) => s.project);
  const loadProject = useDiagramStore((s) => s.loadProject);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && mode === "export") {
      setText(JSON.stringify(project, null, 2));
    } else if (open && mode === "import") {
      setText("");
    }
  }, [open, mode, project]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("JSON copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(text) as DiagramProject;
      if (!parsed.nodes || !parsed.edges || !parsed.canvas) {
        throw new Error("Missing required fields: nodes, edges, or canvas");
      }
      loadProject(parsed);
      onOpenChange(false);
      toast.success(`Loaded ${parsed.nodes.length} blocks and ${parsed.edges.length} lines`);
    } catch (e) {
      toast.error(`Invalid JSON: ${(e as Error).message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {mode === "export" ? "Export Diagram as JSON" : "Import Diagram from JSON"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="text-xs">
              {mode === "export" ? "View JSON" : "Paste JSON"}
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs" disabled={mode === "export"}>
              Upload file
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 overflow-hidden flex flex-col">
            <Textarea
              readOnly={mode === "export"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 font-mono text-xs min-h-[400px] resize-none"
              placeholder={mode === "import" ? "Paste your diagram JSON here..." : ""}
            />
            <div className="flex justify-end gap-2 mt-3">
              {mode === "export" ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={handleLoad} disabled={!text.trim()}>
                  <Upload className="h-4 w-4 mr-1" /> Load Diagram
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="file" className="flex-1">
            <label className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors p-6">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload a JSON file</p>
              <p className="text-xs text-muted-foreground mt-1">.json files accepted</p>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
