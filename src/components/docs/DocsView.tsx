"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Box, Spline, Palette, Code2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  blockShapeOptions,
  edgeTypeOptions,
  strokeStyleOptions,
  arrowOptions,
} from "@/types/diagram";
import { generateDocsPDF } from "@/lib/diagram/docs-pdf";

const projectSchemaExample = `{
  "name": "My Flowchart",
  "version": "1.0.0",
  "canvas": {
    "width": 1600,
    "height": 1000,
    "background": "#fafafa",
    "showGrid": true,
    "gridColor": "#e2e8f0",
    "gridSize": 20,
    "snapToGrid": false
  },
  "nodes": [
    {
      "id": "start",
      "type": "diagramBlock",
      "position": { "x": 80, "y": 80 },
      "data": {
        "label": "Start",
        "subtitle": "Optional helper text",
        "icon": "🚀",
        "shape": "terminator",
        "width": 160,
        "height": 60,
        "style": {
          "fill": "#dcfce7",
          "stroke": "#16a34a",
          "strokeWidth": 2,
          "textColor": "#14532d",
          "fontSize": 14,
          "fontWeight": 500,
          "fontFamily": "Inter, system-ui, sans-serif",
          "opacity": 1,
          "borderRadius": 8,
          "shadow": true
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start",
      "target": "end",
      "type": "smoothstep",
      "animated": false,
      "data": {
        "label": "yes",
        "style": {
          "stroke": "#475569",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "type": "smoothstep",
          "animated": false,
          "sourceArrow": "none",
          "targetArrow": "arrowclosed",
          "labelBgColor": "#ffffff",
          "labelTextColor": "#0f172a",
          "labelFontSize": 12
        }
      }
    }
  ]
}`;

const minimalExample = `{
  "name": "Hello Flow",
  "version": "1.0.0",
  "canvas": {
    "width": 800,
    "height": 600,
    "background": "#ffffff",
    "showGrid": false,
    "gridColor": "#e2e8f0",
    "gridSize": 20,
    "snapToGrid": false
  },
  "nodes": [
    {
      "id": "a",
      "type": "diagramBlock",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Hello",
        "shape": "circle",
        "width": 100,
        "height": 100,
        "style": {
          "fill": "#fde68a",
          "stroke": "#d97706",
          "strokeWidth": 2,
          "textColor": "#78350f",
          "fontSize": 14,
          "fontWeight": 600,
          "fontFamily": "sans-serif",
          "opacity": 1
        }
      }
    },
    {
      "id": "b",
      "type": "diagramBlock",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "World",
        "shape": "rectangle",
        "width": 140,
        "height": 80,
        "style": {
          "fill": "#bfdbfe",
          "stroke": "#2563eb",
          "strokeWidth": 2,
          "textColor": "#1e3a8a",
          "fontSize": 14,
          "fontWeight": 500,
          "fontFamily": "sans-serif",
          "opacity": 1
        }
      }
    }
  ],
  "edges": [
    {
      "id": "ab",
      "source": "a",
      "target": "b",
      "type": "smoothstep",
      "data": {
        "style": {
          "stroke": "#475569",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "type": "smoothstep",
          "animated": true,
          "sourceArrow": "none",
          "targetArrow": "arrowclosed"
        }
      }
    }
  ]
}`;

export function DocsView() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(key);
    setTimeout(() => setCopiedExample(null), 1500);
    toast.success("Copied to clipboard");
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      // Yield to the event loop so the spinner can render before the (sync) PDF work begins
      await new Promise((r) => setTimeout(r, 30));
      const blob = generateDocsPDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flowforge-docs.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded (text-based, AI-readable)");
    } catch (e) {
      toast.error(`PDF generation failed: ${(e as Error).message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="max-w-5xl mx-auto px-6 py-8 pb-20">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FileText className="h-7 w-7 text-primary" />
                JSON Schema Docs
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Build a diagram JSON file from scratch, then head to the{" "}
                <span className="font-medium text-foreground">Render</span> tab to upload it.
                The same JSON powers the visual Builder — round-trip compatible.
              </p>
            </div>
            <Button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="flex-shrink-0"
              size="sm"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {pdfLoading ? "Generating..." : "Download PDF"}
            </Button>
          </div>

          {/* PDF info banner */}
          <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">AI-readable PDF available.</span>{" "}
              The downloaded PDF is generated as a real text layer (not a screenshot), so any AI tool — ChatGPT, Claude, Gemini — can extract the full schema directly from the file.
            </div>
          </div>

          {/* Quick start */}
          <Card className="p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">Quick Start</Badge>
            </div>
            <h2 className="text-lg font-semibold mb-2">3 Steps to a Diagram</h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Create a JSON object with <code className="text-foreground bg-muted px-1 rounded">name</code>, <code className="text-foreground bg-muted px-1 rounded">canvas</code>, <code className="text-foreground bg-muted px-1 rounded">nodes</code>, and <code className="text-foreground bg-muted px-1 rounded">edges</code>.</li>
              <li>Each block lives in <code className="text-foreground bg-muted px-1 rounded">nodes[]</code> — give it a unique <code className="text-foreground bg-muted px-1 rounded">id</code>, a <code className="text-foreground bg-muted px-1 rounded">position</code>, and a <code className="text-foreground bg-muted px-1 rounded">data</code> object describing the shape &amp; style.</li>
              <li>Each connector lives in <code className="text-foreground bg-muted px-1 rounded">edges[]</code> — reference the source/target block IDs and choose a line style.</li>
            </ol>
          </Card>

          <Tabs defaultValue="schema" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="schema" className="text-xs"><Code2 className="h-3 w-3 mr-1" /> Schema</TabsTrigger>
              <TabsTrigger value="blocks" className="text-xs"><Box className="h-3 w-3 mr-1" /> Blocks</TabsTrigger>
              <TabsTrigger value="edges" className="text-xs"><Spline className="h-3 w-3 mr-1" /> Edges</TabsTrigger>
              <TabsTrigger value="examples" className="text-xs"><Palette className="h-3 w-3 mr-1" /> Examples</TabsTrigger>
            </TabsList>

            {/* Schema overview */}
            <TabsContent value="schema" className="space-y-5">
              <Card className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-primary">Top-level shape</span>
                </h3>
                <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 12 }}>
{`{
  "name":     string,    // project name (shown in header & exports)
  "version":  string,    // schema version, e.g. "1.0.0"
  "canvas":   Canvas,    // background & grid settings
  "nodes":    Node[],    // array of blocks
  "edges":    Edge[]     // array of connections
}`}
                </SyntaxHighlighter>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">Canvas object</h3>
                <FieldTable
                  rows={[
                    ["width", "number", "Logical canvas width (px)"],
                    ["height", "number", "Logical canvas height (px)"],
                    ["background", "string (hex)", "Canvas background color"],
                    ["showGrid", "boolean", "Show dotted grid in Builder"],
                    ["gridColor", "string (hex)", "Grid dot color"],
                    ["gridSize", "number", "Grid spacing in px"],
                    ["snapToGrid", "boolean", "Snap blocks to grid while dragging"],
                  ]}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">Full example</h3>
                <CodeBlock
                  code={projectSchemaExample}
                  onCopy={() => copyText(projectSchemaExample, "full")}
                  copied={copiedExample === "full"}
                />
              </Card>
            </TabsContent>

            {/* Block schema */}
            <TabsContent value="blocks" className="space-y-5">
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Node object</h3>
                <FieldTable
                  rows={[
                    ["id", "string", "Unique block identifier (used in edges)"],
                    ["type", '"diagramBlock"', "Must be exactly 'diagramBlock'"],
                    ["position", "{ x, y }", "Top-left position in canvas coords"],
                    ["data", "NodeData", "Label, shape & style (see below)"],
                  ]}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">NodeData object</h3>
                <FieldTable
                  rows={[
                    ["label", "string", "Main text shown inside the block"],
                    ["subtitle?", "string", "Optional secondary text"],
                    ["icon?", "string", "Optional emoji / glyph prefix"],
                    ["shape", "BlockShape", "One of the shapes listed below"],
                    ["width", "number", "Block width in px (min 20)"],
                    ["height", "number", "Block height in px (min 20)"],
                    ["style", "BlockStyle", "Colors, fonts, stroke (see below)"],
                  ]}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">Available shapes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {blockShapeOptions.map((s) => (
                    <div key={s.value} className="flex items-center gap-2 rounded-md border p-2">
                      <span className="text-lg">{s.icon}</span>
                      <code className="text-xs">{s.value}</code>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">BlockStyle object</h3>
                <FieldTable
                  rows={[
                    ["fill", "string (hex)", "Block background color"],
                    ["stroke", "string (hex)", "Border color"],
                    ["strokeWidth", "number", "Border thickness (0-8)"],
                    ["textColor", "string (hex)", "Label text color"],
                    ["fontSize", "number", "Label font size in px (8-32)"],
                    ["fontWeight", "number", "Font weight 300-800"],
                    ["fontFamily", "string", "Any CSS font stack"],
                    ["opacity", "number", "0 to 1"],
                    ["borderRadius?", "number", "Corner radius for rectangles"],
                    ["shadow?", "boolean", "Drop shadow on/off"],
                  ]}
                />
              </Card>
            </TabsContent>

            {/* Edge schema */}
            <TabsContent value="edges" className="space-y-5">
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Edge object</h3>
                <FieldTable
                  rows={[
                    ["id", "string", "Unique edge identifier"],
                    ["source", "string", "Source node id"],
                    ["target", "string", "Target node id"],
                    ["sourceHandle?", "string|null", "Optional: 'left'/'right' handle"],
                    ["targetHandle?", "string|null", "Optional handle on target"],
                    ["type?", "EdgeStyle", "Line geometry type"],
                    ["animated?", "boolean", "Animated flow dots"],
                    ["data", "EdgeData", "Label & style (see below)"],
                  ]}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">EdgeStyle options</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">type — line geometry</p>
                    <div className="flex flex-wrap gap-2">
                      {edgeTypeOptions.map((o) => (
                        <Badge key={o.value} variant="outline" className="font-mono text-xs">
                          {o.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">strokeStyle — line dash pattern</p>
                    <div className="flex flex-wrap gap-2">
                      {strokeStyleOptions.map((o) => (
                        <Badge key={o.value} variant="outline" className="font-mono text-xs">
                          {o.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">sourceArrow / targetArrow</p>
                    <div className="flex flex-wrap gap-2">
                      {arrowOptions.map((o) => (
                        <Badge key={o.value} variant="outline" className="font-mono text-xs">
                          {o.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">EdgeStyleProps</h3>
                <FieldTable
                  rows={[
                    ["stroke", "string (hex)", "Line color"],
                    ["strokeWidth", "number", "Line thickness 0.5-8"],
                    ["strokeStyle", "EdgeStrokeStyle", "solid | dashed | dotted"],
                    ["type", "EdgeStyle", "Geometry type (see above)"],
                    ["animated", "boolean", "Animated flow dots"],
                    ["sourceArrow", "ArrowType", "Arrow at source end"],
                    ["targetArrow", "ArrowType", "Arrow at target end"],
                    ["label?", "string", "Text label on the line"],
                    ["labelBgColor?", "string (hex)", "Label background"],
                    ["labelTextColor?", "string (hex)", "Label text color"],
                    ["labelFontSize?", "number", "Label font size in px"],
                  ]}
                />
              </Card>
            </TabsContent>

            {/* Examples */}
            <TabsContent value="examples" className="space-y-5">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Minimal example (2 blocks + 1 line)</h3>
                  <Button size="sm" variant="outline" onClick={() => copyText(minimalExample, "minimal")}>
                    {copiedExample === "minimal" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copy
                  </Button>
                </div>
                <CodeBlock code={minimalExample} />
                <p className="text-xs text-muted-foreground mt-3">
                  Copy this example and paste it into the <span className="font-medium">Render</span> tab to see it visualised.
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Full reference example</h3>
                  <Button size="sm" variant="outline" onClick={() => copyText(projectSchemaExample, "full2")}>
                    {copiedExample === "full2" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copy
                  </Button>
                </div>
                <CodeBlock code={projectSchemaExample} />
              </Card>

              <Card className="p-5 bg-amber-50 border-amber-200">
                <h3 className="font-semibold mb-2 text-amber-900">Tips</h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc pl-5">
                  <li>Node <code className="bg-amber-100 px-1 rounded">id</code> must be unique within a project.</li>
                  <li>Edge <code className="bg-amber-100 px-1 rounded">source</code> / <code className="bg-amber-100 px-1 rounded">target</code> must reference existing node ids.</li>
                  <li>All color values are hex strings (e.g. <code className="bg-amber-100 px-1 rounded">"#dcfce7"</code>).</li>
                  <li>Use <code className="bg-amber-100 px-1 rounded">"animated": true</code> on edges to show flow direction visually.</li>
                  <li>Set <code className="bg-amber-100 px-1 rounded">"showGrid": false</code> for cleaner image exports.</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-mono text-xs">Field</th>
            <th className="text-left py-2 pr-4 font-mono text-xs">Type</th>
            <th className="text-left py-2 font-normal text-xs text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([f, t, d]) => (
            <tr key={f} className="border-b last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">{f}</td>
              <td className="py-2 pr-4 font-mono text-xs text-primary">{t}</td>
              <td className="py-2 text-xs text-muted-foreground">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ code, onCopy, copied }: { code: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="relative">
      {onCopy && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 z-10 h-7"
          onClick={onCopy}
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      )}
      <SyntaxHighlighter
        language="json"
        style={vscDarkPlus}
        customStyle={{ borderRadius: 8, fontSize: 12, maxHeight: 400 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
