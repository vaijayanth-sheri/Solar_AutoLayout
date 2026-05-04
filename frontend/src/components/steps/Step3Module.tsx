"use client";

import { useEffect, useMemo, useState } from "react";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { ToggleButtons } from "../ui/toggle-buttons";
import { Dropdown } from "../ui/dropdown";
import { InputField } from "../ui/input-field";
import { useProjectStore } from "../../lib/store/projectStore";
import type { ModuleSelection } from "../../lib/types";
import { api } from "../../lib/api";

export function Step3Module() {
  const module = useProjectStore((state) => state.draft.module);
  const updateModuleDraft = useProjectStore((state) => state.updateModuleDraft);
  const [dataset, setDataset] = useState<ModuleSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState<"dataset" | "custom">(module?.source ?? "dataset");

  const filteredDataset = useMemo(() => {
    if (!searchQuery) return dataset;
    const lower = searchQuery.toLowerCase();
    return dataset.filter((item) => 
      (item.name?.toLowerCase() || "").includes(lower) || 
      (item.manufacturer?.toLowerCase() || "").includes(lower)
    );
  }, [dataset, searchQuery]);

  useEffect(() => {
    let mounted = true;
    api.getModules().then((modules) => {
      if (mounted) {
        setDataset(modules);
        if (!module && modules[0]) {
          updateModuleDraft(modules[0]);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [module, updateModuleDraft]);

  useEffect(() => {
    if (source === "dataset" && dataset.length > 0) {
      updateModuleDraft(dataset[0]);
    }
  }, [dataset, source, updateModuleDraft]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 3 - Module Selection"
        subtitle="Select a module from the dataset or enter a custom module."
      />
      <Card className="space-y-6">
        <ToggleButtons
          label="Module Source"
          options={[
            { label: "Dataset", value: "dataset" },
            { label: "Custom", value: "custom" }
          ]}
          value={source}
          onChange={(value) => setSource(value as "dataset" | "custom")}
        />
        {source === "dataset" ? (
          <div className="space-y-4">
            <InputField
              label="Search Manufacturer or Module"
              placeholder="e.g., SunPower, LG, SPR-X22..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dropdown
              label={`Select Module (${filteredDataset.length} available)`}
              value={module?.id ?? ""}
              onChange={(event) => {
                const selection = filteredDataset.find((item) => item.id === event.target.value);
                if (selection) updateModuleDraft(selection);
              }}
            >
              <option value="" disabled>-- Select a module --</option>
              {filteredDataset.slice(0, 500).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.powerW}W
                </option>
              ))}
              {filteredDataset.length > 500 && (
                <option value="" disabled>... and {filteredDataset.length - 500} more (use search)</option>
              )}
            </Dropdown>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Module Name"
              value={module?.name ?? ""}
              onChange={(event) =>
                updateModuleDraft({
                  id: module?.id ?? "custom",
                  name: event.target.value,
                  powerW: module?.powerW ?? 0,
                  widthM: module?.widthM ?? 0,
                  heightM: module?.heightM ?? 0,
                  source: "custom"
                })
              }
            />
            <InputField
              label="Power (W)"
              type="number"
              min={0}
              value={module?.powerW ?? ""}
              onChange={(event) =>
                updateModuleDraft({
                  id: module?.id ?? "custom",
                  name: module?.name ?? "Custom Module",
                  powerW: Number(event.target.value),
                  widthM: module?.widthM ?? 0,
                  heightM: module?.heightM ?? 0,
                  source: "custom"
                })
              }
            />
            <InputField
              label="Width (m)"
              type="number"
              min={0}
              value={module?.widthM ?? ""}
              onChange={(event) =>
                updateModuleDraft({
                  id: module?.id ?? "custom",
                  name: module?.name ?? "Custom Module",
                  powerW: module?.powerW ?? 0,
                  widthM: Number(event.target.value),
                  heightM: module?.heightM ?? 0,
                  source: "custom"
                })
              }
            />
            <InputField
              label="Height (m)"
              type="number"
              min={0}
              value={module?.heightM ?? ""}
              onChange={(event) =>
                updateModuleDraft({
                  id: module?.id ?? "custom",
                  name: module?.name ?? "Custom Module",
                  powerW: module?.powerW ?? 0,
                  widthM: module?.widthM ?? 0,
                  heightM: Number(event.target.value),
                  source: "custom"
                })
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
