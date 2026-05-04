"use client";

import { useEffect, useMemo, useState } from "react";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { ToggleButtons } from "../ui/toggle-buttons";
import { Dropdown } from "../ui/dropdown";
import { InputField } from "../ui/input-field";
import { InfoBox } from "../ui/info-box";
import { useProjectStore } from "../../lib/store/projectStore";
import { api } from "../../lib/api";
import type { InverterSelection } from "../../lib/types";

export function Step4Inverter() {
  const inverter = useProjectStore((state) => state.draft.inverter);
  const module = useProjectStore((state) => state.saved.module ?? state.draft.module);
  const sizing = useProjectStore((state) => state.saved.sizing ?? state.draft.sizing);
  const layout = useProjectStore((state) => state.saved.layout ?? state.draft.layout);
  const drawing = useProjectStore((state) => state.saved.drawing ?? state.draft.drawing);
  const updateInverterDraft = useProjectStore((state) => state.updateInverterDraft);
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<InverterSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    api.getInverters().then((inverters) => {
      if (mounted) setDataset(inverters);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredDataset = useMemo(() => {
    if (!searchQuery) return dataset;
    const lower = searchQuery.toLowerCase();
    return dataset.filter((i) => (i.name?.toLowerCase() || "").includes(lower));
  }, [dataset, searchQuery]);

  if (!inverter) return null;

  const modeOptions = [
    { label: "Auto Suggestion", value: "auto" },
    { label: "Manual Selection", value: "manual" }
  ];

  const resolveSystemKw = () => {
    if (!module || !sizing) return null;
    if (layout) return layout.systemSizeKw;
    if (sizing.type === "panel_count" && sizing.value) {
      return (sizing.value * module.powerW) / 1000;
    }
    if (sizing.type === "kwp" && sizing.value) {
      return sizing.value;
    }
    if (sizing.type === "kwh" && sizing.value && drawing?.location) {
      return null;
    }
    return null;
  };

  const systemKw = resolveSystemKw();

  const handleSuggest = async () => {
    if (!module || !systemKw) return;
    setLoading(true);
    try {
      const suggestion = await api.suggestInverter(systemKw, module, inverter.targetRatio ?? 1.2);
      updateInverterDraft({ ...suggestion, targetRatio: inverter.targetRatio ?? 1.2 });
    } catch (e) {
      console.error(e);
      alert("Failed to find a suitable inverter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 4 - Inverter Configuration"
        subtitle="Auto-suggest or manually define the inverter configuration."
      />
      <Card className="space-y-6">
        <ToggleButtons
          label="Configuration Mode"
          options={modeOptions}
          value={inverter.mode}
          onChange={(value) =>
            updateInverterDraft({
              ...inverter,
              mode: value as "auto" | "manual"
            })
          }
        />
        {inverter.mode === "auto" ? (
          <div className="space-y-4">
            <InfoBox
              title="Auto Configuration"
              description="The system will automatically select the best inverter based on your desired DC/AC ratio once the system size is calculated."
            />
            <div className="md:w-1/2">
              <InputField
                label="Target DC/AC Ratio"
                type="number"
                step="0.05"
                min="0.5"
                max="2.0"
                value={inverter.targetRatio ?? 1.2}
                onChange={(e) =>
                  updateInverterDraft({
                    ...inverter,
                    targetRatio: Number(e.target.value)
                  })
                }
              />
            </div>
            
            {systemKw ? (
              <button
                type="button"
                onClick={handleSuggest}
                disabled={loading || !module}
                className="rounded-none bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-none hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Calculate Inverter Now"}
              </button>
            ) : (
              <div className="rounded-none border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">System Size Unknown</p>
                <p>The system will automatically choose the inverter when the layout is generated in Step 6.</p>
              </div>
            )}
            
            {inverter.name && systemKw ? (
              <div className="rounded-none border-2 border-brand-primary bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-semibold">{inverter.name}</p>
                <p>AC Power: {inverter.acPowerW} W</p>
                <p>Calculated DC/AC Ratio: {inverter.dcAcRatio?.toFixed(2)}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <InputField
              label="Search Manufacturer / Inverter"
              placeholder="e.g., SMA, SolarEdge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dropdown
              label={`Select Inverter (${filteredDataset.length} available)`}
              value={inverter.inverterId ?? "manual"}
              onChange={(event) => {
                const selection = filteredDataset.find((item) => item.inverterId === event.target.value);
                if (selection) {
                  updateInverterDraft({
                    ...inverter,
                    inverterId: selection.inverterId,
                    name: selection.name,
                    acPowerW: selection.acPowerW
                  });
                }
              }}
            >
              <option value="manual" disabled>-- Select an Inverter --</option>
              {filteredDataset.slice(0, 500).map((item) => (
                <option key={item.inverterId} value={item.inverterId}>
                  {item.name} - {item.acPowerW}W
                </option>
              ))}
              {filteredDataset.length > 500 && (
                <option value="manual" disabled>... and {filteredDataset.length - 500} more</option>
              )}
            </Dropdown>
            
            {inverter.name ? (
              <div className="rounded-none border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mt-4">
                <p className="font-semibold">Selected Inverter Configuration</p>
                <p>Name: {inverter.name}</p>
                <p>AC Power: {inverter.acPowerW} W</p>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
