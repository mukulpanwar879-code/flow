"use client";

import { useState } from "react";
import { BlockPalette } from "./BlockPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { InspectorPanel } from "./InspectorPanel";
import { JsonDialog } from "./JsonDialog";

export function BuilderView() {
  const [dialogMode, setDialogMode] = useState<"export" | "import" | null>(null);

  return (
    <div className="h-full flex">
      {/* Left sidebar - block palette */}
      <div className="w-56 flex-shrink-0">
        <BlockPalette
          onImportClick={() => setDialogMode("import")}
          onExportClick={() => setDialogMode("export")}
        />
      </div>

      {/* Center - canvas */}
      <div className="flex-1 min-w-0">
        <BuilderCanvas />
      </div>

      {/* Right sidebar - inspector */}
      <div className="w-72 flex-shrink-0">
        <InspectorPanel />
      </div>

      <JsonDialog
        open={dialogMode !== null}
        onOpenChange={(v) => !v && setDialogMode(null)}
        mode={dialogMode ?? "export"}
      />
    </div>
  );
}
