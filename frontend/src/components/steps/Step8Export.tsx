"use client";

import { useState } from "react";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { InfoBox } from "../ui/info-box";
import { useProjectStore } from "../../lib/store/projectStore";
import { api } from "../../lib/api";

const exportOptions = [
  { label: "DXF", format: "dxf" },
  { label: "PDF", format: "pdf" },
  { label: "PNG", format: "png" },
  { label: "CSV", format: "csv" },
  { label: "JSON", format: "json" }
] as const;

export function Step8Export() {
  const saved = useProjectStore((state) => state.saved);
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: (typeof exportOptions)[number]["format"]) => {
    if (!saved.layout) return;
    setLoading(format);
    try {
      const payload = {
        drawing: saved.drawing,
        sizing: saved.sizing,
        module: saved.module,
        inverter: saved.inverter,
        constraints: saved.constraints,
        layout: saved.layout,
        yield: saved.yield
      };
      const blob = await api.exportProject(format, payload);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `solar-layout.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 8 - Export"
        subtitle="Download outputs for layout, reports, and project data."
      />
      <Card className="space-y-6">
        {!saved.layout ? (
          <InfoBox
            title="No layout available"
            description="Generate a layout first to enable exports."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                type="button"
                onClick={() => handleExport(option.format)}
                disabled={loading !== null}
                className="rounded-none border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-none transition hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
              >
                {loading === option.format ? `Exporting ${option.label}...` : `Export ${option.label}`}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
