"use client";

import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { InputField } from "../ui/input-field";
import { ToggleButtons } from "../ui/toggle-buttons";
import { useProjectStore } from "../../lib/store/projectStore";

export function Step5Constraints() {
  const constraints = useProjectStore((state) => state.draft.constraints);
  const updateConstraintsDraft = useProjectStore((state) => state.updateConstraintsDraft);

  if (!constraints) return null;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 5 - Constraints"
        subtitle="Define spacing, buffers, and thermal gaps."
      />
      <Card className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800">Module Configuration</h3>
        <ToggleButtons
          label="Module Orientation"
          options={[
            { label: "Portrait", value: "portrait" },
            { label: "Landscape", value: "landscape" }
          ]}
          value={constraints.moduleOrientation}
          onChange={(value) =>
            updateConstraintsDraft({
              ...constraints,
              moduleOrientation: value as "portrait" | "landscape"
            })
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Tilt Angle (Degrees)"
            type="number"
            min={0}
            max={90}
            value={constraints.tilt}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, tilt: Number(event.target.value) })
            }
          />
          <InputField
            label="Azimuth Angle (Degrees, 180=South)"
            type="number"
            min={0}
            max={359}
            value={constraints.azimuth}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, azimuth: Number(event.target.value) })
            }
          />
        </div>

        <div className="my-6 border-t border-slate-200"></div>
        <h3 className="text-lg font-semibold text-slate-800">Spacing & Clearances</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="X-Spacing / Panel Gap (m)"
            type="number"
            min={0}
            step={0.01}
            value={constraints.panelSpacingX}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, panelSpacingX: Number(event.target.value) })
            }
          />
          <InputField
            label="Y-Spacing / Row Pitch (m)"
            type="number"
            min={0}
            step={0.01}
            value={constraints.panelSpacingY}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, panelSpacingY: Number(event.target.value) })
            }
          />
          <InputField
            label="Edge Clearance (m)"
            type="number"
            min={0}
            step={0.1}
            value={constraints.edgeClearanceM}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, edgeClearanceM: Number(event.target.value) })
            }
          />
          <InputField
            label="Obstacle Buffer (m)"
            type="number"
            min={0}
            step={0.1}
            value={constraints.obstacleBufferM}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, obstacleBufferM: Number(event.target.value) })
            }
          />
        </div>

        <div className="my-6 border-t border-slate-200"></div>
        <h3 className="text-lg font-semibold text-slate-800">Thermal Blocks</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InputField
            label="Max Rows"
            type="number"
            min={1}
            value={constraints.thermalRows}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, thermalRows: Number(event.target.value) })
            }
          />
          <InputField
            label="Max Columns"
            type="number"
            min={1}
            value={constraints.thermalCols}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, thermalCols: Number(event.target.value) })
            }
          />
          <InputField
            label="Thermal Gap (m)"
            type="number"
            min={0}
            step={0.1}
            value={constraints.thermalGapM}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, thermalGapM: Number(event.target.value) })
            }
          />
        </div>

        <div className="my-6 border-t border-slate-200"></div>
        <h3 className="text-lg font-semibold text-slate-800">Advanced System Parameters</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="System Loss (%)"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={constraints.systemLossPercent}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, systemLossPercent: Number(event.target.value) })
            }
            hint="Default is 14%. Used for PVGIS yield accuracy."
          />
          <InputField
            label="Surface Albedo"
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={constraints.albedo}
            onChange={(event) =>
              updateConstraintsDraft({ ...constraints, albedo: Number(event.target.value) })
            }
            hint="Reflectance (0 to 1). Default is 0.2."
          />
        </div>
      </Card>
    </div>
  );
}
