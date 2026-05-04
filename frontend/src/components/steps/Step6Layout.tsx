"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { InfoBox } from "../ui/info-box";
import { useProjectStore } from "../../lib/store/projectStore";
import { api } from "../../lib/api";
import { toBackendDrawing } from "../../lib/geometry";

const DrawingMap = dynamic(() => import("../map/DrawingMap").then((mod) => mod.DrawingMap), {
  ssr: false
});

export function Step6Layout() {
  const draft = useProjectStore((state) => state.draft);
  const saved = useProjectStore((state) => state.saved);
  const layout = saved.layout ?? draft.layout;
  const setLayoutResult = useProjectStore((state) => state.setLayoutResult);
  const updateInverterDraft = useProjectStore((state) => state.updateInverterDraft);
  const saveSection = useProjectStore((state) => state.saveSection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!saved.drawing || !saved.sizing || !saved.module || !saved.constraints) {
      setError("Steps 1-5 must be saved before generating layout. Please go back and save.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const generatedLayout = await api.generateLayout(
        toBackendDrawing(saved.drawing),
        saved.sizing,
        saved.module,
        saved.constraints
      );
      setLayoutResult(generatedLayout);

      const inverterConfig = draft.inverter ?? saved.inverter;
      if (inverterConfig && inverterConfig.mode === "auto") {
        const suggestion = await api.suggestInverter(
          generatedLayout.systemSizeKw,
          saved.module,
          inverterConfig.targetRatio ?? 1.2
        );
        updateInverterDraft({
          ...suggestion,
          targetRatio: inverterConfig.targetRatio ?? 1.2
        });
        saveSection("inverter");
      }
    } catch (err) {
      setError((err as Error).message ?? "Layout generation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!saved.drawing) return null;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 6 - Layout Generation"
        subtitle="Generate and visualize panel placement based on geometry and constraints."
      />
      <Card className="space-y-4">
        {error ? (
          <div className="rounded-none border-2 border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <InfoBox
            title={layout ? "Layout Generated" : "Ready to Generate"}
            description={layout ? "You can regenerate the layout if you made changes." : "Click below to process the geometry and calculate panel placement."}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="ml-4 rounded-none bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-none hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating..." : layout ? "Regenerate Layout" : "Generate Layout"}
          </button>
        </div>

        {layout ? (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-none border-2 border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Panel Count</p>
              <p className="mt-2 text-2xl font-semibold text-slate-700">{layout.panelCount}</p>
            </div>
            <div className="rounded-none border-2 border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Coverage</p>
              <p className="mt-2 text-2xl font-semibold text-slate-700">
                {layout.coveragePercent.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-none border-2 border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">System Size</p>
              <p className="mt-2 text-2xl font-semibold text-slate-700">
                {layout.systemSizeKw.toFixed(2)} kWp
              </p>
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Layout Preview</h3>
          <DrawingMap
            drawing={saved.drawing}
            readonly={true}
            layoutPanels={layout?.panels}
          />
        </div>
      </Card>
    </div>
  );
}
