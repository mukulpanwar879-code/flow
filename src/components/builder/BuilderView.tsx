"use client";

import { useState } from "react";
import { BlockPalette } from "./BlockPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { InspectorPanel } from "./InspectorPanel";
import { JsonDialog } from "./JsonDialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function BuilderView() {
  const [dialogMode, setDialogMode] = useState<"export" | "import" | null>(null);

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* Left sidebar - block palette (resizable) */}
        <ResizablePanel defaultSize={18} minSize={14} maxSize={28} className="min-h-0">
          <BlockPalette
            onImportClick={() => setDialogMode("import")}
            onExportClick={() => setDialogMode("export")}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center - canvas */}
        <ResizablePanel defaultSize={58} minSize={30} className="min-h-0">
          <BuilderCanvas />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right sidebar - inspector (resizable) */}
        <ResizablePanel defaultSize={24} minSize={18} maxSize={40} className="min-h-0">
          <InspectorPanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <JsonDialog
        open={dialogMode !== null}
        onOpenChange={(v) => !v && setDialogMode(null)}
        mode={dialogMode ?? "export"}
      />
    </div>
  );
}
