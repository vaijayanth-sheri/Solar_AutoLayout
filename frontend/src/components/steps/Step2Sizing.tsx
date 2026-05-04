"use client";

import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { ToggleButtons } from "../ui/toggle-buttons";
import { InputField } from "../ui/input-field";
import { useProjectStore } from "../../lib/store/projectStore";

export function Step2Sizing() {
  const sizing = useProjectStore((state) => state.draft.sizing);
  const updateSizingDraft = useProjectStore((state) => state.updateSizingDraft);

  if (!sizing) return null;

  const options = [
    { label: "kWp Target", value: "kwp" },
    { label: "kWh / year", value: "kwh" },
    { label: "Panel Count", value: "panel_count" },
    { label: "Max Fill", value: "max_fill" }
  ];

  const requiresValue = sizing.type !== "max_fill";

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 2 - Sizing Intent"
        subtitle="Choose one sizing constraint for the system."
      />
      <Card className="space-y-6">
        <ToggleButtons
          label="Sizing Method"
          options={options}
          value={sizing.type}
          onChange={(value) =>
            updateSizingDraft({
              type: value as typeof sizing.type,
              value: value === "max_fill" ? null : sizing.value
            })
          }
        />
        {requiresValue ? (
          <InputField
            label="Target Value"
            type="number"
            min={0}
            value={sizing.value ?? ""}
            onChange={(event) =>
              updateSizingDraft({
                ...sizing,
                value: event.target.value === "" ? null : Number(event.target.value)
              })
            }
            hint="Provide a numeric target for this sizing method."
          />
        ) : null}
      </Card>
    </div>
  );
}
