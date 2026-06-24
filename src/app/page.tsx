"use client";

import { useState } from "react";
import { BuilderView } from "@/components/builder/BuilderView";
import { DocsView } from "@/components/docs/DocsView";
import { RenderView } from "@/components/render/RenderView";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilRuler, FileText, Upload, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiagramStore } from "@/store/diagram-store";

type View = "builder" | "docs" | "render";

export default function Home() {
  const [view, setView] = useState<View>("builder");
  const projectName = useDiagramStore((s) => s.project.name);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold">
                F
              </div>
              <span className="font-semibold text-sm">FlowForge</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              / {projectName}
            </span>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as View)} className="gap-1">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="builder" className="text-xs gap-1">
                <PencilRuler className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="text-xs gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="render" className="text-xs gap-1">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Render</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
              <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">Deploy to Vercel</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {view === "builder" && <BuilderView />}
        {view === "docs" && <DocsView />}
        {view === "render" && <RenderView />}
      </main>
    </div>
  );
}
